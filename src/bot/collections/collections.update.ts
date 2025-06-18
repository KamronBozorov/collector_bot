import { Action, Ctx, Hears, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { CollectionsService } from './collections.service';

interface CustomContext extends Context {
  session?: {
    waitingFor?: string;
    collectionName?: string;
  };
}

@Update()
export class CollectionsUpdate {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Action('create_collection')
  async createCollection(@Ctx() ctx: CustomContext) {
    await this.collectionsService.create(ctx);
  }

  @Action(/delete_collection_(.+)/)
  async deleteCollection(@Ctx() ctx: CustomContext) {
    await this.deleteLastMessage(ctx);
    await this.collectionsService.delete(ctx);
  }

  @Hears("💰 Pul yig'ish")
  async acumulate(@Ctx() ctx: Context) {
    await this.collectionsService.accumalateMenu(ctx);
  }

  @Action(/collection_menu/)
  async collectionMenu(@Ctx() ctx: Context) {
    await this.deleteLastMessage(ctx);
    await this.collectionsService.accumalateMenu(ctx);
  }

  @Action(/^view_collection_(.+)/)
  async viewCollection(@Ctx() ctx: CustomContext) {
    await this.deleteLastMessage(ctx);
    const collectionId = ctx.callbackQuery!['data'].split('_')[2];
    if (collectionId) {
      await this.collectionsService.view(ctx, parseInt(collectionId, 10));
    }
  }

  @Action(/^cancel_collection_(.+)/)
  async cancelCollection(@Ctx() ctx: Context) {
    await this.deleteLastMessage(ctx);
    const collectionId = ctx.callbackQuery!['data'].split('_')[2];

    if (collectionId) {
      await this.collectionsService.cancelCollection(
        ctx,
        parseInt(collectionId, 10),
      );
    }
  }

  @Action(/^accept_collection_(.+)/)
  async acceptCollection(@Ctx() ctx: Context) {
    await this.deleteLastMessage(ctx);
    const collectionId = ctx.callbackQuery!['data'].split('_')[2];

    if (collectionId) {
      await this.collectionsService.acceptCollection(
        ctx,
        parseInt(collectionId, 10),
      );
    }
  }

  @Action(/toggle_collection_binding_(\d+)_(\d+)/)
  async toggleCollectionBinding(ctx: Context) {
    await this.deleteLastMessage(ctx);
    const collectionId = ctx.callbackQuery!['data'].split('_')[4];
    const employeeId = ctx.callbackQuery!['data'].split('_')[3];

    if (collectionId && employeeId) {
      await this.collectionsService.toggleCollectionBinding(
        ctx,
        parseInt(employeeId, 10),
        parseInt(collectionId, 10),
      );
    }
  }

  @Action(/^finalize_collection_(.+)/)
  async finalizeCollection(@Ctx() ctx: Context) {
    await this.deleteLastMessage(ctx);

    const collectionId = await ctx.callbackQuery!['data'].split('_')[2];

    if (collectionId) {
      await this.collectionsService.finalizeCollection(
        ctx,
        parseInt(collectionId, 10),
      );
    }
  }

  @Action(/^archive_collection_(.+)/)
  async archiveCollection(@Ctx() ctx: Context) {
    await this.deleteLastMessage(ctx);
    const collectionId = ctx.callbackQuery!['data'].split('_')[2];
    if (collectionId) {
      await this.collectionsService.archiveCollection(
        ctx,
        parseInt(collectionId, 10),
      );
    }
  }

  @Action(/^unarchive_collection_(.+)/)
  async unarchiveCollection(@Ctx() ctx: Context) {
    await this.deleteLastMessage(ctx);
    const collectionId = ctx.callbackQuery!['data'].split('_')[2];
    if (collectionId) {
      await this.collectionsService.unarchiveCollection(
        ctx,
        parseInt(collectionId, 10),
      );
    }
  }

  private async deleteLastMessage(ctx: Context) {
    const message = ctx.callbackQuery?.message;
    if (message && message.message_id) {
      await ctx.telegram.deleteMessage(ctx.chat?.id!, message.message_id);
    }
  }
}
