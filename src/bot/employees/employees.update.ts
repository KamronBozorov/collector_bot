import { Action, Ctx, Hears, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotService } from '../bot.service';
import { EmployeesService } from './employees.service';

@Update()
export class EmployeesUpdate {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly botService: BotService,
  ) {}

  @Hears('👥 Foydalanuvchilar')
  async accumulateMenu(@Ctx() ctx: Context) {
    if (await this.botService.isNotAuthorized(ctx)) {
      await ctx.reply('🚫 Siz ushbu botdan foydalana olmaysiz.');
      return;
    }
    await this.employeesService.accumulateMenu(ctx);
  }

  @Action('employee_accumulate_menu')
  async backToEmployeeMenu(@Ctx() ctx: Context) {
    if (await this.botService.isNotAuthorized(ctx)) {
      await ctx.reply('🚫 Siz ushbu botdan foydalana olmaysiz.');
      return;
    }
    await this.deleteLastMessage(ctx);
    await this.accumulateMenu(ctx);
  }

  @Action('create_employee')
  async create(@Ctx() ctx: Context) {
    if (await this.botService.isNotAuthorized(ctx)) {
      await ctx.reply('🚫 Siz ushbu botdan foydalana olmaysiz.');
      return;
    }
    await this.deleteLastMessage(ctx);
    await this.employeesService.create(ctx);
  }

  @Action(/view_employee_(.+)/)
  async viewEmployee(@Ctx() ctx: Context) {
    if (await this.botService.isNotAuthorized(ctx)) {
      await ctx.reply('🚫 Siz ushbu botdan foydalana olmaysiz.');
      return;
    }
    await this.deleteLastMessage(ctx);
    const employeeId = ctx.callbackQuery!['data'].split('_')[2];
    if (employeeId) {
      await this.employeesService.view(ctx, parseInt(employeeId, 10));
    }
  }

  @Action(/delete_employee_(.+)/)
  async deleteEmployee(@Ctx() ctx: Context) {
    if (await this.botService.isNotAuthorized(ctx)) {
      await ctx.reply('🚫 Siz ushbu botdan foydalana olmaysiz.');
      return;
    }
    await this.deleteLastMessage(ctx);
    const employeeId = ctx.callbackQuery!['data'].split('_')[2];
    if (employeeId) {
      await this.employeesService.delete(ctx, parseInt(employeeId, 10));
    }
  }

  @Action(/edit_employee_(.+)/)
  async editEmployee(@Ctx() ctx: Context) {
    if (await this.botService.isNotAuthorized(ctx)) {
      await ctx.reply('🚫 Siz ushbu botdan foydalana olmaysiz.');
      return;
    }
    await this.deleteLastMessage(ctx);
    const employeeId = ctx.callbackQuery!['data'].split('_')[2];
    if (employeeId) {
      await this.employeesService.edit(ctx, parseInt(employeeId, 10));
    }
  }

  @Action(/toggle_employee_(.+)_(.+)/)
  async toggleEmployee(@Ctx() ctx: Context) {
    if (await this.botService.isNotAuthorized(ctx)) {
      await ctx.reply('🚫 Siz ushbu botdan foydalana olmaysiz.');
      return;
    }
    const [employeeId, collectionId] = ctx
      .callbackQuery!['data'].split('_')
      .slice(2);
    if (employeeId && collectionId) {
      await this.employeesService.toggleEmployee(
        ctx,
        parseInt(employeeId, 10),
        parseInt(collectionId, 10),
      );
    }
  }

  //@Action(/add_employee_to_collection_(.+)_(.+)/)
  //async addEmployeeToCollection(@Ctx() ctx: Context) {
  //  const employeeId = ctx.callbackQuery!['data'].split('_')[4];
  //  const collectionId = ctx.callbackQuery!['data'].split('_')[5];
  //
  //  if (employeeId && collectionId) {
  //    await this.employeesService.addEmpyloyeeToCollection(
  //      ctx,
  //      parseInt(employeeId, 10),
  //      parseInt(collectionId, 10),
  //    );
  //  }
  //}
  //
  //@Action(/configure_(.+)_employee_(.+)/)
  //async configureEmployee(@Ctx() ctx: Context) {
  //  await this.deleteLastMessage(ctx);
  //  const type = ctx.callbackQuery!['data'].split('_')[1];
  //  const empId = ctx.callbackQuery!['data'].split('_')[3];
  //
  //  if (type && empId) {
  //    await this.employeesService.configureEmployee(ctx, type, empId);
  //  }
  //}

  private async deleteLastMessage(ctx: Context) {
    const message = ctx.callbackQuery?.message;
    if (message && message.message_id) {
      await ctx.telegram.deleteMessage(ctx.chat?.id!, message.message_id);
    }
  }
}
