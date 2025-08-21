import { FC, useState, ChangeEvent } from "react";
import { Modal } from "../../feedback/Modal";
import { NumberInput } from "../../forms/NumberInput";
import { TimeInput } from "../../forms/TimeInput";
import { DateInput } from "../../forms/DateInput/DateInput";
import { Button } from "../../primitives/Button";
import { RadioGroup } from "../../forms/RadioGroup";
import styles from "./GeneratePlanModal.module.scss";

export type GeneratePlanData = {
  studentBookId: number;
  mode: "percent" | "page";
  dailyTarget: number;
  deadlineTime: string;
  startDate: string;
  endDate: string;
};

export type GeneratePlanModalProps = {
  /**
   * Флаг, указывающий, открыто ли модальное окно
   */
  isOpen: boolean;
  /**
   * Функция, вызываемая при закрытии модального окна
   */
  onClose: () => void;
  /**
   * Функция, вызываемая при сохранении
   */
  onSubmit: (data: GeneratePlanData) => void;
  /**
   * ID активной книги студента
   */
  studentBookId: number;
  /**
   * Текущий режим чтения
   */
  currentMode: "percent" | "page";
  /**
   * Текущая ежедневная цель
   */
  currentDailyTarget: number;
  /**
   * Флаг загрузки
   */
  isLoading?: boolean;
};

export const GeneratePlanModal: FC<GeneratePlanModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  studentBookId,
  currentMode,
  currentDailyTarget,
  isLoading = false,
}) => {
  // Получаем текущую дату
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Получаем дату через 2 недели
  const twoWeeksLater = new Date(today);
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
  
  // Форматируем даты в строки YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  // Состояние для хранения данных формы
  const [formData, setFormData] = useState<GeneratePlanData>({
    studentBookId,
    mode: currentMode,
    dailyTarget: currentDailyTarget,
    deadlineTime: "18:00",
    startDate: formatDate(tomorrow),
    endDate: formatDate(twoWeeksLater),
  });

  // Состояние для хранения ошибок валидации
  const [errors, setErrors] = useState<Partial<Record<keyof GeneratePlanData, string>>>({});

  // Обработчики изменения полей формы
  const handleChange = <K extends keyof GeneratePlanData>(field: K, value: GeneratePlanData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof GeneratePlanData, string>> = {};
    
    if (formData.dailyTarget <= 0) {
      newErrors.dailyTarget = "Ежедневная цель должна быть больше 0";
    }
    
    if (!formData.deadlineTime) {
      newErrors.deadlineTime = "Укажите время дедлайна";
    }
    
    if (!formData.startDate) {
      newErrors.startDate = "Укажите дату начала";
    }
    
    if (!formData.endDate) {
      newErrors.endDate = "Укажите дату окончания";
    }
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = "Дата окончания должна быть позже даты начала";
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
        <h2 className={styles.title}>Сгенерировать план</h2>
      </div>

      <div className={styles.form}>
        <RadioGroup
          name="reading-mode-plan"
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

        <DateInput
          label="Дата окончания"
          value={formData.endDate}
          onChange={(value: string) => handleChange("endDate", value)}
          error={errors.endDate}
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

        <div className={styles.info}>
          <p>План будет сгенерирован только для рабочих дней (пн-пт).</p>
          <p>Существующие задания не будут перезаписаны.</p>
        </div>
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
          Сгенерировать
        </Button>
      </div>
    </Modal>
  );
};
