import { FC, useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUnit } from "effector-react";
import { format, parseISO, isValid } from "date-fns";
import { ru } from "date-fns/locale";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import {
  Topbar,
  Tabbar,
  Card,
  Badge,
  Button,
  DayStrips,
  RatingStars,
  Skeleton,
  Modal,
  InfoCallout,
  BackButton,
} from "../../ui";
import { toast } from "../../ui/feedback/Toast";
import clsx from "clsx";
import {
  $strips,
  $assignmentByDate,
  loadStripsFx,
  loadAssignmentByDateFx,
  submitFx,
} from "../../store/student";
import {
  resolveVisualStatus,
  mapAssignmentToDayStripStatus,
  mapStatusToColor,
} from "../../lib/visualStatus";
import { Assignment, Strip } from "../../api/types";
import styles from "./DayHistory.module.scss";
import { postLog } from "../../api/client";

// Функция для форматирования даты в формате "1 января"
const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, "d MMMM", { locale: ru });
  } catch (e) {
    return dateString;
  }
};

// Текст статуса для инлайн-отображения
const getStatusText = (assignment: Assignment, tz = "+03:00") => {
  const visualStatus = resolveVisualStatus(assignment, tz);
  switch (visualStatus) {
    case "submitted":
      return "Отмечено";
    case "graded":
      return "Проверено";
    case "missed":
      return "Пропущено";
    default:
      return "Ожидает";
  }
};

// CSS-класс цвета статуса
const getStatusClass = (assignment: Assignment, tz = "+03:00") => {
  const color = mapStatusToColor(resolveVisualStatus(assignment, tz));
  switch (color) {
    case "green":
      return styles.statusSuccess;
    case "blue":
      return styles.statusInfo;
    case "red":
      return styles.statusDanger;
    default:
      return styles.statusMuted;
  }
};

// Функция для форматирования даты и времени
const formatDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, "d MMMM, HH:mm", { locale: ru });
  } catch (e) {
    return dateString;
  }
};

// Функция для определения статуса дня с использованием resolveVisualStatus и mapStatusToColor
const getStatusBadge = (assignment: Assignment, tz = "+03:00") => {
  const visualStatus = resolveVisualStatus(assignment, tz);
  const color = mapStatusToColor(visualStatus);

  switch (visualStatus) {
    case "submitted":
      return <Badge color={color}>Отмечено</Badge>;
    case "graded":
      return <Badge color={color}>Проверено</Badge>;
    case "missed":
      return <Badge color={color}>Пропущено</Badge>;
    default:
      return <Badge color={color}>Ожидает</Badge>;
  }
};

// Функция для получения иконки статуса (цвет наследуется от CSS currentColor)
const getStatusIcon = (assignment: Assignment, tz = "+03:00") => {
  const visualStatus = resolveVisualStatus(assignment, tz);
  switch (visualStatus) {
    case "submitted":
    case "graded":
      return <CheckCircle size={16} />;
    case "missed":
      return <XCircle size={16} />;
    default:
      return <Clock size={16} />;
  }
};

export const DayHistory: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const date = searchParams.get("date");

  const [strips, assignmentByDate] = useUnit([$strips, $assignmentByDate]);
  const [loadStrips, loadAssignmentByDate, submit] = useUnit([
    loadStripsFx,
    loadAssignmentByDateFx,
    submitFx,
  ]);
  const isStripsLoading = useUnit(loadStripsFx.pending);
  const isAssignmentLoading = useUnit(loadAssignmentByDateFx.pending);

  // Состояние модалки подтверждения
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Редирект на главную, если дата не указана или некорректна
  useEffect(() => {
    if (!date || !isValid(parseISO(date))) {
      navigate("/");
      return;
    }

    // Загружаем данные
    loadAssignmentByDate(date);
    loadStrips();
  }, [date, navigate, loadAssignmentByDate, loadStrips]);

  // Логируем открытие страницы истории за день
  useEffect(() => {
    if (date && isValid(parseISO(date))) {
      void postLog("history_open", { date });
    }
  }, [date]);

  // Часовой пояс пользователя
  const tz = "Europe/Samara";

  // Преобразуем данные для компонента DayStrips
  // Преобразуем данные для компонента DayStrips с использованием единой логики
  const stripsData =
    strips?.map((strip: Strip) => {
      // Нормализуем статус к одному из: 'done' | 'current' | 'future' | 'missed'
      const raw = (strip as any).status as string;
      const isSupported =
        raw === "done" ||
        raw === "current" ||
        raw === "future" ||
        raw === "missed";
      const fromBackend = isSupported
        ? (raw as "done" | "current" | "future" | "missed")
        : raw === "graded"
        ? "done"
        : raw === "submitted"
        ? "current"
        : raw === "pending"
        ? "future"
        : undefined;

      const stripStatus = fromBackend
        ? fromBackend
        : strip.assignment
        ? mapAssignmentToDayStripStatus(
            resolveVisualStatus(strip.assignment, tz)
          )
        : "future";

      const rating =
        strip.assignment?.mentor_rating !== null
          ? strip.assignment?.mentor_rating
          : undefined;

      return {
        date: strip.date,
        status: stripStatus,
        rating,
      };
    }) || [];

  // Находим текущий сегмент в strips и соответствующее задание
  const currentStrip = useMemo(() => {
    // Находим сегмент в исходных данных
    return strips.find((strip) => strip.date === date);
  }, [strips, date]);

  // Выбранное задание для дня
  const dayAssignment = assignmentByDate || currentStrip?.assignment;

  // Нужно ли показывать кнопку «Отметить как прочитано»
  const showMarkButton = useMemo(() => {
    if (!dayAssignment) return false;
    if (dayAssignment.status === "submitted") return false;
    const vs = resolveVisualStatus(dayAssignment, "+03:00");
    return vs === "pending" || vs === "missed";
  }, [dayAssignment]);

  // Подтверждение «Отметить как прочитано»
  const handleConfirmSubmit = async () => {
    if (!dayAssignment) return;
    setIsSubmitting(true);
    try {
      await submit(dayAssignment.id);
      if (date) await loadAssignmentByDate(date);
      await loadStrips();
      toast.success("Отмечено!");
    } catch (error) {
      toast.error("Не удалось отправить");
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setConfirmOpen(false);
    }
  };

  // Закрытие модалки: блокируем во время отправки
  const handleModalClose = () => {
    if (isSubmitting) return;
    setConfirmOpen(false);
  };

  // Обработчик выбора полоски дня
  const handleStripSelect = (idx: number) => {
    if (strips && strips[idx]) {
      navigate(`/history?date=${strips[idx].date}`);
    }
  };

  // Находим индексы предыдущего и следующего дней
  const { prevDate, nextDate } = useMemo(() => {
    if (!stripsData.length) return { prevDate: null, nextDate: null };

    const currentIndex = stripsData.findIndex((strip) => strip.date === date);
    if (currentIndex === -1) return { prevDate: null, nextDate: null };

    const prevDate =
      currentIndex > 0 ? stripsData[currentIndex - 1].date : null;
    const nextDate =
      currentIndex < stripsData.length - 1
        ? stripsData[currentIndex + 1].date
        : null;

    return { prevDate, nextDate };
  }, [stripsData, date]);

  // Свайпы влево/вправо для перехода Пред/След
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.changedTouches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    const SWIPE_THRESHOLD = 60; // px
    const VERTICAL_LIMIT = 40; // px

    if (absDx >= SWIPE_THRESHOLD && absDy <= VERTICAL_LIMIT) {
      if (dx < 0 && nextDate) {
        navigate(`/history?date=${nextDate}`);
      } else if (dx > 0 && prevDate) {
        navigate(`/history?date=${prevDate}`);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Если дата не указана, редирект уже выполнен
  if (!date) return null;

  return (
    <div>
      <Topbar title="История чтения" leftSlot={<BackButton />} />
      <div
        className={styles.container}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Полоски дней (как на Today) */}
        <div style={{ marginBottom: 12 }}>
          {isStripsLoading ? (
            <div>
              <Skeleton variant="rect" height={12} />
              <div style={{ height: 8 }} />
              <Skeleton variant="rect" height={12} width="80%" />
            </div>
          ) : (
            <DayStrips
              items={stripsData}
              selectedDate={date}
              onSelect={handleStripSelect}
            />
          )}
        </div>

        {/* Верхняя часть с датой и статусом */}
        {isStripsLoading ? (
          <div className={styles.header}>
            <div className={styles.date}>
              <Skeleton variant="text" height={20} width={120} />
            </div>
            <div>
              <Skeleton variant="rect" height={20} width={80} />
            </div>
          </div>
        ) : (
          <div className={styles.header}>
            <div className={styles.dateRow}>
              <div className={styles.date}>{formatDate(date)}</div>
              {(() => {
                const a = (assignmentByDate || currentStrip?.assignment) as
                  | Assignment
                  | undefined;
                return (
                  <div
                    className={clsx(
                      styles.statusInline,
                      a ? getStatusClass(a) : styles.statusMuted
                    )}
                  >
                    {a ? getStatusIcon(a) : <Clock size={16} />}
                    <span>{a ? getStatusText(a) : "Ожидает"}</span>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Карточка с заданием на день */}
        <Card className={styles.card}>
          <div className={styles.cardTitle}>Задание на день</div>

          {isAssignmentLoading ? (
            <div>
              <Skeleton variant="text" height={16} width="60%" />
              <div style={{ height: 8 }} />
              <Skeleton variant="text" height={14} width="40%" />
            </div>
          ) : assignmentByDate ? (
            <>
              <div className={styles.infoRow}>
                <div className={styles.label}>Цель:</div>
                <div className={styles.value}>
                  {assignmentByDate?.target?.percent &&
                    `${assignmentByDate.target.percent}%`}
                  {assignmentByDate?.target?.page &&
                    `стр. ${assignmentByDate.target.page}`}
                  {assignmentByDate?.target?.chapter &&
                    `глава ${assignmentByDate.target.chapter}`}
                </div>
              </div>

              {assignmentByDate.description && (
                <div className={styles.infoRow}>
                  <div className={styles.label}>Описание:</div>
                  <div className={styles.value}>
                    {assignmentByDate.description}
                  </div>
                </div>
              )}

              {/* Поддержка двух вариантов дедлайна */}
              {(() => {
                // Формируем ISO строку из даты и времени дедлайна
                const deadlineIso =
                  assignmentByDate?.date && assignmentByDate?.deadline_time
                    ? `${assignmentByDate.date}T${assignmentByDate.deadline_time}:00`
                    : null;

                return deadlineIso ? (
                  <div className={styles.infoRow}>
                    <div className={styles.label}>Дедлайн:</div>
                    <div className={styles.value}>
                      {formatDateTime(deadlineIso)}
                    </div>
                  </div>
                ) : null;
              })()}

              {assignmentByDate?.target?.last_paragraph && (
                <div className={styles.lastParagraph}>
                  <InfoCallout
                    title="Последний абзац"
                    description={assignmentByDate.target.last_paragraph}
                    tone="info"
                  />
                </div>
              )}

              {/* Кнопка отметки как прочитанного для пропущенных/ожидающих дней */}
              {showMarkButton && (
                <div style={{ marginTop: 12 }}>
                  <Button
                    variant="success"
                    onClick={() => setConfirmOpen(true)}
                    fullWidth
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <CheckCircle2 size={18} /> Отметить как прочитано
                    </span>
                  </Button>
                </div>
              )}
            </>
          ) : currentStrip ? (
            <div>
              <div className={styles.infoRow}>
                <div className={styles.label}>Статус:</div>
                <div
                  className={styles.value}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {currentStrip?.assignment &&
                    getStatusIcon(currentStrip.assignment)}
                  {(() => {
                    if (!currentStrip?.assignment) return "Нет задания";

                    const visualStatus = resolveVisualStatus(
                      currentStrip.assignment,
                      "+03:00"
                    );
                    switch (visualStatus) {
                      case "submitted":
                        return "Отмечено как прочитано";
                      case "graded":
                        return "Проверено преподавателем";
                      case "missed":
                        return "Пропущено";
                      default:
                        return "Ожидает выполнения";
                    }
                  })()}
                </div>
              </div>
              {/* Кнопка, если нет подробного assignmentByDate, но статус позволяет */}
              {showMarkButton && (
                <div style={{ marginTop: 12 }}>
                  <Button
                    variant="success"
                    onClick={() => setConfirmOpen(true)}
                    fullWidth
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <CheckCircle size={18} /> Отметить как прочитано
                    </span>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div>Информация о задании не найдена</div>
          )}
        </Card>

        {/* Дополнительная информация */}
        {(assignmentByDate?.submitted_at || currentStrip?.rating) && (
          <Card className={styles.card}>
            <div className={styles.cardTitle}>Дополнительная информация</div>

            {assignmentByDate?.submitted_at && (
              <div className={styles.infoRow}>
                <div className={styles.label}>Время сдачи:</div>
                <div className={styles.value}>
                  {formatDateTime(assignmentByDate.submitted_at)}
                </div>
              </div>
            )}

            {currentStrip?.rating !== undefined && (
              <div className={styles.infoRow}>
                <div className={styles.label}>Оценка:</div>
                <div className={styles.value}>
                  <RatingStars value={currentStrip.rating} readOnly size="sm" />
                </div>
              </div>
            )}

            {assignmentByDate?.mentor_comment && (
              <div className={styles.infoRow}>
                <div className={styles.label}>Комментарий:</div>
                <div className={styles.value}>
                  {assignmentByDate.mentor_comment}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Навигация по дням */}
        <div className={styles.navigation}>
          <Button
            variant="ghost"
            disabled={!prevDate}
            onClick={() => prevDate && navigate(`/history?date=${prevDate}`)}
            className={`${styles.navButton} ${
              !prevDate ? styles.disabled : ""
            }`}
          >
            <ArrowLeft size={16} /> Пред.
          </Button>

          <Button
            variant="ghost"
            disabled={!nextDate}
            onClick={() => nextDate && navigate(`/history?date=${nextDate}`)}
            className={`${styles.navButton} ${
              !nextDate ? styles.disabled : ""
            }`}
          >
            След. <ArrowRight size={16} />
          </Button>
        </div>
      </div>
      {/* Модалка подтверждения отметки */}
      <Modal isOpen={isConfirmOpen} onClose={handleModalClose}>
        <div>
          <h3>Подтверждение</h3>
          <p>Отметить задание как прочитано?</p>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginTop: 12,
          }}
        >
          <Button
            variant="ghost"
            onClick={handleModalClose}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <div style={{ marginLeft: "auto" }} />
          <Button onClick={handleConfirmSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Отмечаем…" : "Да, отметить"}
          </Button>
        </div>
      </Modal>
      <Tabbar />
    </div>
  );
};

export default DayHistory;
