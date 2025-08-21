import { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Field.module.scss';
import { HelperText } from '../HelperText';

export type FieldProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  id?: string;
};

export function Field({
  children,
  error,
  hint,
  fullWidth = false,
  id,
  className,
  ...rest
}: FieldProps) {
  const helperId = id ? `${id}-helper` : undefined;
  
  return (
    <div 
      className={clsx(
        styles.field,
        fullWidth && styles.fullWidth,
        className
      )}
      {...rest}
    >
      {children}
      
      {(error || hint) && (
        <HelperText 
          id={helperId}
          error={!!error}
        >
          {error || hint}
        </HelperText>
      )}
    </div>
  );
}
