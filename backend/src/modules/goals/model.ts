import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../../lib/db';
import User from '../users/model';

export type GoalStatus = 'pending' | 'achieved' | 'cancelled';

export interface GoalAttributes {
  id?: number;
  student_id: number;
  title: string;
  reward_text?: string | null;
  status?: GoalStatus;
  required_bonuses: number;
  achieved_at?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type GoalCreationAttributes = Optional<GoalAttributes, 'id' | 'reward_text' | 'status' | 'required_bonuses' | 'achieved_at' | 'createdAt' | 'updatedAt'>;

export class Goal extends Model<GoalAttributes, GoalCreationAttributes> implements GoalAttributes {
  public id!: number;
  public student_id!: number;
  public title!: string;
  public reward_text!: string | null;
  public status!: GoalStatus;
  public required_bonuses!: number;
  public achieved_at!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly student?: User;
}

Goal.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    reward_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'achieved', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    required_bonuses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    achieved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Goal',
    tableName: 'goals',
  }
);

export default Goal;
