import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Collection } from '../models/collections.model';
import { InjectModel } from '@nestjs/sequelize';
import { Context } from 'telegraf';
import { User } from '../models/users.model';
import { EmployeesService } from '../employees/employees.service';
import { CollectionEmployee } from '../models/collection-employee.model';
import { Employee } from '../models/employees.model';
import { BotService } from '../bot.service';
import { on } from 'events';
import { IS_ASCII } from 'class-validator';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(Collection) private readonly model: typeof Collection,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Collection)
    private readonly collectionModel: typeof Collection,
    @InjectModel(CollectionEmployee)
    private readonly collectionEmployeeModel: typeof CollectionEmployee,
    @Inject(forwardRef(() => EmployeesService))
    private readonly employeeService: EmployeesService,
    private readonly botService: BotService,
    private readonly sequelize: Sequelize,
  ) {}

  async findAll(): Promise<Collection[] | null> {
    const collections = await this.model.findAll({});

    return collections.length > 0 ? collections : null;
  }

  async create(ctx: Context) {
    const message = ctx.callbackQuery?.message;

    if (message && message.message_id) {
      await ctx.telegram.deleteMessage(ctx.chat?.id!, message.message_id);
    }
    await ctx.sendChatAction('typing');

    const collection = await this.collectionModel.create({});

    await this.userModel.update(
      { last_state: `waiting_for_collection_name_${collection.id}` },
      { where: { user_id: ctx.from?.id } },
    );

    await ctx.reply(
      "📝 <b>Yig‘im nomini kiriting:</b>\n(Masalan: 'Sinf jamg‘armasi', 'Ali tug‘ilgan kuni')",
      {
        parse_mode: 'HTML',
      },
    );
  }

  async accumalateMenu(ctx: Context) {
    const collections = await this.findAll();

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

  async delete(ctx: Context) {
    const message = ctx.callbackQuery?.message;

    if (message && message.message_id) {
      await ctx.telegram.deleteMessage(ctx.chat?.id!, message.message_id);
    }

    const messageData = ctx.callbackQuery!['data'];

    const collectionId = messageData.split('_')[2];
    if (!collectionId) return;

    const collection = await this.model.findByPk(collectionId);
    if (!collection) return;

    await collection.destroy();

    await this.accumalateMenu(ctx);
  }

  async view(ctx: Context, collectionId: number) {
    const collection = await this.collectionModel.findByPk(collectionId);

    if (!collection) {
      await ctx.reply('❗️ <b>Yig‘im topilmadi.</b>', {
        parse_mode: 'HTML',
      });
      return;
    }

    const inlineKeyboard: any[] = [];
    const buttonInfo: any[] = [];

    const bindings = await this.collectionEmployeeModel.findAll({
      where: {
        collection_id: collectionId,
        is_active: true,
      },
    });

    for (let i = 0; i < bindings.length; i++) {
      const binding = bindings[i];

      const name = await this.sequelize.query(
        'SELECT name FROM employees WHERE id=:id',
        {
          type: QueryTypes.SELECT,
          replacements: {
            id: binding.user_id,
          },
        },
      );

      buttonInfo.push({
        text: `${binding.is_paid ? '✅' : '❌'} ${'name' in name[0] ? name[0].name : 'Unknown'}  `,
        callback_data: `toggle_employee_${binding.user_id}_${collectionId}`,
      });

      if (buttonInfo.length === 2 || i === bindings.length - 1) {
        inlineKeyboard.push([...buttonInfo]);
        buttonInfo.length = 0;
      }
    }

    inlineKeyboard.push([
      {
        text: '🔙 Orqaga',
        callback_data: `collection_menu`,
      },
    ]);

    await ctx.reply(`📊 <b> Yig‘imga bog‘langan foydalanuvchilar:</b>`, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    });
  }

  async acceptCollection(ctx: Context, collectionId: number) {
    const collection = await this.collectionModel.findByPk(collectionId);
    if (!collection) {
      await ctx.replyWithHTML("❌ <b>Yig'im topilmadi.</b>");
      return;
    }

    const activeEmployees = await this.collectionEmployeeModel.findAll({
      where: {
        collection_id: collectionId,
        is_paid: true,
      },
    });

    if (activeEmployees.length === 0) {
      await ctx.replyWithHTML(
        '⚠️ <b>Hech qanday foydalanuvchi tanlanmagan. Iltimos, kamida bitta foydalanuvchini tanlang.</b>',
      );
      return;
    }

    await this.accumalateMenu(ctx);
  }

  async cancelCollection(ctx: Context, collectionId: number) {
    const collection = await this.collectionModel.findByPk(collectionId);

    if (!collection) return;
    else if (collection) {
      await this.collectionModel.destroy({ where: { id: collectionId } });
      await this.collectionEmployeeModel.destroy({
        where: { collection_id: collectionId },
      });
    }

    await this.accumalateMenu(ctx);
  }

  async toggleCollectionBinding(
    ctx: Context,
    employeeId: number,
    collectionId: number,
  ) {
    const existing = await this.collectionEmployeeModel.findOne({
      where: {
        user_id: employeeId,
        collection_id: collectionId,
      },
    });

    let isActive: any = existing?.is_active;

    if (isActive) {
      await this.collectionEmployeeModel.update(
        { is_active: false },
        {
          where: {
            user_id: employeeId,
            collection_id: collectionId,
          },
        },
      );
    } else {
      await this.collectionEmployeeModel.update(
        { is_active: true },
        {
          where: {
            user_id: employeeId,
            collection_id: collectionId,
          },
        },
      );
    }

    const employees = await this.employeeService.findAll();

    if (!employees) return;

    //

    const inlineKeyboard: any[] = [];
    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];

      const binding = await this.collectionEmployeeModel.findOne({
        where: {
          collection_id: collectionId,
          user_id: employee.id,
        },
      });

      if (binding) {
        inlineKeyboard.push([
          {
            text: `${binding.is_active ? '✅' : '❌'} ${employee.name}`,
            callback_data: `toggle_collection_binding_${employee.id}_${collectionId}`,
          },
        ]);
      }
    }

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
  }

  async finalizeCollection(ctx: Context, collectionId: number) {
    const collection = await this.collectionModel.findByPk(collectionId);

    if (!collection) return;

    await this.collectionModel.update(
      {
        is_finilized: true,
      },
      {
        where: {
          id: collectionId,
        },
      },
    );

    await this.accumalateMenu(ctx);
  }
}
