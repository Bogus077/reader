import { useEffect, useState } from 'react';
import { Card, Badge, ProgressBar, Button, Input } from '../../ui';
import { useUnit } from 'effector-react';
import { $mentorStudents, loadMentorStudentsFx } from '../../store/mentor';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function MentorDashboard() {
  const [students] = useUnit([$mentorStudents]);
  const load = useUnit(loadMentorStudentsFx);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(()=> { load(); }, []);
  
  // Фильтрация студентов по имени
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>Дашборд</h2>
        <div style={{ position: 'relative', maxWidth: '100%' }}>
          <Input
            placeholder="Поиск по имени..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              paddingRight: '40px',
              width: '100%',
              maxWidth: '400px',
              height: '40px',
              fontSize: '16px'
            }}
          />
          <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
        </div>
      </div>
      {filteredStudents.length > 0 ? (
        <div className="grid-cards">
          {filteredStudents.map(s => (
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
            <div className="hstack" style={{flexWrap:'wrap', gap:8, marginBottom: '12px'}}>
              <Badge tone={s.todayStatus === 'graded' ? 'success' : s.todayStatus === 'missed' ? 'danger' : 'info'}>
                Сегодня: {s.todayStatus === 'graded' ? 'Оценено' : 
                          s.todayStatus === 'missed' ? 'Просрочено' : 
                          s.todayStatus === 'submitted' ? 'Сдано' : 
                          s.todayStatus === 'pending' ? 'В процессе' : '—'}
              </Badge>
              <Badge tone="info">
                Прогресс: {s.progressPercent ?? 0}%
              </Badge>
              <Badge tone={s.currentStreak > 3 ? 'success' : 'info'}>
                Серия: {s.currentStreak ?? 0}
              </Badge>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Link to={`/mentor/student/${s.id}`}>
                <Button variant="primary" size="sm">Открыть</Button>
              </Link>
            </div>
          </Card>
          ))}
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px', 
          color: '#666',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <Search size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
          <div style={{ fontSize: '18px', fontWeight: 500 }}>
            Ученики не найдены
          </div>
          <div style={{ marginTop: '8px' }}>
            Попробуйте изменить поисковый запрос
          </div>
        </div>
      )}
    </div>
  );
}
