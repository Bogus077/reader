import { FC, ReactNode } from "react";
import clsx from "clsx";
import styles from "./Topbar.module.scss";

export type TopbarProps = {
  /**
   * Заголовок верхней панели
   */
  title: string;
  /**
   * Слот для контента слева (обычно кнопка "Назад" или меню)
   */
  leftSlot?: ReactNode;
  /**
   * Слот для контента справа (обычно кнопки действий)
   */
  rightSlot?: ReactNode;
  /**
   * Дополнительные CSS классы
   */
  className?: string;
};

export const Topbar: FC<TopbarProps> = ({
  title,
  leftSlot,
  rightSlot,
  className,
}) => {
  return (
    <header className={clsx(styles.topbar, className)}>
      <div className={styles.left}>
        {leftSlot}
      </div>
      
      <h1 className={styles.title}>
        {title}
      </h1>
      
      <div className={styles.right}>
        {rightSlot}
      </div>
    </header>
  );
};
