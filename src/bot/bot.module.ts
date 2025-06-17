import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';
import { CollectionsService } from './collections/collections.service';
import { CollectionsUpdate } from './collections/collections.update';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/users.model';
import { Collection } from './models/collections.model';
import { Employee } from './models/employees.model';
import { EmployeesService } from './employees/employees.service';
import { EmployeesUpdate } from './employees/employees.update';
import { CollectionEmployee } from './models/collection-employee.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      Collection,
      CollectionEmployee,
      Employee,
    ]),
  ],
  controllers: [],
  providers: [
    BotService,
    CollectionsService,
    CollectionsUpdate,
    EmployeesService,
    EmployeesUpdate,
    BotUpdate,
  ],
  exports: [BotService],
})
export class BotModule {}
