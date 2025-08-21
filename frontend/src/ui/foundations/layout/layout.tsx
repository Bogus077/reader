import { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './layout.module.scss';

type GapSize = '1' | '2' | '3' | '4' | '6' | '8';
type Alignment = 'start' | 'center' | 'end';
type Justify = 'start' | 'center' | 'end' | 'between';
type ContainerSize = 'sm' | 'md' | 'lg' | 'xl';

export type StackProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  gap?: GapSize;
};

export function Stack({ children, gap = '4', className, ...rest }: StackProps) {
  return (
    <div
      className={clsx(styles.stack, styles[`gap-${gap}`], className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export type HStackProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  gap?: GapSize;
  align?: Alignment;
  justify?: Justify;
};

export function HStack({
  children,
  gap = '4',
  align = 'center',
  justify = 'start',
  className,
  ...rest
}: HStackProps) {
  return (
    <div
      className={clsx(
        styles.hstack,
        styles[`gap-${gap}`],
        styles[`align-${align}`],
        styles[`justify-${justify}`],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  size?: ContainerSize;
};

export function Container({
  children,
  size = 'lg',
  className,
  ...rest
}: ContainerProps) {
  return (
    <div
      className={clsx(
        styles.container,
        styles[`container-${size}`],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * Примеры использования:
 * 
 * ```tsx
 * // Вертикальный стек
 * <Stack gap="4">
 *   <div>Элемент 1</div>
 *   <div>Элемент 2</div>
 * </Stack>
 * 
 * // Горизонтальный стек
 * <HStack gap="2" justify="between">
 *   <div>Слева</div>
 *   <div>Справа</div>
 * </HStack>
 * 
 * // Контейнер
 * <Container size="md">
 *   <p>Контент с ограниченной шириной</p>
 * </Container>
 * ```
 */
