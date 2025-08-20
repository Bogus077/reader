'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Получаем ID студента
    const [students] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'student' LIMIT 1`
    );
    
    if (students.length === 0) {
      console.log('No students found, skipping streaks seed');
      return;
    }
    
    const studentId = students[0].id;
    
    // Проверяем, существует ли уже запись для этого студента
    const [existingStreaks] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM streaks WHERE student_id = ${studentId}`
    );
    
    if (existingStreaks[0].count > 0) {
      console.log('Streak already exists for this student, skipping seed');
      return;
    }
    
    // Создаем начальный streak для студента
    await queryInterface.bulkInsert('streaks', [
      {
        student_id: studentId,
        current_len: 0,
        best_len: 0,
        last_update_date: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('streaks', null, {});
  }
};
