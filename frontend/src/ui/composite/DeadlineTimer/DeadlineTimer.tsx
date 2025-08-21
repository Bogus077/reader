import { FC, useState, useEffect } from "react";
import clsx from "clsx";
import { formatRemainingTime } from "../../../lib";
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
   * Дополнительные CSS классы
   */
  className?: string;
};

export const DeadlineTimer: FC<DeadlineTimerProps> = ({
  date,
  time,
  tz,
  className,
}) => {
  // Состояние для хранения оставшегося времени в миллисекундах
  const [remainingTime, setRemainingTime] = useState<number>(0);
  // Состояние для отслеживания, прошел ли дедлайн
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
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
  }, [date, time, tz]);

  // Если время истекло, не отображаем компонент
  if (isExpired) {
    return null;
  }

  // Форматируем оставшееся время в читаемый вид
  const formattedTime = formatRemainingTime(remainingTime);

  return (
    <div className={clsx(styles.timer, className)}>
      Осталось {formattedTime}
    </div>
  );
};
