'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Получаем ID ментора из первого сида
    const [mentors] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'mentor' AND telegram_id = '1000' LIMIT 1`
    );
    
    const mentorId = mentors.length > 0 ? mentors[0].id : null;

    // Очищаем таблицу, чтобы избежать дубликатов при пересеве
    await queryInterface.bulkDelete('books', null, {});

    const now = new Date();
    const books = [
      // Фантастика
      {
        title: 'Марсианские хроники',
        author: 'Рэй Брэдбери',
        category: 'фантастика',
        difficulty: 4,
        description: 'Сборник рассказов о колонизации Марса и встрече человечества с иной цивилизацией. Классика научной фантастики с философскими мотивами.',
        cover_url: null,
        source_url: 'https://readly.ru/book/57619/',
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },

      // Фэнтези
      {
        title: 'Хроники Нарнии',
        author: 'Клайв Стейплз Льюис',
        category: 'фэнтези',
        difficulty: 2,
        description: 'Цикл повестей о детях, попадающих в сказочный мир Нарнии, где им предстоит пережить приключения и сражения добра со злом.',
        cover_url: null,
        source_url: 'https://books.yandex.ru/audiobooks/tF2R4NZJ?from_series=KIRcNk8H',
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Гарри Поттер и Методы Рационального Мышления',
        author: 'Элиезер Юдковский',
        category: 'фэнтези',
        difficulty: 5,
        description: 'Фанфик по вселенной Гарри Поттера, в котором герой действует логично и рационально. Книга популяризирует идеи рационального мышления.',
        cover_url: null,
        source_url: 'https://books.yandex.ru/books/h7mfoqbq',
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },

      // Про ровесников
      {
        title: 'Журавлёнок и молнии',
        author: 'Владислав Крапивин',
        category: 'подростковая',
        difficulty: 3,
        description: 'Роман о подростке, любви к книгам и взрослении. О дружбе, ответственности и первых серьёзных испытаниях.',
        cover_url: null,
        source_url: 'https://books.yandex.ru/audiobooks/Oxg4HaIb',
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Колыбельная для брата',
        author: 'Владислав Крапивин',
        category: 'подростковая',
        difficulty: 3,
        description: 'Повесть о дружбе, верности и взрослении. История о том, как один поступок может изменить отношение к миру и людям.',
        cover_url: null,
        source_url: 'https://books.yandex.ru/audiobooks/l9KHm8Ng',
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Уроки французского',
        author: 'Валентин Распутин',
        category: 'подростковая',
        difficulty: 2,
        description: 'Автобиографическая повесть о мальчике послевоенных лет, учительнице и уроках человечности.',
        cover_url: null,
        source_url: 'https://books.yandex.ru/books/mo56PwRN',
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Пятнадцатилетний капитан',
        author: 'Жюль Верн',
        category: 'приключения',
        difficulty: 3,
        description: 'Приключенческий роман о юном моряке Дике Сэнде, который берёт на себя командование судном и спасает товарищей.',
        cover_url: null,
        source_url: 'https://books.yandex.ru/books/KXuJZ1a0',
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Третий в пятом ряду',
        author: 'Анатолий Алексин',
        category: 'подростковая',
        difficulty: 2,
        description: 'Повесть о школьниках, взаимоотношениях и непростых моральных выборах.',
        cover_url: null,
        source_url: 'https://books.yandex.ru/books/IWTycgmk',
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Повелитель мух',
        author: 'Уильям Голдинг',
        category: 'классика',
        difficulty: 4,
        description: 'Роман о группе мальчиков на необитаемом острове и о том, как быстро рушится цивилизованность без правил и взрослых.',
        cover_url: 'https://upload.wikimedia.org/wikipedia/en/9/9b/Lordofthefliesbookcover.jpg',
        source_url: 'https://books.yandex.ru/books/U0NWNj33',
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },

      // Про войну
      {
        title: 'Облачный полк',
        author: 'Эдуард Веркин',
        category: 'военная проза',
        difficulty: 4,
        description: 'Повесть о войне глазами подростка: партизанские будни, страх и взросление в тяжёлое время.',
        cover_url: null,
        source_url: 'https://books.yandex.ru/books/Nh8GMC8L',
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Улица младшего сына',
        author: 'Лев Кассиль, Макс Поляновский',
        category: 'военная проза',
        difficulty: 3,
        description: 'Повесть о юном партизане Володе Дубинине и его подвиге во время Великой Отечественной войны.',
        cover_url: null,
        source_url: 'https://readly.ru/book/75936/',
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'А зори здесь тихие…',
        author: 'Борис Васильев',
        category: 'военная проза',
        difficulty: 4,
        description: 'Повесть о подвиге девушек-зенитчиц во время Великой Отечественной войны.',
        cover_url: null,
        source_url: 'https://books.yandex.ru/books/Tv41P1S8',
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Ночевала тучка золотая',
        author: 'Анатолий Приставкин',
        category: 'военная проза',
        difficulty: 4,
        description: 'Повесть о детях во время войны, эвакуации на Кавказ и трагедии репрессированных народов.',
        cover_url: null,
        source_url: 'https://books.yandex.ru/books/NFIO2d7p',
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert('books', books);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('books', {
      title: [
        'Марсианские хроники',
        'Хроники Нарнии',
        'Гарри Поттер и Методы Рационального Мышления',
        'Журавлёнок и молнии',
        'Колыбельная для брата',
        'Уроки французского',
        'Пятнадцатилетний капитан',
        'Третий в пятом ряду',
        'Повелитель мух',
        'Облачный полк',
        'Улица младшего сына',
        'А зори здесь тихие…',
        'Ночевала тучка золотая',
      ]
    });
  }
};
