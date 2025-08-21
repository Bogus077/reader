import { FC, useState } from "react";
import { Modal } from "../../feedback/Modal";
import { RatingStars } from "../../data/RatingStars/RatingStars";
import { Textarea } from "../../forms/Textarea";
import { Button } from "../../primitives/Button";
import styles from "./GradeModal.module.scss";

export type GradeModalProps = {
  /**
   * Флаг, указывающий, открыто ли модальное окно
   */
  isOpen: boolean;
  /**
   * Функция, вызываемая при закрытии модального окна
   */
  onClose: () => void;
  /**
   * Дата задания в формате YYYY-MM-DD
   */
  date: string;
  /**
   * Краткое описание задания
   */
  targetSummary: string;
  /**
   * Функция, вызываемая при сохранении оценки
   */
  onSubmit: (data: { rating: number; comment: string }) => void;
  /**
   * Начальное значение рейтинга (если редактируем существующую оценку)
   */
  initialRating?: number;
  /**
   * Начальное значение комментария (если редактируем существующую оценку)
   */
  initialComment?: string;
};

export const GradeModal: FC<GradeModalProps> = ({
  isOpen,
  onClose,
  date,
  targetSummary,
  onSubmit,
  initialRating = 0,
  initialComment = "",
}) => {
  // Состояние для хранения выбранного рейтинга и комментария
  const [rating, setRating] = useState<number>(initialRating);
  const [comment, setComment] = useState<string>(initialComment);

  // Форматируем дату для отображения
  const formattedDate = new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Обработчик сохранения оценки
  const handleSubmit = () => {
    onSubmit({ rating, comment });
    onClose();
  };

  // Обработчик отмены
  const handleCancel = () => {
    // Сбрасываем состояние при закрытии
    setRating(initialRating);
    setComment(initialComment);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <div className={styles.header}>
        <h2 className={styles.title}>Оценка задания</h2>
        <div className={styles.date}>{formattedDate}</div>
      </div>

      <div className={styles.summary}>
        <p>{targetSummary}</p>
      </div>

      <div className={styles.ratingContainer}>
        <label className={styles.ratingLabel}>Оценка:</label>
        <RatingStars
          value={rating}
          onChange={setRating}
          size="lg"
          className={styles.rating}
        />
      </div>

      <Textarea
        label="Комментарий"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Напишите комментарий к оценке..."
        className={styles.comment}
      />

      <div className={styles.actions}>
        <Button variant="ghost" onClick={handleCancel}>
          Отмена
        </Button>
        <Button onClick={handleSubmit} disabled={rating === 0}>
          Сохранить
        </Button>
      </div>
    </Modal>
  );
};
