import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface ICollectionAttributes {
  name?: string;
  amount?: number;
  is_finilized?: boolean;
}

@Table({ tableName: 'collections', timestamps: false })
export class Collection extends Model<Collection, ICollectionAttributes> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      notEmpty: true,
      len: [1, 255],
    },
  })
  declare name: string;

  @Column({
    type: DataType.DECIMAL,
    allowNull: true,
    defaultValue: 0,
    validate: {
      isInt: true,
      min: 0,
    },
  })
  declare amount: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    validate: {
      isBoolean: true,
    },
  })
  declare is_finilized: boolean;
}
