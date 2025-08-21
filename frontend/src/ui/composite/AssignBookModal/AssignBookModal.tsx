import { FC, useState, ChangeEvent } from "react";
import { Modal } from "../../feedback/Modal";
import { Select } from "../../forms/Select";
import { NumberInput } from "../../forms/NumberInput";
import { TimeInput } from "../../forms/TimeInput";
import { DateInput } from "../../forms/DateInput/DateInput";
import { Button } from "../../primitives/Button";
import { RadioGroup } from "../../forms/RadioGroup";
import styles from "./AssignBookModal.module.scss";

export type AssignBookData = {
  bookId: number;
  mode: "percent" | "page";
  dailyTarget: number;
  deadlineTime: string;
  startDate: string;
};

export type AssignBookModalProps = {
  /**
   * Флаг, указывающий, открыто ли модальное окно
   */
  isOpen: boolean;
  /**
   * Функция, вызываемая при закрытии модального окна
   */
  onClose: () => void;
  /**
   * Список доступных книг
   */
  availableBooks: Array<{ id: number; title: string; author: string }>;
  /**
   * Функция, вызываемая при сохранении
   */
  onSubmit: (data: AssignBookData) => void;
  /**
   * ID студента
   */
  studentId: number;
  /**
   * Флаг загрузки
   */
  isLoading?: boolean;
};

export const AssignBookModal: FC<AssignBookModalProps> = ({
  isOpen,
  onClose,
  availableBooks,
  onSubmit,
  studentId,
  isLoading = false,
}) => {
  // Состояние для хранения данных формы
  const [formData, setFormData] = useState<AssignBookData>({
    bookId: 0,
    mode: "percent",
    dailyTarget: 10,
    deadlineTime: "18:00",
    startDate: new Date().toISOString().split("T")[0],
  });

  // Состояние для хранения ошибок валидации
  const [errors, setErrors] = useState<Partial<Record<keyof AssignBookData, string>>>({});

  // Обработчики изменения полей формы
  const handleChange = <K extends keyof AssignBookData>(field: K, value: AssignBookData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AssignBookData, string>> = {};
    
    if (!formData.bookId) {
      newErrors.bookId = "Выберите книгу";
    }
    
    if (formData.dailyTarget <= 0) {
      newErrors.dailyTarget = "Ежедневная цель должна быть больше 0";
    }
    
    if (!formData.deadlineTime) {
      newErrors.deadlineTime = "Укажите время дедлайна";
    }
    
    if (!formData.startDate) {
      newErrors.startDate = "Укажите дату начала";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработчик отправки формы
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <div className={styles.header}>
        <h2 className={styles.title}>Назначить книгу</h2>
      </div>

      <div className={styles.form}>
        <Select
          label="Книга"
          value={formData.bookId.toString()}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange("bookId", Number(e.target.value))}
          options={availableBooks.map((book) => ({
            value: book.id.toString(),
            label: `${book.title} (${book.author})`,
          }))}
          error={errors.bookId}
          disabled={isLoading}
          required
        />

        <RadioGroup
          name="reading-mode"
          label="Режим чтения"
          value={formData.mode}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("mode", e.target.value as "percent" | "page")}
          options={[
            { value: "percent", label: "Процент от книги" },
            { value: "page", label: "Количество страниц" },
          ]}
          disabled={isLoading}
        />

        <NumberInput
          label={`Ежедневная цель (${formData.mode === "percent" ? "%" : "стр."})`}
          value={formData.dailyTarget}
          onChange={(value) => handleChange("dailyTarget", value as number)}
          min={1}
          max={formData.mode === "percent" ? 100 : undefined}
          error={errors.dailyTarget}
          disabled={isLoading}
          required
        />

        <DateInput
          label="Дата начала"
          value={formData.startDate}
          onChange={(value: string) => handleChange("startDate", value)}
          error={errors.startDate}
          disabled={isLoading}
          required
        />

        <TimeInput
          label="Время дедлайна"
          value={formData.deadlineTime}
          onChange={(value: string) => handleChange("deadlineTime", value)}
          error={errors.deadlineTime}
          disabled={isLoading}
          required
        />
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose} disabled={isLoading}>
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading}
          loading={isLoading}
        >
          Назначить
        </Button>
      </div>
    </Modal>
  );
};
