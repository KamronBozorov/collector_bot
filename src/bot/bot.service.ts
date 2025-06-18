import { Injectable } from '@nestjs/common';
import { Context, Markup } from 'telegraf';
import { User } from './models/users.model';
import { InjectModel } from '@nestjs/sequelize';
import { Collection } from './models/collections.model';
import { Employee } from './models/employees.model';
import { CollectionEmployee } from './models/collection-employee.model';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';

Sequelize;
@Injectable()
export class BotService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Employee) private readonly employeeModel: typeof Employee,
    @InjectModel(Collection)
    private readonly collectionModel: typeof Collection,
    @InjectModel(CollectionEmployee)
    private readonly collectionEmployeeModel: typeof CollectionEmployee,
    private readonly sequelize: Sequelize,
  ) {}
  async start(ctx: Context) {
    await ctx.sendChatAction('typing');

    await ctx.reply("📋 <b>Kerakli bo'limni tanlang:</b>", {
      parse_mode: 'HTML',
      ...Markup.keyboard([["💰 Pul yig'ish", '👥 Foydalanuvchilar']])
        .resize()
        .oneTime(),
    });
  }

  async onText(ctx: Context) {
    if (!('text' in ctx.message!)) return;

    try {
      const user = await this.userModel.findOne({
        where: { user_id: ctx.from?.id },
      });

      if (!user) {
        await ctx.replyWithHTML(
          `❌ <b>Iltimos, ro'yxatdan o'ting yoki botni qayta ishga tushiring.</b>`,
          {
            ...Markup.removeKeyboard(),
          },
        );
        return;
      }

      const userInput = ctx.message.text;
      const lastState = user.last_state;

      switch (true) {
        case lastState.startsWith('waiting_for_collection_name_'): {
          const collectionId = lastState.split('_')[4];
          if (!collectionId) {
            await ctx.replyWithHTML(`⚠️ <b>Yig‘im ID topilmadi.</b>`);
            await this.userModel.update(
              { last_state: 'main_menu' },
              { where: { user_id: ctx.from?.id } },
            );
            return;
          }

          await this.collectionModel.update(
            { name: userInput },
            { where: { id: collectionId } },
          );

          await this.userModel.update(
            {
              last_state: `waiting_for_collection_amount_${collectionId}`,
            },
            { where: { user_id: ctx.from?.id } },
          );

          await ctx.replyWithHTML(`💰 <b>Endi yig‘im summasini kiriting:</b>`);
          break;
        }

        //case lastState.startsWith('waiting_for_collection_amount_'): {
        //  const collectionId = lastState.split('_')[4];
        //
        //  if (!collectionId) {
        //    await ctx.replyWithHTML(`⚠️ <b>Yig‘im ID topilmadi.</b>`);
        //    await this.userModel.update(
        //      { last_state: 'main_menu' },
        //      { where: { user_id: ctx.from?.id } },
        //    );
        //    return;
        //  }
        //
        //  const amount = parseFloat(userInput);
        //  if (isNaN(amount) || amount < 0) {
        //    await ctx.replyWithHTML(
        //      `🚫 <b>Iltimos, to‘g‘ri summa kiriting.</b>`,
        //    );
        //    return;
        //  }
        //
        //  await this.collectionModel.update(
        //    { amount: amount },
        //    { where: { id: collectionId } },
        //  );
        //
        //  const employees = await this.employeeModel.findAll();
        //
        //  if (employees.length === 0) {
        //    await ctx.replyWithHTML(
        //      `⚠️ <b>Hozirda hech qanday foydalanuvchi mavjud emas. Iltimos, avval foydalanuvchi qo‘shing.</b>`,
        //    );
        //    await this.userModel.update(
        //      { last_state: 'main_menu' },
        //      { where: { user_id: ctx.from?.id } },
        //    );
        //    return;
        //  }
        //
        //  const inlineKeyboard = employees.map((employee) => [
        //    {
        //      text: `✅ ${employee.name}`,
        //      callback_data: `toggle_collection_binding_${employee.id}_${collectionId}`,
        //    },
        //  ]);
        //
        //  inlineKeyboard.push([
        //    {
        //      text: '🟢 Yig‘imni yakunlash',
        //      callback_data: `finalize_collection_${collectionId}`,
        //    },
        //  ]);
        //
        //  await ctx.replyWithHTML(
        //    `<b>Quyidagi foydalanuvchilardan kimni ushbu yig‘imga biriktirmoqchisiz?</b>\nBosish orqali tanlang:`,
        //    {
        //      reply_markup: {
        //        inline_keyboard: inlineKeyboard,
        //      },
        //    },
        //  );
        //
        //  await this.userModel.update(
        //    { last_state: `binding_collection_users_${collectionId}` },
        //    { where: { user_id: ctx.from?.id } },
        //  );
        //
        //  break;
        //}

        case lastState.startsWith('waiting_for_collection_amount_'): {
          const collectionId = lastState.split('_')[4];
          if (!collectionId) {
            await ctx.replyWithHTML(`⚠️ <b>Yig‘im ID topilmadi.</b>`);
            await this.userModel.update(
              { last_state: 'main_menu' },
              { where: { user_id: ctx.from?.id } },
            );
            return;
          }

          const amount = parseFloat(userInput);
          if (isNaN(amount) || amount < 0) {
            await ctx.replyWithHTML(
              `🚫 <b>Iltimos, to‘g‘ri summa kiriting.</b>`,
            );
            return;
          }

          await this.collectionModel.update(
            { amount: amount },
            { where: { id: collectionId } },
          );

          const employees = await this.employeeModel.findAll();

          if (employees.length === 0) {
            await ctx.replyWithHTML(
              `⚠️ <b>Hozirda hech qanday foydalanuvchi mavjud emas. Iltimos, avval foydalanuvchi qo'shing.</b>`,
            );
            await this.userModel.update(
              { last_state: 'main_menu' },
              { where: { user_id: ctx.from?.id } },
            );
            return;
          }
          const creating: any[] = [];

          for (const employee of employees) {
            creating.push({
              user_id: employee.id,
              collection_id: collectionId,
              is_paid: false,
            });
          }

          const bindings =
            await this.collectionEmployeeModel.bulkCreate(creating);

          let inlineKeyboard: any[] = [];

          const button = bindings.map(async (binding) => {
            const name = await this.sequelize.query(
              `SELECT e.name FROM employees e WHERE id=:id`,
              {
                type: QueryTypes.SELECT,
                replacements: { id: binding.user_id },
              },
            );

            return {
              text: `${binding.is_active ? '✅' : '❌'} ${'name' in name[0] ? name[0].name : 'Kamron'}`,
              callback_data: `toggle_collection_binding_${binding.user_id}_${binding.collection_id}`,
            };
          });

          inlineKeyboard.push([...(await Promise.all(button))]);

          inlineKeyboard.push([
            {
              text: '🟢 Yig‘imni yakunlash',
              callback_data: `finalize_collection_${collectionId}`,
            },
          ]);

          await ctx.replyWithHTML(
            `<b>Quyidagi foydalanuvchilardan kimni ushbu yig‘imga biriktirmoqchisiz?</b>\nBosish orqali tanlang:`,
            {
              reply_markup: {
                inline_keyboard: inlineKeyboard,
              },
            },
          );

          await this.userModel.update(
            { last_state: `main_menu` },
            { where: { user_id: ctx.from?.id } },
          );

          break;
        }

        case lastState.startsWith('waiting_for_employee_name_'):
          const employeeId = lastState.split('_')[4];

          if (!employeeId) {
            await ctx.replyWithHTML(`⚠️ <b>Foydalanuvchi ID topilmadi.</b>`);
            await this.userModel.update(
              { last_state: 'main_menu' },
              { where: { user_id: ctx.from?.id } },
            );
            return;
          } else {
            await this.employeeModel.update(
              { name: userInput },
              { where: { id: employeeId } },
            );

            await this.userModel.update(
              {
                last_state: `waiting_for_employee_birthday_${employeeId}`,
              },
              { where: { user_id: ctx.from?.id } },
            );

            await ctx.replyWithHTML(
              `💰 <b>Endi foydalanuvchi tug'ilgan sanasini kiriting:</b>\n(Masalan: '1990-01-01')`,
            );
          }
          break;

        case lastState.startsWith('waiting_for_employee_birthday_'):
          const empId = lastState.split('_')[4];
          if (!empId) {
            await ctx.replyWithHTML(`⚠️ <b>Foydalanuvchi ID topilmadi.</b>`);
            await this.userModel.update(
              { last_state: 'main_menu' },
              { where: { user_id: ctx.from?.id } },
            );
            return;
          }

          const birthday = new Date(userInput);
          if (isNaN(birthday.getTime())) {
            await ctx.replyWithHTML(
              `🚫 <b>Iltimos, to‘g‘ri sana formatini kiriting (YYYY-MM-DD).</b>`,
            );
            return;
          }

          await this.employeeModel.update(
            { birthday: birthday },
            { where: { id: empId } },
          );

          await ctx.replyWithHTML(
            `✅ <b>Foydalanuvchi muvaffaqiyatli yaratildi!</b>`,
          );

          await this.userModel.update(
            { last_state: 'main_menu' },
            { where: { user_id: ctx.from?.id } },
          );

          await this.accumulateMenu(ctx);
          break;

        case lastState.startsWith('change_employee_name_'):
          const editEmployeeId = lastState.split('_')[3];
          if (!editEmployeeId) {
            await ctx.replyWithHTML(`⚠️ <b>Foydalanuvchi ID topilmadi.</b>`);
            await this.userModel.update(
              { last_state: 'main_menu' },
              { where: { user_id: ctx.from?.id } },
            );
            return;
          } else {
            await this.employeeModel.update(
              { name: userInput },
              { where: { id: editEmployeeId } },
            );

            await this.userModel.update(
              {
                last_state: `change_employee_birthday_${editEmployeeId}`,
              },
              { where: { user_id: ctx.from?.id } },
            );

            await ctx.replyWithHTML(
              `💰 <b>Endi foydalanuvchi tug'ilgan sanasini kiriting:</b>\n(Masalan: '1990-01-01')`,
            );
          }
          break;

        case lastState.startsWith('change_employee_birthday_'):
          const editEmpId = lastState.split('_')[3];
          if (!editEmpId) {
            await ctx.replyWithHTML(`⚠️ <b>Foydalanuvchi ID topilmadi.</b>`);
            await this.userModel.update(
              { last_state: 'main_menu' },
              { where: { user_id: ctx.from?.id } },
            );
            return;
          } else {
            const birthdayChange = new Date(userInput);
            if (isNaN(birthdayChange.getTime())) {
              await ctx.replyWithHTML(
                `🚫 <b>Iltimos, to‘g‘ri sana formatini kiriting (YYYY-MM-DD).</b>`,
              );
              return;
            }

            await this.employeeModel.update(
              { birthday: birthdayChange },
              { where: { id: editEmpId } },
            );

            await ctx.replyWithHTML(
              `✅ <b>Foydalanuvchi muvaffaqiyatli tahrirlandi!</b>`,
            );

            await this.accumulateMenu(ctx);
            await this.userModel.update(
              { last_state: 'main_menu' },
              { where: { user_id: ctx.from?.id } },
            );
          }
          break;

        default: {
          await ctx.replyWithHTML(
            `🤷‍♂️ <b>Kutilmagan holat. Bosh menyuga qaytdik.</b>`,
          );
          await this.userModel.update(
            { last_state: 'main_menu' },
            { where: { user_id: ctx.from?.id } },
          );
          break;
        }
      }
    } catch (error) {
      console.error(`Error on text:`, error);
      await ctx.replyWithHTML(
        `❗️ <b>Xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring.</b>`,
      );
    }
  }

  async accumulateMenu(ctx: any) {
    const employees = await this.employeeModel.findAll();

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

    await ctx.reply('👥 <b> Foydalanuvchilar </b>\n\n', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    });
  }

  async accumalateMenuCollection(ctx: Context) {
    const collections = await this.collectionModel.findAll();

    const inlineKeyboard: any[] = [];
    if (collections && collections.length > 0) {
      const collectionButtons = collections.map((collection) => {
        return [
          {
            text: `${collection.name || 'Yig‘im'} - ${collection.amount || 0} so‘m`,
            callback_data: `view_collection_${collection.id}`,
          },
        ];
      });

      inlineKeyboard.push(...collectionButtons);
    }

    await ctx.reply(
      '💰 <b>Yig‘imlar bo‘limi</b>\nQuyidagilardan birini tanlang:',
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            ...inlineKeyboard,
            [
              {
                text: '➕ Yangi yig‘im yaratish',
                callback_data: 'create_collection',
              },
              {
                text: '🔙 Asosiy menyu',
                callback_data: 'main_menu',
              },
            ],
          ],
        },
      },
    );
  }
}
