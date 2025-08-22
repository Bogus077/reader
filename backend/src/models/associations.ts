import User from '../modules/users/model';
import Book from '../modules/books/model';
import StudentBook from '../modules/studentBooks/model';
import Assignment from '../modules/assignments/model';
import Recap from '../modules/recaps/model';
import Streak from '../modules/streaks/model';

User.hasMany(StudentBook, { foreignKey: 'student_id' });
StudentBook.belongsTo(User, { foreignKey: 'student_id' });

Book.hasMany(StudentBook, { foreignKey: 'book_id' });
StudentBook.belongsTo(Book, { foreignKey: 'book_id' });

StudentBook.hasMany(Assignment, { foreignKey: 'student_book_id' });
Assignment.belongsTo(StudentBook, { foreignKey: 'student_book_id' });

// Связь Assignment и Recap (1:1)
Assignment.hasOne(Recap, { foreignKey: 'assignment_id', as: 'recap' });
Recap.belongsTo(Assignment, { foreignKey: 'assignment_id', as: 'assignment' });

// Связь User и Streak (1:1, опциональная)
User.hasOne(Streak, { foreignKey: 'student_id' });
Streak.belongsTo(User, { foreignKey: 'student_id' });

export function initAssociations() { /* файл просто импортируется в app.ts и выполняется */ }
