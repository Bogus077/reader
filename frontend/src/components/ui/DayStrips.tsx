import { Strip } from '../../shared/types';
import './DayStrips.scss';

export default function DayStrips({ items, onClick }: { items: Strip[]; onClick?: (i:number)=>void }) {
  return (
    <div className='strips'>
      {items.map((s, i) => (
        <button key={s.date} className={`strips__seg strips__seg--${s.status}`} title={`${s.date} ${s.status}`} onClick={()=>onClick?.(i)} />
      ))}
    </div>
  );
}
