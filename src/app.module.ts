import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotModule } from './bot/bot.module';
import { BOT_NAME } from './constants';
import { User } from './bot/models/users.model';
import { Collection } from './bot/models/collections.model';
import { CollectionUser } from './bot/models/collection-user.model';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TelegrafModule.forRootAsync({
      botName: BOT_NAME,
      useFactory: () => ({
        token: process.env.TELEGRAM_BOT_TOKEN!,
        middlewares: [],
        include: [BotModule],
      }),
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.PG_HOST,
      port: Number(process.env.PG_PORT),
      username: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DB,
      models: [User, Collection, CollectionUser],
      autoLoadModels: true,
      sync: {
        alter: true,
      },
      logging: false,
    }),
    BotModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
