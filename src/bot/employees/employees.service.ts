import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Employee } from '../models/employees.model';
import { BotService } from '../bot.service';
import { User } from '../models/users.model';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee) private employeeModel: typeof Employee,
    @InjectModel(User) private userModele: typeof User,
  ) {}
  async findAll(): Promise<Employee[] | null> {
    const employees = await this.employeeModel.findAll({});

    if (employees.length > 0) {
      return employees;
    }

    return null;
  }

  async accumulateMenu(ctx: any) {
    const employees = await this.findAll();

    const inlineKeyboard: any[] = [];
    const buttonInfo: any[] = [];
    if (employees && employees.length > 0) {
      for (let i = 0; i < employees.length; i++) {
        const employee = employees[i];

        buttonInfo.push({
          text: `${employee.name || 'Barcha foydalanuvchi'} `,
          callback_data: `view_employee_${employee.id}`,
        });

        if (buttonInfo.length === 2 || i === employees.length - 1) {
          console.log(buttonInfo);
          inlineKeyboard.push([...buttonInfo]);
          buttonInfo.length = 0;
        }
      }
    }

    inlineKeyboard.push([
      {
        text: '➕ Yangi foydalanuvchi qo‘shish',
        callback_data: 'create_employee',
      },
      {
        text: '🔙 Orqaga',
        callback_data: 'main_menu',
      },
    ]);

    await ctx.reply('👥 Foydalanuvchilar', {
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    });
  }

  async create(ctx: any) {
    await ctx.sendChatAction('typing');

    const employee = await this.employeeModel.create({});

    await ctx.reply(
      "📝 <b>Foydalanuvchi nomini kiriting:</b>\n(Masalan: 'Ali', 'Vali')",
      {
        parse_mode: 'HTML',
      },
    );

    await this.userModele.update(
      { last_state: `waiting_for_employee_name_${employee.id}` },
      { where: { user_id: ctx.from?.id } },
    );
  }

  async view(ctx: any, employeeId: number) {
    const employee = await this.employeeModel.findByPk(employeeId);

    if (!employee) {
      await ctx.reply('❌ Foydalanuvchi topilmadi.');
      return;
    }

    await ctx.sendChatAction('typing');

    // Sana formatlash (agar kerak bo‘lsa)
    const birthdateFormatted = new Date(employee.birthday).toLocaleDateString(
      'uz-UZ',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
    );

    await ctx.replyWithHTML(
      `👤 <b>Foydalanuvchi ma'lumotlari</b>\n\n` +
        `<b>Ismi:</b> ${employee.name}\n` +
        `<b>ID:</b> <code>${employee.id}</code>\n` +
        `<b>Tug‘ilgan sana:</b> ${birthdateFormatted}`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '✏️ Tahrirlash',
                callback_data: `edit_employee_${employee.id}`,
              },
              {
                text: '❌ O‘chirish',
                callback_data: `delete_employee_${employee.id}`,
              },
            ],
            [{ text: '🔙 Orqaga', callback_data: 'employee_accumulate_menu' }],
          ],
        },
      },
    );
  }

  async delete(ctx: any, employeeId: number) {
    await ctx.sendChatAction('typing');

    const employee = await this.employeeModel.findByPk(employeeId);

    if (!employee) {
      await ctx.replyWithHTML('❌ <b>Foydalanuvchi topilmadi.</b>');
      return;
    }

    const name = employee.name;

    await employee.destroy();

    await ctx.replyWithHTML(`✅ <b>${name}</b> muvaffaqiyatli o‘chirildi.`);

    await this.accumulateMenu(ctx);
  }

  async edit(ctx: any, employeeId: number) {
    const employee = await this.employeeModel.findByPk(employeeId);

    if (!employee) {
      await ctx.replyWithHTML('❌ <b>Foydalanuvchi topilmadi.</b>');
      return;
    }

    await ctx.sendChatAction('typing');

    await ctx.replyWithHTML(
      `📝 <b>Foydalanuvchi ismini o‘zgartiring:</b>\n\n<b>Joriy ismi:</b> ${employee.name}\n`,
      {
        parse_mode: 'HTML',
      },
    );

    await this.userModele.update(
      {
        last_state: `waiting_for_employee_name_change_${employee.id}`,
      },
      {
        where: { user_id: ctx.from?.id },
      },
    );
  }
}
