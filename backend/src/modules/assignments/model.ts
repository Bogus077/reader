import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../lib/db';
import StudentBook from '../studentBooks/model';

export interface AssignmentAttributes {
  id?: number;
  student_book_id: number;
  date: Date;
  deadline_time: string;
  target_percent?: number | null;
  target_page?: number | null;
  target_chapter?: string | null;
  target_last_paragraph?: string | null;
  status: 'pending' | 'submitted' | 'missed' | 'graded';
  submitted_at?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Assignment extends Model<AssignmentAttributes> implements AssignmentAttributes {
  public id!: number;
  public student_book_id!: number;
  public date!: Date;
  public deadline_time!: string;
  public target_percent!: number | null;
  public target_page!: number | null;
  public target_chapter!: string | null;
  public target_last_paragraph!: string | null;
  public status!: 'pending' | 'submitted' | 'missed' | 'graded';
  public submitted_at!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Ассоциации
  public readonly studentBook?: StudentBook;
}

Assignment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    student_book_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'student_books',
        key: 'id',
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    deadline_time: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // Формат 'HH:mm'
      },
    },
    target_percent: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    target_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    target_chapter: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    target_last_paragraph: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'submitted', 'missed', 'graded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Assignment',
    tableName: 'assignments',
  }
);

export default Assignment;
