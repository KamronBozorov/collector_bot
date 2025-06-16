import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface ICollectionAttributes {
  name: string;
  amount: number;
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
    allowNull: false,
    unique: true,
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
  amount: number;
}
