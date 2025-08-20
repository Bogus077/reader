import { Model, DataTypes } from 'sequelize';
import sequelize from '../../lib/db';
import User from '../users/model';

interface BookAttributes {
  id: number;
  title: string;
  author: string;
  category: string;
  difficulty: number;
  description: string | null;
  cover_url: string | null;
  source_url: string | null;
  created_by: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

class Book extends Model<BookAttributes> implements BookAttributes {
  public id!: number;
  public title!: string;
  public author!: string;
  public category!: string;
  public difficulty!: number;
  public description!: string | null;
  public cover_url!: string | null;
  public source_url!: string | null;
  public created_by!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Book.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cover_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    source_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Book',
    tableName: 'books',
  }
);

export default Book;
