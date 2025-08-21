# UI-библиотека Reader

Библиотека компонентов для приложения Reader, предоставляющая набор готовых UI-элементов для быстрой разработки интерфейсов.

## Структура библиотеки

- **primitives** - базовые компоненты интерфейса
- **forms** - компоненты для форм
- **data** - компоненты для отображения данных
- **feedback** - компоненты для обратной связи
- **composite** - составные компоненты
- **foundations** - основы дизайн-системы
- **hooks** - пользовательские хуки

## Примеры использования

### DayStrips

Компонент для отображения дневных сегментов с различными статусами и оценками.

```tsx
import { DayStrips } from 'ui';

const items = [
  { date: '2025-08-01', status: 'done', rating: 5 },
  { date: '2025-08-02', status: 'done', rating: 4 },
  { date: '2025-08-03', status: 'current' },
  { date: '2025-08-04', status: 'future' },
  { date: '2025-08-05', status: 'future' },
];

const Example = () => {
  const handleSelect = (idx: number) => {
    console.log(`Выбран день ${idx}`);
  };

  return (
    <DayStrips 
      items={items} 
      onSelect={handleSelect} 
      className="custom-class" 
    />
  );
};
```

### DeadlineBadge

Компонент для отображения статуса дедлайна с различными визуальными индикаторами.

```tsx
import { DeadlineBadge } from 'ui';

const Example = () => {
  return (
    <div>
      {/* Активный дедлайн */}
      <DeadlineBadge 
        date="2025-08-25" 
        time="18:00" 
        tz="+0300" 
        status="pending" 
      />
      
      {/* Сданное задание */}
      <DeadlineBadge 
        date="2025-08-20" 
        time="18:00" 
        tz="+0300" 
        status="submitted" 
      />
      
      {/* Оцененное задание */}
      <DeadlineBadge 
        date="2025-08-15" 
        time="18:00" 
        tz="+0300" 
        status="graded" 
      />
      
      {/* Просроченное задание */}
      <DeadlineBadge 
        date="2025-08-10" 
        time="18:00" 
        tz="+0300" 
        status="missed" 
      />
    </div>
  );
};
```

### RatingStars

Компонент для отображения и выбора рейтинга в виде звезд.

```tsx
import { RatingStars } from 'ui';
import { useState } from 'react';

const Example = () => {
  const [rating, setRating] = useState(3);
  
  return (
    <div>
      {/* Интерактивный рейтинг */}
      <RatingStars 
        value={rating} 
        onChange={setRating} 
        size="md" 
      />
      
      {/* Рейтинг только для чтения */}
      <RatingStars 
        value={4.5} 
        readOnly 
        size="lg" 
      />
      
      {/* Маленький рейтинг */}
      <RatingStars 
        value={2} 
        readOnly 
        size="sm" 
      />
    </div>
  );
};
```

### Modal

Модальное окно для отображения контента поверх основного интерфейса.

```tsx
import { Modal, Button } from 'ui';
import { useState } from 'react';

const Example = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  
  return (
    <>
      <Button onClick={handleOpen}>Открыть модальное окно</Button>
      
      <Modal 
        isOpen={isOpen} 
        onClose={handleClose} 
        className="custom-modal"
      >
        <h2>Заголовок модального окна</h2>
        <p>Содержимое модального окна...</p>
        
        <div className="actions">
          <Button variant="ghost" onClick={handleClose}>Отмена</Button>
          <Button onClick={() => {
            console.log('Действие выполнено');
            handleClose();
          }}>
            Подтвердить
          </Button>
        </div>
      </Modal>
    </>
  );
};
```

### GradeModal

Модальное окно для оценки заданий.

```tsx
import { GradeModal } from 'ui';
import { useState } from 'react';

const Example = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  
  const handleSubmit = ({ rating, comment }) => {
    console.log(`Оценка: ${rating}, Комментарий: ${comment}`);
    handleClose();
  };
  
  return (
    <>
      <button onClick={handleOpen}>Оценить задание</button>
      
      <GradeModal 
        isOpen={isOpen} 
        onClose={handleClose}
        date="2025-08-20"
        targetSummary="Прочитать главы 1-3 книги 'Война и мир'"
        onSubmit={handleSubmit}
        initialRating={0}
        initialComment=""
      />
    </>
  );
};
```

### AssignmentEditModal

Модальное окно для создания и редактирования заданий.

```tsx
import { AssignmentEditModal } from 'ui';
import { useState } from 'react';

const Example = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  
  const handleSubmit = (data) => {
    console.log('Данные задания:', data);
    handleClose();
  };
  
  return (
    <>
      <button onClick={handleOpen}>Создать задание</button>
      
      <AssignmentEditModal 
        isOpen={isOpen} 
        onClose={handleClose}
        onSubmit={handleSubmit}
        initialData={{
          title: '',
          pages: 10,
          time: '18:00',
          description: ''
        }}
        isGraded={false}
        isDeadlinePassed={false}
      />
    </>
  );
};
```
