import { Action, Update } from 'nestjs-telegraf';
import { CollectionsService } from './collections.service';
import { Context } from 'telegraf';

@Update()
export class CollectionsUpdate {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Action('create_collection')
  createCollection(ctx: Context) {
    await this.collectionsService.create(ctx);
  }
}
