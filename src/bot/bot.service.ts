import { Injectable } from '@nestjs/common';
import { Context, Markup } from 'telegraf';

@Injectable()
export class BotService {
  async start(ctx: Context) {
    await ctx.sendChatAction('typing');

    await ctx.reply("<b>Kerakli bo'limni tanlang:</b>", {
      parse_mode: 'HTML',
      ...Markup.keyboard([["💰 Pul yig'ish"]])
        .resize()
        .oneTime(true),
    });
  }

  async accumalateMenu(ctx: Context) {
    await ctx.sendChatAction('typing');

    await ctx.reply("<b>Yig'ish bo'limi</b>", {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Yangi yig'ish yaratish",
              callback_data: 'create_collection',
            },
          ],
        ],
      },
    });
  }
}
