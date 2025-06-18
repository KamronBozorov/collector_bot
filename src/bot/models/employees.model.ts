import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface IEmployeeCreationAttr {
  name?: string;
  birthday?: Date;
  is_finilized?: boolean;
}

@Table({ tableName: 'employees', timestamps: false })
export class Employee extends Model<Employee, IEmployeeCreationAttr> {
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
    type: DataType.DATEONLY,
    allowNull: true,
  })
  declare birthday: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    validate: {
      isBoolean: true,
    },
  })
  declare is_finilized: boolean;
}
