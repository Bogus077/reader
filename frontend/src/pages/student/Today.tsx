import { useEffect } from "react";
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
import { useUnit } from "effector-react";
import {
  $today,
  $strips,
  $progress,
  loadTodayFx,
  loadStripsFx,
  loadProgressFx,
  submitFx,
} from "../../store/student";
import { $user } from "../../store/auth";
import { useNavigate } from "react-router-dom";
import {
  resolveVisualStatus,
  mapAssignmentToDayStripStatus,
} from "../../lib/visualStatus";
import { Strip } from "../../api/types";
import { BookOpen, ClipboardList, Clock, CheckCircle2 } from "lucide-react";

export default function StudentToday() {
  const [today, strips, progress] = useUnit([$today, $strips, $progress]);
  const load = useUnit(loadTodayFx);
  const loadStrips = useUnit(loadStripsFx);
  const loadProgress = useUnit(loadProgressFx);
  const submit = useUnit(submitFx);
  const isTodayLoading = useUnit(loadTodayFx.pending);
  const isStripsLoading = useUnit(loadStripsFx.pending);
  const isProgressLoading = useUnit(loadProgressFx.pending);
  const navigate = useNavigate();
  const user = useUnit($user);

  useEffect(() => {
    load();
    loadStrips();
    loadProgress();
  }, []);

  // Часовой пояс пользователя
  const tz = user?.tz || "Europe/Samara";

  // Преобразуем данные для компонента DayStrips с использованием единой логики
  const stripsData =
    strips?.map((strip: Strip) => {
      // Нормализуем статус к одному из: 'done' | 'current' | 'future' | 'missed'
      const raw = (strip as any).status as string;
      const isSupported = raw === 'done' || raw === 'current' || raw === 'future' || raw === 'missed';
      const fromBackend = isSupported
        ? (raw as 'done'|'current'|'future'|'missed')
        : raw === 'graded'
        ? 'done'
        : raw === 'submitted'
        ? 'current'
        : raw === 'pending'
        ? 'future'
        : undefined;

      const stripStatus = fromBackend
        ? fromBackend
        : strip.assignment
        ? mapAssignmentToDayStripStatus(resolveVisualStatus(strip.assignment, tz))
        : 'future';

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

  return (
    <>
      <Topbar title="Сегодня" />

      <div className="container">
        <div style={{ marginBottom: 12 }}>
          {isStripsLoading ? (
            <div style={{ display: "grid", gap: 8 }}>
              <Skeleton variant="rect" height={12} />
              <Skeleton variant="rect" height={12} />
              <Skeleton variant="rect" height={12} width="80%" />
            </div>
          ) : (
            <DayStrips items={stripsData} onSelect={handleStripSelect} />
          )}
        </div>

        <div style={{ height: 12 }} />

        <Card>
          <div
            className="hstack"
            style={{ alignItems: "center", gap: 8, marginBottom: 12 }}
          >
            <ClipboardList size={18} color="var(--gray-700)" />
            <div style={{ fontWeight: 700 }}>Задание на сегодня</div>
          </div>

          {isTodayLoading ? (
            <div>
              <Skeleton variant="text" height={16} width="60%" />
              <div style={{ height: 8 }} />
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

              {visualStatus === "pending" && (
                <div
                  className="hstack"
                  style={{ alignItems: "center", gap: 8, marginTop: 12 }}
                >
                  <Clock size={16} color="var(--danger)" />
                  <span style={{ color: "var(--danger)" }}>
                    Сдать до {today.deadline_time}
                  </span>
                  <div style={{ marginLeft: "auto" }}>
                    <DeadlineTimer
                      date={today.date}
                      time={today.deadline_time}
                      tz={tz}
                      status={visualStatus}
                    />
                  </div>
                </div>
              )}

              {today.status === "graded" && (
                <>
                  <div
                    className="hstack"
                    style={{ alignItems: "center", gap: 8, marginTop: 12 }}
                  >
                    <Badge tone="success" soft>
                      Оценено
                    </Badge>
                    {today.mentor_rating != null &&
                      !Number.isNaN(Number(today.mentor_rating)) && (
                        <RatingStars
                          value={Number(today.mentor_rating)}
                          readOnly
                          size="sm"
                        />
                      )}
                  </div>
                  {today.mentor_comment?.trim() && (
                    <div style={{ marginTop: 8 }}>
                      <InfoCallout
                        title="Комментарий ментора"
                        description={today.mentor_comment!.trim()}
                        tone="info"
                      />
                    </div>
                  )}
                </>
              )}

              {today.status === "submitted" && (
                <div
                  className="hstack"
                  style={{ alignItems: "center", gap: 8, marginTop: 12 }}
                >
                  <Badge tone="success" soft>
                    Сдано
                  </Badge>
                  {today.submitted_at && (
                    <span style={{ color: "var(--gray-700)" }}>
                      Сдано: {today.submitted_at}
                    </span>
                  )}
                </div>
              )}

              <div style={{ height: 8 }} />

              {visualStatus === "pending" && (
                <Button
                  variant="success"
                  onClick={async () => {
                    try {
                      await submit(today.id);
                      await load();
                      await loadStrips();
                      toast.success("Отмечено!");
                    } catch (error) {
                      toast.error("Не удалось отправить");
                      console.error(error);
                    }
                  }}
                >
                  <span
                    className="hstack"
                    style={{ alignItems: "center", gap: 8 }}
                  >
                    <CheckCircle2 size={18} /> Отметить как прочитано
                  </span>
                </Button>
              )}
            </>
          ) : (
            <div style={{ color: "var(--gray-700)" }}>
              На сегодня заданий нет
            </div>
          )}
        </Card>

        {isProgressLoading ? (
          <>
            <div style={{ height: 12 }} />
            <Skeleton variant="rect" height={80} />
          </>
        ) : progress?.currentStreak ? (
          <>
            <div style={{ height: 12 }} />
            <StreakCard days={progress.currentStreak} hint={streakHint!} />
          </>
        ) : null}

        <Tabbar />
      </div>
    </>
  );
}
