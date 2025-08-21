import { ElementType, HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Text.module.scss';

export type TextProps = HTMLAttributes<HTMLParagraphElement | HTMLSpanElement> & {
  children: ReactNode;
  as?: 'p' | 'span';
  tone?: 'default' | 'muted' | 'danger' | 'success';
  dim?: boolean;
  truncate?: boolean;
};

export function Text({
  children,
  as: Component = 'p',
  tone = 'default',
  dim = false,
  truncate = false,
  className,
  ...rest
}: TextProps) {
  return (
    <Component
      className={clsx(
        styles.text,
        styles[tone],
        dim && styles.dim,
        truncate && styles.truncate,
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
 * <Text>Обычный текст</Text>
 * <Text as="span" tone="muted">Приглушенный текст</Text>
 * <Text tone="danger" dim>Приглушенный текст ошибки</Text>
 * <Text truncate>Очень длинный текст, который будет обрезан...</Text>
 * ```
 */
