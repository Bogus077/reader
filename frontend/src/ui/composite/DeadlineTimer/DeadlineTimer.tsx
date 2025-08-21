import { FC, useState, useEffect } from "react";
import clsx from "clsx";
import { formatRemainingTime } from "../../../lib";
import { mapStatusToColor } from "../../../lib/visualStatus";
import styles from "./DeadlineTimer.module.scss";

export type DeadlineTimerProps = {
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
  status?: "pending" | "submitted" | "graded" | "missed";
  /**
   * Дополнительные CSS классы
   */
  className?: string;
};

export const DeadlineTimer: FC<DeadlineTimerProps> = ({
  date,
  time,
  tz,
  status = "pending",
  className,
}) => {
  // Состояние для хранения оставшегося времени в миллисекундах
  const [remainingTime, setRemainingTime] = useState<number>(0);
  // Состояние для отслеживания, прошел ли дедлайн
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    // Если статус не pending, не показываем таймер
    if (status !== "pending") {
      setIsExpired(true);
      return;
    }
    
    // Создаем объект даты дедлайна с учетом часового пояса
    const deadlineDate = new Date(`${date}T${time}:00${tz}`);

    // Функция для обновления оставшегося времени
    const updateRemainingTime = () => {
      const now = new Date();
      const diff = deadlineDate.getTime() - now.getTime();

      if (diff <= 0) {
        setIsExpired(true);
        setRemainingTime(0);
      } else {
        setIsExpired(false);
        setRemainingTime(diff);
      }
    };

    // Сразу обновляем время при монтировании компонента
    updateRemainingTime();

    // Устанавливаем интервал для обновления времени каждую минуту
    const intervalId = setInterval(updateRemainingTime, 60000);

    // Очищаем интервал при размонтировании компонента
    return () => clearInterval(intervalId);
  }, [date, time, tz, status]);

  // Если время истекло, не отображаем компонент
  if (isExpired) {
    return null;
  }

  // Форматируем оставшееся время в читаемый вид
  const formattedTime = formatRemainingTime(remainingTime);
  
  // Определяем цвет таймера в зависимости от оставшегося времени
  const getTimerColor = () => {
    // Если осталось меньше 3 часов (10800000 мс)
    if (remainingTime < 10800000) {
      return mapStatusToColor('missed'); // красный
    }
    // Если осталось меньше 12 часов (43200000 мс)
    else if (remainingTime < 43200000) {
      return mapStatusToColor('submitted'); // синий
    }
    // В остальных случаях
    else {
      return mapStatusToColor('pending'); // серый
    }
  };
  
  // Цветовая карта для таймера
  const colorMap: Record<string, string> = {
    green: '#2ecc71',
    blue: '#2196F3',
    red: '#F44336',
    grey: '#95a5a6'
  };
  
  const timerColor = colorMap[getTimerColor()] || colorMap.grey;
  
  const timerStyle = {
    color: timerColor,
    fontWeight: remainingTime < 10800000 ? 'bold' : 'normal' // жирный шрифт, если осталось меньше 3 часов
  };

  return (
    <div className={clsx(styles.timer, className)} style={timerStyle}>
      Осталось {formattedTime}
    </div>
  );
};
