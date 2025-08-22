import { z } from 'zod';

// Схема для POST /mentor/assignments/generate
export const generateAssignmentsSchema = z.object({
  body: z.object({
    student_book_id: z.number().int().positive()
      .describe("ID книги студента"),
    mode: z.enum(['percent', 'page'])
      .describe("Режим прогресса: percent или page"),
    dailyTarget: z.number().positive()
      .describe("Ежедневная цель"),
    deadline_time: z.string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Должен быть в формате HH:MM")
      .describe("Время дедлайна в формате HH:MM"),
    startDate: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Должен быть в формате YYYY-MM-DD")
      .describe("Дата начала в формате YYYY-MM-DD"),
    endDate: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Должен быть в формате YYYY-MM-DD")
      .describe("Дата окончания в формате YYYY-MM-DD")
  })
});

// Схема для PATCH /mentor/assignments/:id
export const updateAssignmentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID должен быть числом")
  }),
  body: z.object({
    deadline_time: z.string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Должен быть в формате HH:MM")
      .optional(),
    target_percent: z.number().nullable().optional(),
    target_page: z.number().nullable().optional(),
    target_chapter: z.string().nullable().optional(),
    target_last_paragraph: z.string().nullable().optional()
  }).refine(data => Object.keys(data).length > 0, {
    message: "Должно быть указано хотя бы одно поле для обновления"
  })
});

// Схема для POST /mentor/assignments/:id/grade
export const gradeAssignmentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID должен быть числом")
  }),
  body: z.object({
    mentor_rating: z.number().int().min(1).max(5)
      .describe("Оценка ментора от 1 до 5"),
    mentor_comment: z.string().optional()
      .describe("Комментарий ментора")
  })
});

// Схема для POST /mentor/student-books/assign
export const assignBookSchema = z.object({
  body: z.object({
    student_id: z.number().int().positive()
      .describe("ID студента"),
    book_id: z.number().int().positive()
      .describe("ID книги"),
    progress_mode: z.enum(['percent', 'page'])
      .describe("Режим прогресса: percent или page"),
    start_date: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Должен быть в формате YYYY-MM-DD")
      .describe("Дата начала в формате YYYY-MM-DD")
  })
});

// Схема для PATCH /mentor/student-books/:id/status
export const updateBookStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID должен быть числом")
  }),
  body: z.object({
    status: z.enum(['paused', 'active', 'finished'])
      .describe("Статус книги: paused, active или finished"),
    date: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Должен быть в формате YYYY-MM-DD")
      .optional()
      .describe("Дата в формате YYYY-MM-DD (опционально)")
  })
});

// Схема для POST /mentor/books
export const createBookSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Название обязательно'),
    author: z.string().min(1, 'Автор обязателен'),
    category: z.string().min(1, 'Категория обязательна'),
    difficulty: z.number().int().min(1).max(5)
      .describe('Сложность от 1 до 5'),
    description: z.string().nullable().optional(),
    cover_url: z.string().url().nullable().optional(),
    source_url: z.string().url().nullable().optional(),
  })
});
