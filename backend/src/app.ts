import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import router from './routes';
import { sequelize } from './lib/db';
import { initAssociations } from './models/associations';
import { errorHandler } from './middleware/errorHandler';

// Загрузка переменных окружения
dotenv.config();

const app = express();
const port = process.env.PORT || 3010;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Маршруты
app.use('/api', router);

// Маршрут для проверки работоспособности
app.get('/health', (req: Request, res: Response) => {
  res.json({ ok: true });
});

// Обработчик ошибок - должен быть последним middleware
app.use(errorHandler);

// Инициализация ассоциаций моделей
initAssociations();

// Подключение к базе данных и запуск сервера
sequelize.authenticate()
  .then(() => {
    console.log('DB connected');
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  });

export default app;
