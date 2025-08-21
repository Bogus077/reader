import { FC, useMemo } from "react";
import { Badge, BadgeTone } from "../../feedback";
import { formatTime } from "../../../lib";
import { resolveVisualStatus, mapStatusToColor } from "../../../lib/visualStatus";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tzPlugin from 'dayjs/plugin/timezone';
dayjs.extend(utc); dayjs.extend(tzPlugin);

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
  const { badgeColor, badgeText } = useMemo(() => {
    // Используем ту же логику, что и в resolveVisualStatus
    const deadline = dayjs.tz(`${date} ${time}`, tz);
    const now = dayjs().tz(tz);
    const isDeadlinePassed = now.isAfter(deadline);
    
    // Определяем визуальный статус
    let visualStatus: "pending" | "submitted" | "missed" | "graded";
    
    if (status === "graded") {
      visualStatus = "graded";
    } else if (status === "submitted") {
      visualStatus = "submitted";
    } else if (status === "missed" || (isDeadlinePassed && status === "pending")) {
      visualStatus = "missed";
    } else {
      visualStatus = "pending";
    }
    
    // Получаем цвет из функции mapStatusToColor
    const color = mapStatusToColor(visualStatus);
    
    // Маппинг цветов для Badge
    const colorToneMap: Record<string, BadgeTone> = {
      green: "success",  // graded
      blue: "primary",   // submitted
      red: "danger",     // missed
      grey: "muted"      // pending
    };
    
    // Определяем текст бейджа
    let badgeText: string;
    
    switch (visualStatus) {
      case "graded":
        badgeText = "Сдано";
        break;
      case "submitted":
        badgeText = "Сдано";
        break;
      case "missed":
        badgeText = "Просрочено";
        break;
      default: // pending
        badgeText = `Сдать до ${formatTime(time)}`;
    }
    
    return { badgeColor: colorToneMap[color] || "muted", badgeText };
  }, [date, time, tz, status]);

  return (
    <Badge tone={badgeColor} className={className}>
      {badgeText}
    </Badge>
  );
};
