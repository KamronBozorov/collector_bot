import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface IUserCreationAttr {
  user_id: number;
  last_state: string;
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
    type: DataType.BIGINT,
    allowNull: false,
    unique: true,
    validate: {
      isInt: true,
      min: 1,
    },
  })
  declare user_id: number;

  @Column({
    type: DataType.STRING,
    validate: {
      notEmpty: true,
      len: [1, 255],
    },
  })
  declare last_state: string;
}
