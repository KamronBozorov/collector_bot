import { Action, Update, Ctx, On, Hears } from 'nestjs-telegraf';
import { CollectionsService } from './collections.service';
import { Context } from 'telegraf';

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
    await this.collectionsService.delete(ctx);
  }

  @Hears("💰 Pul yig'ish")
  async acumulate(@Ctx() ctx: Context) {
    await this.collectionsService.accumalateMenu(ctx);
  }
}
