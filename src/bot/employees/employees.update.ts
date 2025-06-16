import { Action, Ctx, Hears, Update } from 'nestjs-telegraf';
import { EmployeesService } from './employees.service';
import { Context } from 'telegraf';

@Update()
export class EmployeesUpdate {
  constructor(private readonly employeesService: EmployeesService) {}

  @Hears('👥 Foydalanuvchilar')
  async accumulateMenu(@Ctx() ctx: Context) {
    await this.employeesService.accumulateMenu(ctx);
  }

  @Action('employee_accumulate_menu')
  async backToEmployeeMenu(@Ctx() ctx: Context) {
    await this.deleteLastMessage(ctx);
    await this.accumulateMenu(ctx);
  }

  @Action('create_employee')
  async create(@Ctx() ctx: Context) {
    await this.deleteLastMessage(ctx);
    await this.employeesService.create(ctx);
  }

  @Action(/view_employee_(.+)/)
  async viewEmployee(@Ctx() ctx: Context) {
    await this.deleteLastMessage(ctx);
    const employeeId = ctx.callbackQuery!['data'].split('_')[2];
    if (employeeId) {
      await this.employeesService.view(ctx, parseInt(employeeId, 10));
    }
  }

  @Action(/delete_employee_(.+)/)
  async deleteEmployee(@Ctx() ctx: Context) {
    await this.deleteLastMessage(ctx);
    const employeeId = ctx.callbackQuery!['data'].split('_')[2];
    if (employeeId) {
      await this.employeesService.delete(ctx, parseInt(employeeId, 10));
    }
  }

  @Action(/edit_employee_(.+)/)
  async editEmployee(@Ctx() ctx: Context) {
    await this.deleteLastMessage(ctx);
    const employeeId = ctx.callbackQuery!['data'].split('_')[2];
    if (employeeId) {
      await this.employeesService.edit(ctx, parseInt(employeeId, 10));
    }
  }

  private async deleteLastMessage(ctx: Context) {
    const message = ctx.callbackQuery?.message;
    if (message && message.message_id) {
      await ctx.telegram.deleteMessage(ctx.chat?.id!, message.message_id);
    }
  }
}
