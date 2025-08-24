import { useEffect, useState } from "react";
import clsx from "clsx";
import styles from "./Today.module.scss";
import {
  Card,
  Button,
  Badge,
  DayStrips,
  DeadlineTimer,
  Topbar,
  Tabbar,
  InfoCallout,
  StreakCard,
  RatingStars,
  Skeleton,
} from "../../ui";
import { toast } from "../../ui/feedback/Toast";
import { Modal } from "../../ui/feedback/Modal";
import { useUnit } from "effector-react";
import {
  $today,
  $strips,
  $progress,
  $assignmentByDate,
  loadTodayFx,
  loadStripsFx,
  loadProgressFx,
  loadAssignmentByDateFx,
  submitFx,
} from "../../store/student";
import { $user } from "../../store/auth";
import { useNavigate } from "react-router-dom";
import {
  resolveVisualStatus,
  mapAssignmentToDayStripStatus,
} from "../../lib/visualStatus";
import { Strip } from "../../api/types";
import { ClipboardList, Clock, CheckCircle2, ArrowRight } from "lucide-react";

export default function StudentToday() {
  const [today, strips, progress] = useUnit([$today, $strips, $progress]);
  const assignmentByDate = useUnit($assignmentByDate);
  const load = useUnit(loadTodayFx);
  const loadStrips = useUnit(loadStripsFx);
  const loadProgress = useUnit(loadProgressFx);
  const submit = useUnit(submitFx);
  const isTodayLoading = useUnit(loadTodayFx.pending);
  const isStripsLoading = useUnit(loadStripsFx.pending);
  const isProgressLoading = useUnit(loadProgressFx.pending);
  const loadAssignmentByDate = useUnit(loadAssignmentByDateFx);
  const navigate = useNavigate();
  const user = useUnit($user);

  // Состояние модалки подтверждения
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    load();
    loadStrips();
    loadProgress();
  }, []);

  // Догружаем полные данные задания по дате, если нет оценки/комментария
  useEffect(() => {
    if (
      today?.date &&
      today.status === "graded" &&
      (today.mentor_rating == null || !today.mentor_comment)
    ) {
      loadAssignmentByDate(today.date);
    }
  }, [
    today?.date,
    today?.status,
    today?.mentor_rating,
    today?.mentor_comment,
    loadAssignmentByDate,
  ]);

  // Часовой пояс пользователя
  const tz = user?.tz || "Europe/Samara";

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

  // Подсказки для StreakCard по уровням сложности и выбор по длине стрика
  const hints = {
    easy: [
      "Запиши 3 ключевых события из главы.",
      "Сформулируй основную мысль в 1–2 предложениях.",
      "Выпиши 3–5 новых слов и их значения.",
      "Определи настроение отрывка и почему.",
      "Назови главного действующего лица сегодня.",
      "Сделай одно предположение: что будет дальше?",
      "Запиши одну цитату, которая зацепила.",
      "Что нового узнал(а) о мире произведения?",
      "Составь один вопрос к тексту.",
      "Кратко опиши место и время действия.",
      "Опиши сцену тремя деталями.",
      "Перескажи фрагмент за 20 секунд (мысленно).",
    ],
    medium: [
      "Найди конфликт: кто/что противостоит герою?",
      "Объясни поступок героя одним «почему?».",
      "Сформулируй тезис–аргумент–пример по фрагменту.",
      "Выбери одну метафору или яркий образ.",
      "Как тема текста связана с твоей жизнью?",
      "Дай альтернативное название главы (2–3 слова).",
      "Сделай мини‑конспект из 3 пунктов.",
      "Оцени сложность фрагмента по шкале 1–5 и почему.",
      "Свяжи сегодняшний фрагмент с предыдущим одной фразой.",
      "Сравни героя с другим персонажем из известного тебе текста.",
    ],
    hard: [
      "Определи идею автора и чем он её подкрепляет.",
      "Чем меняется герой в этом отрывке? 1–2 аргумента.",
      "Как меняется тон/ритм текста и к чему это ведёт?",
      "Какая деталь символична и почему?",
      "Спрогнозируй последствия решения героя.",
      "Если бы герой выбрал иначе — как изменился бы сюжет?",
      "Найди параллели с другим произведением (тема/образ).",
      "Сформулируй один спорный тезис и защиту к нему.",
      "Определи позицию автора: согласен(на) ты с ней или нет?",
      "Собери «вывод дня» — одна мысль, которую стоит запомнить.",
    ],
  } as const;

  function pickHintByStreak(streak: number): string {
    let tier: "easy" | "medium" | "hard";
    if (streak <= 3) tier = "easy";
    else if (streak <= 10) tier = "medium";
    else tier = "hard";
    const pool = hints[tier];
    const idx = (streak - 1) % pool.length; // ротация внутри пула по длине стрика
    return pool[idx];
  }

  const streakHint = progress?.currentStreak
    ? pickHintByStreak(progress.currentStreak)
    : undefined;

  // Обработчик клика по полоске дня
  const handleStripSelect = (idx: number) => {
    if (strips && strips[idx]) {
      navigate(`/history?date=${strips[idx].date}`);
    }
  };

  // Визуальный статус сегодняшнего задания
  const visualStatus = today ? resolveVisualStatus(today, tz) : "pending";

  // Если догрузили полные данные по этой же дате — используем их для отображения фидбека
  const enrichedToday =
    assignmentByDate?.date === today?.date ? assignmentByDate : today;

  // Следующая дата по списку strips — как логика кнопки "След." на /history
  const nextDate = (() => {
    if (!today?.date || !strips?.length) return null;
    const currentIndex = strips.findIndex((s: Strip) => s.date === today.date);
    if (currentIndex === -1) return null;
    return currentIndex < strips.length - 1
      ? strips[currentIndex + 1].date
      : null;
  })();

  // Человекочитаемая дата/время сдачи с учётом часового пояса пользователя
  const submittedAtText = (() => {
    if (!today?.submitted_at) return null;
    try {
      const d = new Date(today.submitted_at);
      const date = d.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: tz,
      });
      const time = d.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: tz,
      });
      return `${date}, ${time}`;
    } catch {
      return today.submitted_at as any;
    }
  })();

  // Подтверждение «Отметить как прочитано»
  const handleConfirmSubmit = async () => {
    if (!today) return;
    setIsSubmitting(true);
    try {
      await submit(today.id);
      await load();
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

  return (
    <>
      <Topbar title="Сегодня" />

      <div className="container">
        <div className={styles.mb12}>
          {isStripsLoading ? (
            <div className={styles.skeletonGrid}>
              <Skeleton variant="rect" height={12} />
              <Skeleton variant="rect" height={12} />
              <Skeleton variant="rect" height={12} width="80%" />
            </div>
          ) : (
            <DayStrips items={stripsData} onSelect={handleStripSelect} />
          )}
        </div>

        <div className={styles.h12} />

        <Card>
          <div className={clsx("hstack", styles.cardHeader)}>
            <ClipboardList size={18} color="var(--gray-700)" />
            <div className={styles.cardTitle}>Задание на сегодня</div>
          </div>

          {isTodayLoading ? (
            <div>
              <Skeleton variant="text" height={16} width="60%" />
              <div className={styles.h8} />
              <Skeleton variant="text" height={14} width="40%" />
            </div>
          ) : today ? (
            <>
              <InfoCallout
                title={
                  <span>
                    Читать до{" "}
                    {today?.target?.percent
                      ? `${today.target.percent}%`
                      : today?.target?.page
                      ? `страницы ${today.target.page}`
                      : today?.target?.chapter || "…"}
                  </span>
                }
                description={
                  today?.target?.last_paragraph
                    ? `Последний абзац: "${today.target.last_paragraph}"`
                    : undefined
                }
                tone="info"
              />

              {visualStatus === "pending" ||
                (visualStatus === "missed" && (
                  <div className={clsx("hstack", styles.rowMt12)}>
                    <Clock size={16} color="var(--danger)" />
                    <span className={styles.danger}>
                      Сдать до {today.deadline_time}
                    </span>
                    <div className={styles.mlAuto}>
                      <DeadlineTimer
                        date={today.date}
                        time={today.deadline_time}
                        tz={tz}
                        status={visualStatus}
                      />
                    </div>
                  </div>
                ))}
              {enrichedToday?.mentor_rating != null &&
                !Number.isNaN(Number(enrichedToday.mentor_rating as any)) && (
                  <div className={clsx("hstack", styles.rowMt12)}>
                    <Badge tone="success" soft>
                      {enrichedToday.status === "graded" ? "Оценено" : "Оценка"}
                    </Badge>
                    <RatingStars
                      value={Number(enrichedToday.mentor_rating)}
                      readOnly
                      size="sm"
                    />
                  </div>
                )}
              {enrichedToday?.mentor_comment?.trim() && (
                <div className={styles.mt8}>
                  <InfoCallout
                    title="Комментарий преподавателя"
                    description={enrichedToday.mentor_comment!.trim()}
                    tone="info"
                  />
                </div>
              )}

              {today.status === "submitted" && (
                <div
                  className={clsx("hstack", styles.rowMt12, styles.rowDoneAt)}
                >
                  <Badge tone="success" soft>
                    Сдано
                  </Badge>
                  {today.submitted_at && (
                    <span className={styles.grayText}>{submittedAtText}</span>
                  )}
                </div>
              )}

              {(today.status === "submitted" || today.status === "graded") &&
                nextDate && (
                  <div
                    className={clsx(
                      "hstack",
                      styles.rowMt12,
                      styles.nextButton
                    )}
                  >
                    <Button
                      onClick={() => {
                        navigate(`/history?date=${nextDate}`);
                      }}
                    >
                      Посмотреть задание на завтра
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                )}

              <div className={styles.h8} />

              {visualStatus === "pending" ||
                (visualStatus === "missed" && (
                  <Button
                    variant="success"
                    onClick={() => setConfirmOpen(true)}
                    fullWidth
                  >
                    <span className={clsx("hstack", styles.row)}>
                      <CheckCircle2 size={18} /> Отметить как прочитано
                    </span>
                  </Button>
                ))}
            </>
          ) : (
            <div className={styles.grayText}>На сегодня заданий нет</div>
          )}
        </Card>

        {/* Модалка подтверждения отметки */}
        <Modal isOpen={isConfirmOpen} onClose={handleModalClose}>
          <div>
            <h3>Подтверждение</h3>
            <p>Отметить задание как прочитано?</p>
          </div>
          <div className={clsx("hstack", styles.rowMt12)}>
            <Button
              variant="ghost"
              onClick={handleModalClose}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <div className={styles.mlAuto} />
            <Button onClick={handleConfirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Отмечаем…" : "Да, отметить"}
            </Button>
          </div>
        </Modal>

        {isProgressLoading ? (
          <>
            <div className={styles.h12} />
            <Skeleton variant="rect" height={80} />
          </>
        ) : progress?.currentStreak ? (
          <>
            <div className={styles.h12} />
            <StreakCard days={progress.currentStreak} hint={streakHint!} />
          </>
        ) : null}

        <Tabbar />
      </div>
    </>
  );
}
