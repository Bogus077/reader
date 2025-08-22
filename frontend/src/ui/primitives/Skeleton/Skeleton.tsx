import { CSSProperties, HTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './Skeleton.module.scss';

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'text' | 'rect' | 'rounded' | 'circle';
  width?: number | string;
  height?: number | string;
};

export function Skeleton({
  variant = 'text',
  width,
  height,
  style,
  className,
  ...rest
}: SkeletonProps) {
  const inline: CSSProperties = { ...style };
  if (width !== undefined) inline.width = typeof width === 'number' ? `${width}px` : width;
  if (height !== undefined) inline.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={clsx(styles.skeleton, styles[variant], className)}
      style={inline}
      aria-hidden
      {...rest}
    />
  );
}

export default Skeleton;
