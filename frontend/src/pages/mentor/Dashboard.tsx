import { useEffect } from 'react';
import { Card, Badge, ProgressBar } from '../../ui';
import { useUnit } from 'effector-react';
import { $mentorStudents, loadMentorStudentsFx } from '../../store/mentor';

export default function MentorDashboard() {
  const [students] = useUnit([$mentorStudents]);
  const load = useUnit(loadMentorStudentsFx);

  useEffect(()=> { load(); }, []);

  return (
    <div className="container">
      <h2>Дашборд</h2>
      <div className="grid-cards">
        {students.map(s => (
          <Card key={s.id}>
            <div style={{fontWeight:600, marginBottom:6}}>{s.name}</div>
            <div style={{opacity:.7, marginBottom:8}}>{s.activeBook?.title || 'Без книги'}</div>
            <div style={{marginBottom: '10px'}}>
              <ProgressBar 
                value={s.progressPercent ?? 0} 
                label={`Прогресс: ${s.progressPercent ?? 0}%`}
                tone={s.progressPercent > 75 ? 'success' : 'primary'}
              />
            </div>
            <div className="hstack" style={{flexWrap:'wrap', gap:8}}>
              <Badge tone={s.todayStatus === 'done' ? 'success' : s.todayStatus === 'missed' ? 'danger' : 'info'}>
                Сегодня: {s.todayStatus ?? '—'}
              </Badge>
              <Badge tone="info">
                Прогресс: {s.progressPercent ?? 0}%
              </Badge>
              <Badge tone={s.currentStreak > 3 ? 'success' : 'info'}>
                Серия: {s.currentStreak ?? 0}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
