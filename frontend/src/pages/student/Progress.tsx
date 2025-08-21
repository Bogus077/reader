import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnit } from 'effector-react';
import { Topbar, Tabbar, Card, ProgressCircle, RatingStars } from '../../ui';
import styles from './Progress.module.scss';
import { $strips, $progress, loadStripsFx, loadProgressFx } from '../../store/student';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export const StudentProgress: FC = () => {
  const [strips, progress] = useUnit([$strips, $progress]);
  const loadStrips = useUnit(loadStripsFx);
  const loadProgress = useUnit(loadProgressFx);
  const navigate = useNavigate();

  useEffect(() => {
    loadStrips();
    loadProgress();
  }, []);

  // Расчет процента выполнения
  const progressPercent = progress ? Math.round((progress.daysDone / progress.daysTotal) * 100) : 0;

  // Обработчик клика по дню
  const handleDayClick = (date: string) => {
    navigate(`/history?date=${date}`);
  };

  // Получение иконки статуса
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
      case 'submitted':
      case 'graded':
        return <CheckCircle size={18} className="text-success" />;
      case 'missed':
        return <XCircle size={18} className="text-danger" />;
      default:
        return <Clock size={18} className="text-muted" />;
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div>
      <Topbar title="Прогресс" />
      <div className="container" style={{ padding: '16px' }}>
        {/* Верхняя секция с прогрессом и метриками */}
        <div className="hstack" style={{ gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ProgressCircle 
              value={progressPercent} 
              size={120} 
              strokeWidth={10} 
              tone="primary" 
            />
          </div>
          
          <Card style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Текущая серия</div>
                <div>{progress?.currentStreak || 0} дней</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Лучшая серия</div>
                <div>{progress?.bestStreak || 0} дней</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Средняя оценка</div>
                <div>{progress?.avgRating?.toFixed(1) || '—'}</div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Список дней */}
        <Card>
          <div style={{ fontWeight: 600, marginBottom: '16px' }}>История чтения</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {strips.map((strip, index) => (
              <div 
                key={`${strip.date}-${index}`}
                className={styles.dayItem}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => handleDayClick(strip.date)}
              >
                <div style={{ minWidth: '80px' }}>{formatDate(strip.date)}</div>
                <div>{getStatusIcon(strip.status)}</div>
                {strip.rating !== undefined && (
                  <div>
                    <RatingStars value={strip.rating} readOnly size="sm" />
                  </div>
                )}
                {strip.target && (
                  <div style={{ marginLeft: 'auto', color: '#666' }}>
                    {strip.target.percent ? `${strip.target.percent}%` : 
                     strip.target.page ? `стр. ${strip.target.page}` : 
                     strip.target.chapter || '—'}
                  </div>
                )}
              </div>
            ))}
            {strips.length === 0 && (
              <div style={{ textAlign: 'center', padding: '16px', color: '#666' }}>
                История пока пуста
              </div>
            )}
          </div>
        </Card>
      </div>
      <Tabbar />
    </div>
  );
};

export default StudentProgress;
