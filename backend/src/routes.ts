import express, { Router } from 'express';
import authRouter from './modules/auth/router';
import studentRouter from './modules/student/router';
import mentorRouter from './modules/mentor/router';
import booksRouter from './modules/books/router';
import logsRouter from './modules/logs/router';

const router = Router();

// Подключаем модуль аутентификации
router.use('/auth', authRouter);

// Подключаем модуль студента
router.use('/student', studentRouter);

// Подключаем модуль ментора
router.use('/mentor', mentorRouter);

// Подключаем модуль книг
router.use('/books', booksRouter);

// Подключаем модуль логов
router.use('/logs', logsRouter);

export default router;
