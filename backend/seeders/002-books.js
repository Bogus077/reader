'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Получаем ID ментора из первого сида
    const [mentors] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'mentor' AND telegram_id = '1000' LIMIT 1`
    );
    
    const mentorId = mentors.length > 0 ? mentors[0].id : null;

    await queryInterface.bulkInsert('books', [
      {
        title: 'Война и мир',
        author: 'Лев Толстой',
        category: 'классика',
        difficulty: 5,
        description: 'Роман-эпопея Льва Николаевича Толстого, описывающий русское общество в эпоху войн против Наполеона в 1805—1812 годах.',
        cover_url: 'https://example.com/war-and-peace.jpg',
        source_url: 'https://example.com/war-and-peace',
        created_by: mentorId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Гарри Поттер и философский камень',
        author: 'Джоан Роулинг',
        category: 'фэнтези',
        difficulty: 2,
        description: 'Первая книга в серии романов о Гарри Поттере. История мальчика-сироты, который узнает о своих волшебных способностях.',
        cover_url: 'https://example.com/harry-potter.jpg',
        source_url: 'https://example.com/harry-potter',
        created_by: mentorId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('books', {
      title: ['Война и мир', 'Гарри Поттер и философский камень']
    });
  }
};
