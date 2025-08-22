import { FC, useState, useEffect } from "react";
import { Modal } from "../../feedback/Modal";
import { NumberInput } from "../../forms/NumberInput";
import { TimeInput } from "../../forms/TimeInput";
import { Textarea } from "../../forms/Textarea";
import { DateInput } from "../../forms/DateInput";
import { RadioGroup } from "../../forms/RadioGroup/RadioGroup";
import { Button } from "../../primitives/Button";
import styles from "./AssignmentEditModal.module.scss";

export type AssignmentData = {
  pages: number;
  time: string;
  chapter?: number | null;
  lastParagraph?: string | null;
  percent?: number | null;
  date?: string | null; // YYYY-MM-DD
  mode?: 'percent' | 'page';
};

export type AssignmentEditModalProps = {
  /**
   * Флаг, указывающий, открыто ли модальное окно
   */
  isOpen: boolean;
  /**
   * Функция, вызываемая при закрытии модального окна
   */
  onClose: () => void;
  /**
   * Начальные данные задания (если редактируем существующее)
   */
  initialData?: Partial<AssignmentData>;
  /**
   * Функция, вызываемая при сохранении задания
   */
  onSubmit: (data: AssignmentData) => void;
  /**
   * Флаг, указывающий, что задание уже оценено и не может быть изменено
   */
  isGraded?: boolean;
  /**
   * Флаг, указывающий, что дедлайн задания прошел
   */
  isDeadlinePassed?: boolean;
  /**
   * Флаг, указывающий, что форма заблокирована по другим причинам
   */
  disabled?: boolean;
  /**
   * Причина блокировки формы
   */
  disabledReason?: string;
  /**
   * Режим прогресса для задания: percent или page
   */
  mode?: 'percent' | 'page';
  /**
   * Показать выбор даты (обычно для создания задания)
   */
  showDate?: boolean;
  /**
   * Разрешить переключать режим (percent/page) внутри формы
   */
  allowModeSwitch?: boolean;
  /**
   * Режим редактирования (влияет на заголовок модалки)
   */
  isEdit?: boolean;
};

export const AssignmentEditModal: FC<AssignmentEditModalProps> = ({
  isOpen,
  onClose,
  initialData = {},
  onSubmit,
  isGraded = false,
  isDeadlinePassed = false,
  disabled = false,
  disabledReason = '',
  mode = 'page',
  showDate = false,
  allowModeSwitch = false,
  isEdit = false,
}) => {
  // Состояние для хранения данных формы
  const [formData, setFormData] = useState<AssignmentData>({
    pages: initialData.pages || 0,
    time: initialData.time || "12:00",
    chapter: initialData.chapter || null,
    lastParagraph: initialData.lastParagraph || null,
    percent: initialData.percent || null,
    date: initialData.date || null,
    mode: initialData.mode || mode,
  });

  // Состояние для хранения ошибок валидации
  const [errors, setErrors] = useState<Partial<Record<keyof AssignmentData, string>>>({});

  // Определяем, должна ли форма быть заблокирована
  const isDisabled = isGraded || disabled;

  // Сообщение о причине блокировки формы
  const disabledMessage = disabledReason || (isGraded 
    ? "Задание уже оценено и не может быть изменено" 
    : "");

  // Обновляем данные формы при изменении initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        pages: initialData.pages || 0,
        time: initialData.time || "12:00",
        chapter: initialData.chapter || null,
        lastParagraph: initialData.lastParagraph || null,
        percent: initialData.percent || null,
        date: initialData.date || null,
        mode: initialData.mode || mode,
      });
    }
  }, [initialData, mode]);

  // Обработчики изменения полей формы
  const handleChange = <K extends keyof AssignmentData>(field: K, value: AssignmentData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AssignmentData, string>> = {};
    const currentMode: 'percent' | 'page' = allowModeSwitch ? (formData.mode || mode) : mode;
    
    if (currentMode === 'page') {
      if (!formData.pages || formData.pages <= 0) {
        newErrors.pages = "Количество страниц должно быть больше 0";
      }
    } else {
      const p = formData.percent ?? 0;
      if (p <= 0 || p > 100) {
        newErrors.percent = "Процент должен быть от 1 до 100";
      }
    }
    
    if (!formData.time) {
      newErrors.time = "Время выполнения обязательно";
    }

    if (showDate && !formData.date) {
      newErrors.date = "Дата обязательна";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработчик отправки формы
  const handleSubmit = () => {
    if (validateForm()) {
      const currentMode: 'percent' | 'page' = allowModeSwitch ? (formData.mode || mode) : mode;
      onSubmit({ ...formData, mode: currentMode });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {isEdit ? "Редактирование задания" : "Новое задание"}
        </h2>
        
        {isDisabled && (
          <div className={styles.disabledWarning}>
            {disabledMessage}
          </div>
        )}
        {!isDisabled && isDeadlinePassed && (
          <div className={styles.disabledWarning}>
            Дедлайн задания прошёл — вы всё равно можете внести изменения
          </div>
        )}
      </div>

      <div className={styles.form}>
        {allowModeSwitch && (
          <RadioGroup
            name="target-mode"
            label="Режим цели"
            options={[
              { value: 'page', label: 'Страницы' },
              { value: 'percent', label: 'Проценты' },
            ]}
            value={(formData.mode || mode) as string}
            onChange={(e) => handleChange('mode', e.target.value as 'percent' | 'page')}
            disabled={isDisabled}
            required
          />
        )}

        {showDate && (
          <DateInput
            label="Дата"
            value={formData.date || ''}
            onChange={(value) => handleChange('date', value)}
            error={errors.date}
            disabled={isDisabled}
            required
          />
        )}

        {(allowModeSwitch ? (formData.mode || mode) === 'page' : mode === 'page') ? (
          <NumberInput
            label="Количество страниц"
            value={formData.pages}
            onChange={(value) => handleChange("pages", value as number)}
            min={1}
            error={errors.pages}
            disabled={isDisabled}
            required
          />
        ) : (
          <NumberInput
            label="Процент выполнения, %"
            value={formData.percent ?? 0}
            onChange={(value) => handleChange("percent", value as number)}
            min={1}
            max={100}
            error={errors.percent}
            disabled={isDisabled}
            required
          />
        )}

        <TimeInput
          label="Время выполнения"
          value={formData.time}
          onChange={(value) => handleChange("time", value)}
          error={errors.time}
          disabled={isDisabled}
          required
        />

        <NumberInput
          label="Глава"
          value={formData.chapter ?? 0}
          onChange={(value) => handleChange("chapter", (value as number) || null)}
          min={0}
          disabled={isDisabled}
        />

        <Textarea
          label="Текст параграфа"
          value={formData.lastParagraph || ''}
          onChange={(e) => handleChange("lastParagraph", e.target.value)}
          placeholder="Введите текст параграфа"
          disabled={isDisabled}
        />

        
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose}>
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isDisabled}
        >
          Сохранить
        </Button>
      </div>
    </Modal>
  );
};
