import { ElementType, HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Heading.module.scss';

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  size?: 'xl' | 'lg' | 'md';
  compact?: boolean;
};

export function Heading({
  children,
  as: Component = 'h2',
  size = 'lg',
  compact = false,
  className,
  ...rest
}: HeadingProps) {
  return (
    <Component
      className={clsx(
        styles.heading,
        styles[size],
        compact && styles.compact,
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

/**
 * Пример использования:
 * 
 * ```tsx
 * <Heading as="h1" size="xl">Главный заголовок</Heading>
 * <Heading as="h2" size="lg">Подзаголовок</Heading>
 * <Heading as="h3" size="md" compact>Компактный заголовок</Heading>
 * ```
 */
