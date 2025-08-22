import { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';
import { Spinner } from '../../primitives/Spinner/Spinner';
import styles from './Loader.module.scss';

export type LoaderProps = HTMLAttributes<HTMLDivElement> & {
  message?: string;
  fullscreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export const Loader: FC<LoaderProps> = ({
  message = 'Загрузка…',
  fullscreen = false,
  size = 'md',
  className,
  ...rest
}) => {
  if (fullscreen) {
    return (
      <div className={clsx(styles.overlay, className)} {...rest}>
        <div className={styles.box}>
          <Spinner size={size} />
          <span className={styles.text}>{message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(styles.inline, className)} {...rest}>
      <Spinner size={size} />
      {message && <span className={styles.text}>{message}</span>}
    </div>
  );
};
