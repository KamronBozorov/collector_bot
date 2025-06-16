import { Injectable } from '@nestjs/common';
import { Collection } from '../models/collections.model';
import { InjectModel } from '@nestjs/sequelize';
import { Context } from 'telegraf';
import { User } from '../models/users.model';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(Collection) private readonly model: typeof Collection,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Collection)
    private readonly collectionModel: typeof Collection,
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
          {
            text: '❌ O‘chirish',
            callback_data: `delete_collection_${collection.id}`,
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
}
