import { Update, Ctx, Start, Help, On, Hears, Action } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}
  @Start()
  async start(@Ctx() ctx: Context) {
    console.log('Bot started');
    await this.botService.start(ctx);
  }

  @On('text')
  async on(@Ctx() ctx: Context) {
    await this.botService.onText(ctx);
  }

  @Action('main_menu')
  async mainMenu(@Ctx() ctx: Context) {
    const message = ctx.callbackQuery?.message;
    await ctx.telegram.deleteMessage(ctx.chat?.id!, message?.message_id!);

    await this.botService.start(ctx);
  }
}
