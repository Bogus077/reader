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

  // Функция для проверки, прошел ли дедлайн
  const isDeadlinePassed = (date: string, time: string): boolean => {
    const now = new Date();
    const [hours, minutes] = time.split(":").map(Number);
    const deadlineDate = new Date(date);
    deadlineDate.setHours(hours, minutes);
    return now > deadlineDate;
  };

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
          <DayStrips items={strips} onSelect={handleStripSelect} />
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
                {today.status === "pending" ? (
                  <DeadlineTimer
                    date={today.deadline_date}
                    time={today.deadline_time}
                    tz="+0300"
                  />
                ) : (
                  <span>{today.deadline_time}</span>
                )}
              </div>
              <div
                className="hstack"
                style={{ alignItems: "center", gap: "8px", marginTop: "8px" }}
              >
                <b>Статус:</b>
                <DeadlineBadge
                  date={today.deadline_date}
                  time={today.deadline_time}
                  tz="+0300"
                  status={
                    today.status === "done"
                      ? "submitted"
                      : today.status === "graded"
                      ? "graded"
                      : today.status === "missed"
                      ? "missed"
                      : "pending"
                  }
                />
              </div>
            </div>
            {today.status === "pending" &&
              !isDeadlinePassed(today.deadline_date, today.deadline_time) && (
                <Button
                  onClick={async () => {
                    try {
                      await submit(today.id);
                      await load();
                      await loadStrips();
                      toast.success("Задание успешно отмечено как прочитанное");
                    } catch (error) {
                      toast.error("Ошибка при отправке задания");
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
