import { useEffect } from "react";
import {
  Card,
  Button,
  DayStrips,
  DeadlineBadge,
  DeadlineTimer,
  Topbar,
  Tabbar,
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
import { resolveVisualStatus, mapAssignmentToDayStripStatus, mapStatusToColor } from "../../lib/visualStatus";
import { Assignment, Strip } from "../../api/types";

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
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            Прогресс по дням
          </div>
          <DayStrips items={stripsData} onSelect={handleStripSelect} />
        </div>
        {today ? (
          <>
            <div style={{ margin: "12px 0" }}>
              <div>
                <b>Читать до:</b>{" "}
                {today?.target?.percent
                  ? `${today.target.percent}%`
                  : today?.target?.page
                  ? `стр. ${today.target.page}`
                  : today?.target?.chapter || "…"}
              </div>
              <div
                className="hstack"
                style={{ alignItems: "center", gap: "8px", marginTop: "8px" }}
              >
                <b>Дедлайн:</b>
                <DeadlineTimer
                  date={today.date}
                  time={today.deadline_time}
                  tz={tz}
                  status={resolveVisualStatus(today, tz)}
                />
                {resolveVisualStatus(today, tz) !== "pending" && (
                  <span>{today.deadline_time}</span>
                )}
              </div>
              <div
                className="hstack"
                style={{ alignItems: "center", gap: "8px", marginTop: "8px" }}
              >
                <b>Статус:</b>
                <DeadlineBadge
                  date={today.date}
                  time={today.deadline_time}
                  tz={tz}
                  status={today.status}
                />
              </div>
            </div>
            {resolveVisualStatus(today, tz) === "pending" && (
                <Button
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
                  Отметить как прочитано
                </Button>
              )}
            {today.status === "submitted" && <Button disabled>Отмечено</Button>}
          </>
        ) : (
          <div>На сегодня заданий нет</div>
        )}
      </Card>

      <div style={{ height: 16 }} />
      <Card>
        <div className="hstack" style={{ justifyContent: "space-between" }}>
          <div>
            <b>Серия сейчас:</b> {progress?.currentStreak ?? "—"}
          </div>
          <div>
            <b>Лучшая серия:</b> {progress?.bestStreak ?? "—"}
          </div>
          <div>
            <b>Средняя оценка:</b> {progress?.avgRating?.toFixed?.(1) ?? "—"}
          </div>
          <div>
            <b>Выполнено дней:</b>{" "}
            {progress ? `${progress.daysDone} / ${progress.daysTotal}` : "—"}
          </div>
        </div>
      </Card>
      <Tabbar />
    </div>
  );
}
