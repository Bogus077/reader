"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Получаем ID ментора из первого сида
    const [mentors] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'mentor' AND telegram_id = '382388583' LIMIT 1`
    );

    const mentorId = mentors.length > 0 ? mentors[0].id : null;

    const now = new Date();
    const books = [
      {
        title: "Волшебник Земноморья",
        author: "Урсула Ле Гуин",
        category: "фэнтези",
        difficulty: 4,
        description:
          "История о мальчике, который учится магии и случайно выпускает в мир опасную тень. Теперь ему предстоит исправить ошибку и пройти настоящий путь героя.",
        cover_url:
          "https://cdn.eksmo.ru/v2/ITD000000001080103/COVER/cover1__w820.jpg",
        source_url: "https://books.yandex.ru/books/GCmH9d1F",
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Ходячий замок",
        author: "Диана Уинн Джонс",
        category: "фэнтези",
        difficulty: 3,
        description:
          "Девушку Софи превращают в старушку, и чтобы снять проклятие, она отправляется в загадочный Ходячий замок к чудаковатому магу Хаулу.",
        cover_url:
          "https://img4.labirint.ru/rc/7f64c7f2a7c6f2c4c79838e4c9e17efb/363x561q80/books55/546674/cover.jpg?1612251837",
        source_url: "https://books.yandex.ru/books/mhvH8t3H",
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Книга кладбищ",
        author: "Нил Гейман",
        category: "фэнтези",
        difficulty: 4,
        description:
          "Мальчик остаётся сиротой и поселяется… на кладбище. Его воспитывают призраки и таинственные существа, а впереди ждёт множество тайн и опасностей.",
        cover_url: "https://cdn.litres.ru/pub/c/cover/6948997.jpg",
        source_url: "https://books.yandex.ru/books/TnX84PwM",
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },

      // Подростковая
      {
        title: "Дети синего фламинго",
        author: "Владислав Крапивин",
        category: "подростковая",
        difficulty: 3,
        description:
          "Компания ребят строит необычный корабль и отправляется в воображаемое плавание. Но игра постепенно становится похожа на настоящее приключение.",
        cover_url:
          "https://cdn.eksmo.ru/v2/ITD000000001079539/COVER/cover1__w820.jpg",
        source_url: "https://books.yandex.ru/books/OBzM5vYF",
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Мой брат играет на кларнете",
        author: "Анатолий Алексин",
        category: "подростковая",
        difficulty: 2,
        description:
          "Школьная история о брате и сестре, об их повседневных делах и неожиданных открытиях. Книга читается легко и с юмором.",
        cover_url:
          "https://img3.labirint.ru/rc/93e6422f85f3f009f7f0505b08d78aa0/363x561q80/books60/596253/cover.jpg?1575558188",
        source_url: "https://books.yandex.ru/books/jPpXY2kE",
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Зимняя дорога",
        author: "Евгений Рудашевский",
        category: "подростковая",
        difficulty: 3,
        description:
          "Два подростка отправляются в суровое зимнее путешествие по Якутии. Опасности на каждом шагу и проверка на смелость и выдержку.",
        cover_url:
          "https://cdn.eksmo.ru/v2/ITD000000001079480/COVER/cover1__w820.jpg",
        source_url: "https://books.yandex.ru/books/f8yJbMbM",
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Дар",
        author: "Сесилия Ахерн",
        category: "подростковая",
        difficulty: 4,
        description:
          "Главный герой получает необычный шанс управлять временем. Но чем больше он экспериментирует, тем яснее понимает цену каждой минуты.",
        cover_url: "https://cdn.litres.ru/pub/c/cover/6802965.jpg",
        source_url: "https://books.yandex.ru/books/G1zS1Zo3",
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },

      // Фантастика
      {
        title: "Дверь в лето",
        author: "Роберт Хайнлайн",
        category: "фантастика",
        difficulty: 4,
        description:
          "Инженер и его кот оказываются втянуты в историю с предательством и путешествиями во времени. У героя остаётся только один шанс всё изменить.",
        cover_url: "https://cdn.litres.ru/pub/c/cover/6753051.jpg",
        source_url: "https://books.yandex.ru/books/JnTazpAa",
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Катали мы ваше солнце",
        author: "Евгений Лукин",
        category: "фантастика",
        difficulty: 3,
        description:
          "Будущее, где люди живут в странных условиях и решают необычные задачи. Много иронии, фантазии и неожиданных идей.",
        cover_url:
          "https://img3.labirint.ru/rc/ce7a7c7926ac4766abdb431f4e56622d/363x561q80/books44/433259/cover.jpg?1612789508",
        source_url: "https://books.yandex.ru/books/qpLwH31T",
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Приключения Алисы",
        author: "Кир Булычёв",
        category: "фантастика",
        difficulty: 2,
        description:
          "Алиса Селезнёва — девочка из будущего, которая постоянно попадает в невероятные истории: космос, динозавры, роботы и тайны других планет.",
        cover_url: "https://cdn.litres.ru/pub/c/cover/6350441.jpg",
        source_url: "https://books.yandex.ru/books/I7EQmH5n",
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },

      // Классика / «сложно, но стоит»
      {
        title: "Мальчик в полосатой пижаме",
        author: "Джон Бойн",
        category: "классика",
        difficulty: 3,
        description:
          "Два мальчика оказываются по разные стороны колючей проволоки. Их дружба оборачивается страшной, но очень сильной историей.",
        cover_url: "https://cdn.litres.ru/pub/c/cover/6805051.jpg",
        source_url: "https://books.yandex.ru/books/Lpni8R7C",
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Король Матиуш Первый",
        author: "Януш Корчак",
        category: "классика",
        difficulty: 3,
        description:
          "Мальчик неожиданно становится королём и пытается управлять страной. Он придумывает законы для детей, но взрослый мир не так прост.",
        cover_url:
          "https://img4.labirint.ru/rc/11ff36f0bade85af409299e7a87d6d23/363x561q80/books63/627826/cover.jpg?1576112976",
        source_url: "https://books.yandex.ru/books/OLXj0YdE",
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },

      // Современное подростковое фэнтези
      {
        title: "Зерцалия",
        author: "Евгений Гаглоев",
        category: "фэнтези",
        difficulty: 2,
        description:
          "Школьник попадает в загадочный мир зеркал, где всё кажется знакомым и чужим одновременно. Его ждут тайны, магия и битва с опасным врагом.",
        cover_url:
          "https://cdn.eksmo.ru/v2/ITD000000001076263/COVER/cover1__w820.jpg",
        source_url: "https://books.yandex.ru/books/bhUzMR0G",
        created_by: mentorId,
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert("books", books);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("books", {
      title: [
        "Волшебник Земноморья",
        "Ходячий замок",
        "Книга кладбищ",
        "Дети синего фламинго",
        "Мой брат играет на кларнете",
        "Зимняя дорога",
        "Дар",
        "Дверь в лето",
        "Катали мы ваше солнце",
        "Приключения Алисы",
        "Мальчик в полосатой пижаме",
        "Король Матиуш Первый",
        "Зерцалия",
      ],
    });
  },
};
