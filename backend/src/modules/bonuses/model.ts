import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../lib/db';
import User from '../users/model';
import Assignment from '../assignments/model';

export interface BonusTransactionAttributes {
  id?: number;
  student_id: number;
  assignment_id?: number | null;
  delta: number; // положительное или отрицательное изменение
  source: 'grade' | 'manual' | 'reset';
  reason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BonusTransaction extends Model<BonusTransactionAttributes> implements BonusTransactionAttributes {
  public id!: number;
  public student_id!: number;
  public assignment_id!: number | null;
  public delta!: number;
  public source!: 'grade' | 'manual' | 'reset';
  public reason!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly user?: User;
  public readonly assignment?: Assignment;
}

BonusTransaction.init(
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
    assignment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true,
      references: {
        model: 'assignments',
        key: 'id',
      },
      onDelete: 'SET NULL' as any,
    },
    delta: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    source: {
      type: DataTypes.ENUM('grade', 'manual', 'reset'),
      allowNull: false,
      defaultValue: 'grade',
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'BonusTransaction',
    tableName: 'bonus_transactions',
  }
);

export default BonusTransaction;
