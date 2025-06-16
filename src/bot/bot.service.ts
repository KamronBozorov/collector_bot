import { Injectable } from '@nestjs/common';
import { Context, Markup } from 'telegraf';
import { User } from './models/users.model';
import { InjectModel } from '@nestjs/sequelize';
import { Collection } from './models/collections.model';
import { CollectionsService } from './collections/collections.service';
import { Employee } from './models/employees.model';

@Injectable()
export class BotService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Employee) private readonly employeeModel: typeof Employee,
    @InjectModel(Collection)
    private readonly collectionModel: typeof Collection,
  ) {}
  async start(ctx: Context) {
    await ctx.sendChatAction('typing');
    console.log(ctx.from?.id);

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

          await ctx.replyWithHTML(`✅ <b>Yig‘im muvaffaqiyatli yaratildi!</b>`);
          await this.userModel.update(
            { last_state: 'main_menu' },
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
          break;

        case lastState.startsWith('waiting_for_employee_name_change_'):
          const editEmployeeId = lastState.split('_')[5];
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

            await ctx.replyWithHTML(
              `✅ <b>Foydalanuvchi ma'lumotlari yangilandi!</b>`,
            );
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
}
