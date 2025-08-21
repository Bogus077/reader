# Reader WebApp (Vite + React + Effector + SCSS)

Базовый каркас фронта для Telegram WebApp.

## Стек
- Vite + React + TypeScript
- Effector (+ effector-react)
- SCSS
- ky для вызовов API
- HashRouter (без серверной настройки маршрутов)

## Быстрый старт
```bash
# В папке проекта
npm i
cp .env.example .env
# пропиши VITE_API_URL на свой backend
npm run dev
```

## Telegram авторизация
В `index.html` подключён SDK Telegram. При запуске внутри Telegram WebApp
на старте вызывается `/auth/telegram` с заголовком `X-Telegram-Init-Data`,
после чего JWT сохраняется в `localStorage`.

## Структура
- `src/api` — клиент REST
- `src/store` — effector-сторы/эффекты
- `src/pages/student/Today.tsx` — главный экран ученика
- `src/pages/mentor/Dashboard.tsx` — дашборд ментора
- `src/ui` — библиотека UI-компонентов
- `src/styles` — SCSS (токены, глобальные стили)

## UI Library

Проект включает модульную UI-библиотеку с компонентами, разделенными по категориям:

- **primitives** — базовые компоненты (Button, Card, Badge, Tabbar, Topbar)
- **forms** — компоненты форм (Input, NumberInput, TimeInput, Textarea, Select)
- **data** — компоненты для отображения данных (ProgressBar, DayStrips, RatingStars)
- **feedback** — компоненты для обратной связи (Modal, Drawer, Toast)
- **composite** — составные компоненты (BookCard, DeadlineBadge, GradeModal)

Подробная документация и примеры использования доступны в [src/ui/README.md](src/ui/README.md).

## Переменные окружения
- `VITE_API_URL` — базовый URL бэкенда, напр. `https://api.example.com/`

## Дальше
- Добавь страницы «Прогресс», «История дня», «Библиотека».
- Подключи реальные роуты и действия ментора (оценка, редактирование).
- При желании — заменить HashRouter на MemoryRouter (для in-app), либо оставить Hash.
