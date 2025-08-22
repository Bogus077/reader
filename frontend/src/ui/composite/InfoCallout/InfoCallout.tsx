import { FC, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './InfoCallout.module.scss';

type Tone = 'info' | 'warn' | 'danger';

export type InfoCalloutProps = {
  title?: ReactNode;
  description?: ReactNode;
  tone?: Tone;
  className?: string;
};

export const InfoCallout: FC<InfoCalloutProps> = ({ title, description, tone = 'info', className }) => {
  return (
    <div className={clsx(styles.callout, styles[tone], className)}>
      {title && <div className={styles.title}>{title}</div>}
      {description && <div className={styles.desc}>{description}</div>}
    </div>
  );
};
