import { Cron } from '@nestjs/schedule';
import { Action, Ctx, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async start(@Ctx() ctx: Context) {
    if (await this.botService.isNotAuthorized(ctx)) {
      await ctx.reply('🚫 Siz ushbu botdan foydalana olmaysiz.');
      return;
    }
    await this.botService.start(ctx);
  }

  @Cron('0 0 6 * * *', {
    timeZone: 'Asia/Tashkent',
  })
  async handleCron() {
    await this.botService.handleCron();
  }

  @On('text')
  async on(@Ctx() ctx: Context) {
    if (await this.botService.isNotAuthorized(ctx)) {
      await ctx.reply('🚫 Siz ushbu botdan foydalana olmaysiz.');
      return;
    }
    await this.botService.onText(ctx);
  }

  @Action('main_menu')
  async mainMenu(@Ctx() ctx: Context) {
    if (await this.botService.isNotAuthorized(ctx)) {
      await ctx.reply('🚫 Siz ushbu botdan foydalana olmaysiz.');
      return;
    }
    const message = ctx.callbackQuery?.message;
    await ctx.telegram.deleteMessage(ctx.chat?.id!, message?.message_id!);

    await this.botService.start(ctx);
  }
}
