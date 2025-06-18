import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';
import { CollectionsService } from './collections/collections.service';
import { CollectionsUpdate } from './collections/collections.update';
import { EmployeesService } from './employees/employees.service';
import { EmployeesUpdate } from './employees/employees.update';
import { CollectionEmployee } from './models/collection-employee.model';
import { Collection } from './models/collections.model';
import { Employee } from './models/employees.model';
import { User } from './models/users.model';

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
