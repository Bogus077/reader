import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import './Button.scss';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary'|'ghost',
  size?: 'md'|'lg',
};
export default function Button({ variant='primary', size='md', className, ...rest }: Props) {
  return <button className={clsx('btn', `btn--${variant}`, `btn--${size}`, className)} {...rest} />;
}
