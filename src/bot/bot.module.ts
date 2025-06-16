import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';
import { CollectionsService } from './collections/collections.service';
import { CollectionsUpdate } from './collections/collections.update';
import { UsersService } from './users/users.service';
import { UsersUpdate } from './users/users.update';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/users.model';
import { Collection } from './models/collections.model';

@Module({
  imports: [SequelizeModule.forFeature([User, Collection])],
  providers: [
    BotService,
    CollectionsService,
    CollectionsUpdate,
    UsersService,
    UsersUpdate,
    BotUpdate,
  ],
  exports: [BotService],
})
export class BotModule {}
