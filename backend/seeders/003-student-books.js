'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Получаем ID студента из первого сида
    const [students] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'student' AND telegram_id = '2000' LIMIT 1`
    );
    
    // Получаем ID одной из книг
    const [books] = await queryInterface.sequelize.query(
      `SELECT id FROM books LIMIT 1`
    );
    
    const studentId = students.length > 0 ? students[0].id : null;
    const bookId = books.length > 0 ? books[0].id : null;

    if (studentId && bookId) {
      await queryInterface.bulkInsert('student_books', [
        {
          student_id: studentId,
          book_id: bookId,
          status: 'active',
          start_date: new Date(),
          end_date: null,
          progress_mode: 'percent',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('student_books', null, {});
  }
};
