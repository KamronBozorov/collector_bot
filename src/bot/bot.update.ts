import { Update, Ctx, Start, Help, On, Hears } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}
  @Start()
  async start(@Ctx() ctx: Context) {
    await this.botService.start(ctx);
  }

  @Hears("💰 Pul yig'ish")
  async acumulate(@Ctx() ctx: Context) {
    await this.botService.accumalateMenu(ctx);
  }

  @Help()
  async help(@Ctx() ctx: Context) {
    await ctx.reply('Send me a sticker');
  }

  @On('sticker')
  async on(@Ctx() ctx: Context) {
    await ctx.reply('👍');
  }

  @Hears('hi')
  async hears(@Ctx() ctx: Context) {
    await ctx.reply('Hey there');
  }
}
