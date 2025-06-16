import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface IUserCreationAttr {
  name: string;
  birthday: Date;
}

@Table({ tableName: 'users', timestamps: false })
export class User extends Model<User, IUserCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255],
    },
  })
  declare name: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    validate: {
      isDate: true,
    },
  })
  declare birthday: Date;
}
