import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Collection } from './collections.model';
import { User } from './users.model';

interface CollectionUserAttributes {
  collection_id: number;
  user_id: number;
  is_active: boolean;
}

@Table({ tableName: 'collection_user', timestamps: false })
export class CollectionUser extends Model<
  CollectionUser,
  CollectionUserAttributes
> {
  @ForeignKey(() => Collection)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
  })
  declare collection_id: number;

  @ForeignKey(() => User)
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
}
