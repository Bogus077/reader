'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Получаем ID существующей записи student_book
    const [studentBooks] = await queryInterface.sequelize.query(
      `SELECT id FROM student_books LIMIT 1`
    );
    
    if (studentBooks.length === 0) {
      console.log('No student_books found, skipping assignments seed');
      return;
    }
    
    const studentBookId = studentBooks[0].id;
    
    // Проверяем, существуют ли уже записи для этого student_book_id
    const [existingAssignments] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM assignments WHERE student_book_id = ${studentBookId}`
    );
    
    if (existingAssignments[0].count > 0) {
      console.log('Assignments already exist for this student_book, skipping seed');
      return;
    }
    
    // Текущая дата (используем дату из метаданных)
    const currentDate = new Date('2025-08-20');
    
    // Создаем 5 заданий на ближайшие будние дни
    const assignments = [];
    let daysAdded = 0;
    let daysToAdd = 0;
    
    while (daysAdded < 5) {
      const assignmentDate = new Date(currentDate);
      assignmentDate.setDate(currentDate.getDate() + daysToAdd);
      
      // Проверяем, является ли день будним (0 = воскресенье, 6 = суббота)
      const dayOfWeek = assignmentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Это будний день, добавляем задание
        assignments.push({
          student_book_id: studentBookId,
          date: assignmentDate,
          deadline_time: '20:00',
          target_percent: 5 * (daysAdded + 1), // Равномерно увеличиваем цель (5%, 10%, 15%, 20%, 25%)
          target_page: null,
          target_chapter: null,
          target_last_paragraph: null,
          status: 'pending',
          submitted_at: null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        daysAdded++;
      }
      
      daysToAdd++;
    }
    
    await queryInterface.bulkInsert('assignments', assignments);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('assignments', null, {});
  }
};
