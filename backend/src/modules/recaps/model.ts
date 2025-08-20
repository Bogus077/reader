import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../lib/db';
import Assignment from '../assignments/model';

export interface RecapAttributes {
  id?: number;
  assignment_id: number;
  mentor_rating?: number | null;
  mentor_comment?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Recap extends Model<RecapAttributes> implements RecapAttributes {
  public id!: number;
  public assignment_id!: number;
  public mentor_rating!: number | null;
  public mentor_comment!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Ассоциации
  public readonly assignment?: Assignment;
}

Recap.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    assignment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'assignments',
        key: 'id',
      },
    },
    mentor_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    mentor_comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Recap',
    tableName: 'recaps',
  }
);

export default Recap;
