import { FC, useState, useEffect } from "react";
import { Modal } from "../../feedback/Modal";
import { Input } from "../../forms/Input";
import { NumberInput } from "../../forms/NumberInput";
import { TimeInput } from "../../forms/TimeInput";
import { Textarea } from "../../forms/Textarea";
import { Button } from "../../primitives/Button";
import styles from "./AssignmentEditModal.module.scss";

export type AssignmentData = {
  title: string;
  pages: number;
  time: string;
  description: string;
  chapter?: number | null;
  lastParagraph?: string | null;
  percent?: number | null;
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
}) => {
  // Состояние для хранения данных формы
  const [formData, setFormData] = useState<AssignmentData>({
    title: initialData.title || "",
    pages: initialData.pages || 0,
    time: initialData.time || "12:00",
    description: initialData.description || "",
    chapter: initialData.chapter || null,
    lastParagraph: initialData.lastParagraph || null,
    percent: initialData.percent || null,
  });

  // Состояние для хранения ошибок валидации
  const [errors, setErrors] = useState<Partial<Record<keyof AssignmentData, string>>>({});

  // Определяем, должна ли форма быть заблокирована
  const isDisabled = isGraded || isDeadlinePassed || disabled;

  // Сообщение о причине блокировки формы
  const disabledMessage = disabledReason || (isGraded 
    ? "Задание уже оценено и не может быть изменено" 
    : isDeadlinePassed 
      ? "Дедлайн задания прошел, изменение невозможно" 
      : "");

  // Обновляем данные формы при изменении initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        pages: initialData.pages || 0,
        time: initialData.time || "12:00",
        description: initialData.description || "",
        chapter: initialData.chapter || null,
        lastParagraph: initialData.lastParagraph || null,
        percent: initialData.percent || null,
      });
    }
  }, [initialData]);

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
    
    if (!formData.title.trim()) {
      newErrors.title = "Название задания обязательно";
    }
    
    if (mode === 'page') {
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработчик отправки формы
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {initialData.title ? "Редактирование задания" : "Новое задание"}
        </h2>
        
        {isDisabled && (
          <div className={styles.disabledWarning}>
            {disabledMessage}
          </div>
        )}
      </div>

      <div className={styles.form}>
        <Input
          label="Название задания"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Введите название задания"
          error={errors.title}
          disabled={isDisabled}
          required
        />

        {mode === 'page' ? (
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

        <Textarea
          label="Описание"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Введите описание задания"
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
