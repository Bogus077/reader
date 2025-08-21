import { FC, useMemo } from "react";
import { Badge } from "../../feedback";
import { formatTime } from "../../../lib";

export type DeadlineStatus = "pending" | "submitted" | "graded" | "missed";

export type DeadlineBadgeProps = {
  /**
   * Дата дедлайна в формате YYYY-MM-DD
   */
  date: string;
  /**
   * Время дедлайна в формате HH:mm
   */
  time: string;
  /**
   * Часовой пояс
   */
  tz: string;
  /**
   * Статус задания
   */
  status: DeadlineStatus;
  /**
   * Дополнительные CSS классы
   */
  className?: string;
};

export const DeadlineBadge: FC<DeadlineBadgeProps> = ({
  date,
  time,
  tz,
  status,
  className,
}) => {
  // Определяем визуальный статус и текст бейджа
  const { visualStatus, badgeText } = useMemo(() => {
    // Создаем объект даты дедлайна с учетом часового пояса
    const deadlineDate = new Date(`${date}T${time}:00${tz}`);
    const now = new Date();

    // Если статус уже graded, то всегда показываем "Сдано" с зеленым бейджем
    if (status === "graded") {
      return { visualStatus: "success" as const, badgeText: "Сдано" };
    }

    // Если статус submitted, то показываем "Сдано" с синим бейджем
    if (status === "submitted") {
      return { visualStatus: "primary" as const, badgeText: "Сдано" };
    }

    // Проверяем, просрочен ли дедлайн
    const isDeadlinePassed = now > deadlineDate;

    // Если сегодня и время прошло, или статус уже missed, то показываем "Просрочено"
    if (status === "missed" || (isDeadlinePassed && status === "pending")) {
      return { visualStatus: "danger" as const, badgeText: "Просрочено" };
    }

    // В остальных случаях показываем "Сдать до [время]"
    return {
      visualStatus: "warning" as const,
      badgeText: `Сдать до ${formatTime(time)}`,
    };
  }, [date, time, tz, status]);

  return (
    <Badge tone={visualStatus} className={className}>
      {badgeText}
    </Badge>
  );
};
