import { Model, DataTypes } from 'sequelize';
import sequelize from '../../lib/db';

interface UserAttributes {
  id?: number;
  telegram_id: string;
  role: 'mentor' | 'student';
  name: string | null;
  tz: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public telegram_id!: string;
  public role!: 'mentor' | 'student';
  public name!: string | null;
  public tz!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    telegram_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    role: {
      type: DataTypes.ENUM('mentor', 'student'),
      allowNull: false,
      defaultValue: 'student',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tz: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: process.env.DEFAULT_TZ || 'Europe/Samara',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
  }
);

export default User;
