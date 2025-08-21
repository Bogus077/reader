import { PropsWithChildren } from 'react';
import './Card.scss';
export default function Card({ children }: PropsWithChildren) {
  return <div className='card'>{children}</div>;
}
