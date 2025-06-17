import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Collection } from './collections.model';
import { User } from './users.model';
import { Employee } from './employees.model';

interface CollectionEmployeeAttributes {
  collection_id?: number;
  user_id?: number;
  is_paid?: boolean;
  is_active?: boolean;
}

@Table({ tableName: 'collection_employee', timestamps: false })
export class CollectionEmployee extends Model<
  CollectionEmployee,
  CollectionEmployeeAttributes
> {
  @ForeignKey(() => Collection)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
  })
  declare collection_id: number;

  @ForeignKey(() => Employee)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
  })
  declare user_id: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    validate: {
      isBoolean: true,
    },
  })
  declare is_active: boolean;
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    validate: {
      isBoolean: true,
    },
  })
  declare is_paid: boolean;

  @BelongsTo(() => Employee)
  employee: Employee;

  @BelongsTo(() => Collection)
  collection: Collection;
}
