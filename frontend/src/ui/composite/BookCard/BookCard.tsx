import { FC, useEffect, useRef, useState } from "react";
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
  status?: "in_progress" | "finished";
  /**
   * Описание книги (опционально)
   */
  description?: string;
  /**
   * Ссылка на источник (опционально)
   */
  sourceUrl?: string;
  /**
   * Компактный вариант отображения
   * @default false
   */
  compact?: boolean;
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
  description,
  sourceUrl,
  compact = false,
  className,
  onClick,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [canToggle, setCanToggle] = useState(false);
  const descRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    // Запуск пересчёта после рендера
    const raf = requestAnimationFrame(() => {
      try {
        const needsToggle = el.scrollHeight > el.clientHeight + 1;
        setCanToggle(needsToggle);
      } catch {}
    });
    return () => cancelAnimationFrame(raf);
  }, [description, compact]);

  useEffect(() => {
    const onResize = () => {
      const el = descRef.current;
      if (!el) return;
      const needsToggle = el.scrollHeight > el.clientHeight + 1;
      setCanToggle(needsToggle);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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
          <div
            className={styles.statusBadge}
            aria-label={status === "finished" ? "Прочитано" : "В процессе"}
          >
            <Badge tone={status === "finished" ? "success" : "warning"}>
              {status === "finished" ? "Прочитано" : "В процессе"}
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

          <div
            className={styles.difficulty}
            title={`Сложность: ${normalizedDifficulty} из 5`}
          >
            {difficultyDots}
          </div>
        </div>
        {description && (
          <>
            <p
              ref={descRef}
              className={clsx(
                styles.description,
                expanded
                  ? styles.descriptionExpanded
                  : styles.descriptionCollapsed
              )}
              title={description}
            >
              {description}
            </p>
            {(canToggle || expanded) && (
              <button
                type="button"
                className={styles.readMore}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded((v) => !v);
                }}
                aria-expanded={expanded}
                aria-label={
                  expanded ? "Свернуть описание" : "Развернуть описание"
                }
              >
                {expanded ? "Свернуть" : "Развернуть описание"}
              </button>
            )}
          </>
        )}
        {sourceUrl &&
          (() => {
            let domain = "";
            try {
              const u = new URL(sourceUrl);
              domain = u.hostname.replace(/^www\./, "");
            } catch {}
            const label = domain ? `Читать на ${domain}` : "Читать источник";
            return (
              <a
                className={styles.sourceButton}
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Открыть источник «${title}» на ${
                  domain || "внешнем сайте"
                } в новой вкладке`}
                title={label}
              >
                {label}
              </a>
            );
          })()}

        {progress !== undefined && (
          <div className={styles.progressWrapper}>
            <ProgressBar value={progress} className={styles.progress} />
          </div>
        )}
      </div>
    </div>
  );
};
