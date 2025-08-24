import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../lib/db';

export type LogAction = 'progress_open' | 'history_open' | 'today_open' | 'library_open';

export interface LogAttributes {
  id?: number;
  user_id: number;
  action: LogAction;
  metadata?: object | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Log extends Model<LogAttributes> implements LogAttributes {
  public id!: number;
  public user_id!: number;
  public action!: LogAction;
  public metadata!: object | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Log.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.ENUM('progress_open', 'history_open', 'today_open', 'library_open'),
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Log',
    tableName: 'logs',
  }
);

export default Log;
