import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../lib/db';
import User from '../users/model';

export interface StreakAttributes {
  id?: number;
  student_id: number;
  current_len: number;
  best_len: number;
  last_update_date?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Streak extends Model<StreakAttributes> implements StreakAttributes {
  public id!: number;
  public student_id!: number;
  public current_len!: number;
  public best_len!: number;
  public last_update_date!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Ассоциации
  public readonly user?: User;
}

Streak.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    current_len: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    best_len: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    last_update_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Streak',
    tableName: 'streaks',
  }
);

export default Streak;
