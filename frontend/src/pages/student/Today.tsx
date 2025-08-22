import { useEffect } from "react";
import {
  Card,
  Button,
  DayStrips,
  DeadlineTimer,
  Topbar,
  Tabbar,
  InfoCallout,
  StreakCard,
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
import { useNavigate } from "react-router-dom";
import { resolveVisualStatus, mapAssignmentToDayStripStatus } from "../../lib/visualStatus";
import { Strip } from "../../api/types";
import { BookOpen, ClipboardList, Clock, CheckCircle2 } from "lucide-react";

export default function StudentToday() {
  const [today, strips, progress] = useUnit([$today, $strips, $progress]);
  const load = useUnit(loadTodayFx);
  const loadStrips = useUnit(loadStripsFx);
  const loadProgress = useUnit(loadProgressFx);
  const submit = useUnit(submitFx);
  const navigate = useNavigate();

  useEffect(() => {
    load();
    loadStrips();
    loadProgress();
  }, []);

  // Часовой пояс пользователя
  const tz = "+03:00";

  // Преобразуем данные для компонента DayStrips с использованием единой логики
  const stripsData = strips?.map((strip: Strip) => {
    // Если есть задание, определяем его визуальный статус
    const visualStatus = strip.assignment ? resolveVisualStatus(strip.assignment, tz) : 'pending';
    // Преобразуем визуальный статус в статус для DayStrips
    const stripStatus = mapAssignmentToDayStripStatus(visualStatus);
    
    // Преобразуем mentor_rating в number | undefined для соответствия типу DayStripItem
    const rating = strip.assignment?.mentor_rating !== null ? strip.assignment?.mentor_rating : undefined;
    
    return {
      date: strip.date,
      status: stripStatus,
      rating
    };
  }) || [];

  // Обработчик клика по полоске дня
  const handleStripSelect = (idx: number) => {
    if (strips && strips[idx]) {
      navigate(`/history?date=${strips[idx].date}`);
    }
  };

  return (
    <div className="container">
      <Topbar title="Сегодня" />
      <Card>
        <div style={{ marginBottom: 12 }}>
          <div className="hstack" style={{ alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <BookOpen size={18} color="var(--gray-700)" />
            <div style={{ fontWeight: 600 }}>Прогресс по дням</div>
          </div>
          <DayStrips items={stripsData} onSelect={handleStripSelect} />
        </div>
      </Card>

      <div style={{ height: 12 }} />

      <Card>
        <div className="hstack" style={{ alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <ClipboardList size={18} color="var(--gray-700)" />
          <div style={{ fontWeight: 700 }}>Задание на сегодня</div>
        </div>

        {today ? (
          <>
            <InfoCallout
              title={<span>Читать до {today?.target?.percent ? `${today.target.percent}%` : today?.target?.page ? `страницы ${today.target.page}` : today?.target?.chapter || '…'}</span>}
              description={today?.target?.last_paragraph ? `Последний абзац: "${today.target.last_paragraph}"` : undefined}
              tone="info"
            />

            <div className="hstack" style={{ alignItems: 'center', gap: 8, marginTop: 12 }}>
              <Clock size={16} color="var(--danger)" />
              <span style={{ color: 'var(--danger)' }}>Сдать до {today.deadline_time}</span>
              <div style={{ marginLeft: 'auto' }}>
                <DeadlineTimer
                  date={today.date}
                  time={today.deadline_time}
                  tz={tz}
                  status={resolveVisualStatus(today, tz)}
                />
              </div>
            </div>

            <div style={{ height: 8 }} />

            {resolveVisualStatus(today, tz) === "pending" && (
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
                <span className="hstack" style={{ alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={18} /> Отметить как прочитано
                </span>
              </Button>
            )}
            {today.status === "submitted" && (
              <Button variant="success" disabled>
                <span className="hstack" style={{ alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={18} /> Отмечено
                </span>
              </Button>
            )}
          </>
        ) : (
          <div style={{ color: 'var(--gray-700)' }}>На сегодня заданий нет</div>
        )}
      </Card>

      {progress?.currentStreak ? (
        <>
          <div style={{ height: 12 }} />
          <StreakCard days={progress.currentStreak} hint="Попробуй выписать 3 ключевых события из прочитанного" />
        </>
      ) : null}

      <Tabbar />
    </div>
  );
}
