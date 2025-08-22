import { FC } from 'react';
import styles from './StreakCard.module.scss';

export type StreakCardProps = {
  days: number;
  hint?: string;
};

export const StreakCard: FC<StreakCardProps> = ({ days, hint }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span role="img" aria-label="fire">🔥</span>
        Серия {days} дня подряд!
      </div>
      {hint && <div className={styles.sub}>{hint}</div>}
    </div>
  );
};
