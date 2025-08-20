import { Model, DataTypes } from 'sequelize';
import sequelize from '../../lib/db';

interface StudentBookAttributes {
  id?: number;
  student_id: number;
  book_id: number;
  status: 'active' | 'finished' | 'paused';
  start_date: Date;
  end_date: Date | null;
  progress_mode: 'percent' | 'page';
  createdAt?: Date;
  updatedAt?: Date;
}

class StudentBook extends Model<StudentBookAttributes> implements StudentBookAttributes {
  public id!: number;
  public student_id!: number;
  public book_id!: number;
  public status!: 'active' | 'finished' | 'paused';
  public start_date!: Date;
  public end_date!: Date | null;
  public progress_mode!: 'percent' | 'page';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StudentBook.init(
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
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'books',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'finished', 'paused'),
      allowNull: false,
      defaultValue: 'active',
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    progress_mode: {
      type: DataTypes.ENUM('percent', 'page'),
      allowNull: false,
      defaultValue: 'percent',
    },
  },
  {
    sequelize,
    modelName: 'StudentBook',
    tableName: 'student_books',
  }
);

export default StudentBook;
