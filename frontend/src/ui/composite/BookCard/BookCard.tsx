import { FC, ReactNode } from "react";
import clsx from "clsx";
import { Badge } from "../../feedback/Badge/Badge";
import { ProgressBar } from "../../data/ProgressBar/ProgressBar";
import styles from "./BookCard.module.scss";

export type BookCardProps = {
  /**
   * URL обложки книги
   */
  coverUrl: string;
  /**
   * Название книги
   */
  title: string;
  /**
   * Автор книги
   */
  author: string;
  /**
   * Категория книги
   */
  category: string;
  /**
   * Сложность книги (от 1 до 5)
   */
  difficulty: number;
  /**
   * Прогресс чтения (в процентах, опционально)
   */
  progress?: number;
  /**
   * Статус книги для отображения бейджа
   */
  status?: 'in_progress' | 'finished';
  /**
   * Компактный вариант отображения
   * @default false
   */
  compact?: boolean;
  /**
   * Слот для кнопки действия
   */
  actionButton?: ReactNode;
  /**
   * Дополнительные CSS классы
   */
  className?: string;
  /**
   * Обработчик клика по карточке
   */
  onClick?: () => void;
};

export const BookCard: FC<BookCardProps> = ({
  coverUrl,
  title,
  author,
  category,
  difficulty,
  progress,
  status,
  compact = false,
  actionButton,
  className,
  onClick,
}) => {
  // Нормализуем сложность в диапазоне от 1 до 5
  const normalizedDifficulty = Math.max(1, Math.min(5, Math.round(difficulty)));
  
  // Генерируем точки сложности
  const difficultyDots = Array.from({ length: 5 }).map((_, index) => (
    <span 
      key={index} 
      className={clsx(
        styles.difficultyDot,
        index < normalizedDifficulty && styles.active
      )}
    />
  ));

  return (
    <div 
      className={clsx(
        styles.card,
        compact && styles.compact,
        onClick && styles.clickable,
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.coverWrapper}>
        {status && (
          <div className={styles.statusBadge} aria-label={status === 'finished' ? 'Прочитано' : 'В процессе'}>
            <Badge tone={status === 'finished' ? 'success' : 'warning'}>
              {status === 'finished' ? 'Прочитано' : 'В процессе'}
            </Badge>
          </div>
        )}
        <img 
          src={coverUrl} 
          alt={`Обложка книги "${title}"`} 
          className={styles.cover}
        />
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title} title={title}>
          {title}
        </h3>
        
        <div className={styles.author}>{author}</div>
        
        <div className={styles.meta}>
          <Badge tone="info" className={styles.category}>
            {category}
          </Badge>
          
          <div className={styles.difficulty} title={`Сложность: ${normalizedDifficulty} из 5`}>
            {difficultyDots}
          </div>
        </div>
        
        {progress !== undefined && (
          <div className={styles.progressWrapper}>
            <ProgressBar 
              value={progress} 
              className={styles.progress}
            />
          </div>
        )}
        
        {actionButton && (
          <div className={styles.action}>
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );
};
