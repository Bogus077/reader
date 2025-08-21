import { FC, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUnit } from 'effector-react';
import { format, parseISO, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Topbar, Tabbar, Card, Badge, Button, RatingStars } from '../../ui';
import { $strips, $assignmentByDate, loadStripsFx, loadAssignmentByDateFx } from '../../store/student';
import styles from './DayHistory.module.scss';

// Функция для форматирования даты в формате "1 января"
const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'd MMMM', { locale: ru });
  } catch (e) {
    return dateString;
  }
};

// Функция для форматирования даты и времени
const formatDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'd MMMM, HH:mm', { locale: ru });
  } catch (e) {
    return dateString;
  }
};

// Функция для определения статуса дня
const getStatusBadge = (status: string, dateString?: string) => {
  switch (status) {
    case 'submitted':
    case 'graded':
      return <Badge tone="success">Выполнено</Badge>;
    case 'missed':
      return <Badge tone="danger">Пропущено</Badge>;
    case 'pending':
      const today = new Date().toISOString().split('T')[0];
      const isToday = dateString ? today === dateString : false;
      return isToday ? 
        <Badge tone="warning">Сегодня</Badge> : 
        <Badge tone="info">Предстоит</Badge>;
    default:
      return <Badge tone="default">Неизвестно</Badge>;
  }
};

// Функция для получения иконки статуса
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'submitted':
    case 'graded':
      return <CheckCircle size={18} color="#4caf50" />;
    case 'missed':
      return <XCircle size={18} color="#f44336" />;
    default:
      return <Clock size={18} color="#2196f3" />;
  }
};

export const DayHistory: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const date = searchParams.get('date');
  
  const [strips, assignmentByDate] = useUnit([$strips, $assignmentByDate]);
  const [loadStrips, loadAssignmentByDate] = useUnit([loadStripsFx, loadAssignmentByDateFx]);
  
  // Редирект на главную, если дата не указана или некорректна
  useEffect(() => {
    if (!date || !isValid(parseISO(date))) {
      navigate('/');
      return;
    }
    
    // Загружаем данные
    loadAssignmentByDate(date);
    loadStrips();
  }, [date, navigate, loadAssignmentByDate, loadStrips]);
  
  // Находим текущий сегмент в strips
  const currentStrip = useMemo(() => {
    return strips.find(strip => strip.date === date);
  }, [strips, date]);
  
  // Находим индексы предыдущего и следующего дней
  const { prevDate, nextDate } = useMemo(() => {
    if (!strips.length) return { prevDate: null, nextDate: null };
    
    const currentIndex = strips.findIndex(strip => strip.date === date);
    if (currentIndex === -1) return { prevDate: null, nextDate: null };
    
    const prevDate = currentIndex > 0 ? strips[currentIndex - 1].date : null;
    const nextDate = currentIndex < strips.length - 1 ? strips[currentIndex + 1].date : null;
    
    return { prevDate, nextDate };
  }, [strips, date]);
  
  // Если дата не указана, редирект уже выполнен
  if (!date) return null;
  
  return (
    <div>
      <Topbar title="История чтения" />
      <div className={styles.container}>
        {/* Верхняя часть с датой и статусом */}
        <div className={styles.header}>
          <div className={styles.date}>{formatDate(date)}</div>
          {currentStrip && getStatusBadge(currentStrip.status, date)}
        </div>
        
        {/* Карточка с заданием на день */}
        <Card className={styles.card}>
          <div className={styles.cardTitle}>Задание на день</div>
          
          {assignmentByDate ? (
            <>
              <div className={styles.infoRow}>
                <div className={styles.label}>Цель:</div>
                <div className={styles.value}>
                  {assignmentByDate.target_type === 'percent' && `${assignmentByDate.target_value}%`}
                  {assignmentByDate.target_type === 'page' && `стр. ${assignmentByDate.target_value}`}
                  {assignmentByDate.target_type === 'chapter' && `глава ${assignmentByDate.target_value}`}
                </div>
              </div>
              
              {assignmentByDate.description && (
                <div className={styles.infoRow}>
                  <div className={styles.label}>Описание:</div>
                  <div className={styles.value}>{assignmentByDate.description}</div>
                </div>
              )}
              
              {assignmentByDate.last_paragraph && (
                <div className={styles.infoRow}>
                  <div className={styles.label}>Последний абзац:</div>
                  <div className={styles.value}>"{assignmentByDate.last_paragraph}"</div>
                </div>
              )}
              
              {assignmentByDate.deadline && (
                <div className={styles.infoRow}>
                  <div className={styles.label}>Дедлайн:</div>
                  <div className={styles.value}>{formatDateTime(assignmentByDate.deadline)}</div>
                </div>
              )}
            </>
          ) : currentStrip ? (
            <div>
              <div className={styles.infoRow}>
                <div className={styles.label}>Статус:</div>
                <div className={styles.value} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getStatusIcon(currentStrip.status)}
                  {currentStrip.status === 'submitted' && 'Отмечено как прочитано'}
                  {currentStrip.status === 'graded' && 'Проверено ментором'}
                  {currentStrip.status === 'missed' && 'Пропущено'}
                  {currentStrip.status === 'pending' && 'Ожидает выполнения'}
                </div>
              </div>
            </div>
          ) : (
            <div>Информация о задании не найдена</div>
          )}
        </Card>
        
        {/* Дополнительная информация */}
        {(assignmentByDate?.submitted_at || currentStrip?.rating) && (
          <Card className={styles.card}>
            <div className={styles.cardTitle}>Дополнительная информация</div>
            
            {assignmentByDate?.submitted_at && (
              <div className={styles.infoRow}>
                <div className={styles.label}>Время сдачи:</div>
                <div className={styles.value}>{formatDateTime(assignmentByDate.submitted_at)}</div>
              </div>
            )}
            
            {currentStrip?.rating !== undefined && (
              <div className={styles.infoRow}>
                <div className={styles.label}>Оценка ментора:</div>
                <div className={styles.value}>
                  <RatingStars value={currentStrip.rating} readOnly size="sm" />
                </div>
              </div>
            )}
            
            {assignmentByDate?.mentor_comment && (
              <div className={styles.infoRow}>
                <div className={styles.label}>Комментарий:</div>
                <div className={styles.value}>{assignmentByDate.mentor_comment}</div>
              </div>
            )}
          </Card>
        )}
        
        {/* Навигация по дням */}
        <div className={styles.navigation}>
          <Button 
            variant="ghost" 
            disabled={!prevDate}
            onClick={() => prevDate && navigate(`/history?date=${prevDate}`)}
            className={`${styles.navButton} ${!prevDate ? styles.disabled : ''}`}
          >
            <ArrowLeft size={16} /> Пред.
          </Button>
          
          <Button 
            variant="ghost" 
            disabled={!nextDate}
            onClick={() => nextDate && navigate(`/history?date=${nextDate}`)}
            className={`${styles.navButton} ${!nextDate ? styles.disabled : ''}`}
          >
            След. <ArrowRight size={16} />
          </Button>
        </div>
      </div>
      <Tabbar />
    </div>
  );
};

export default DayHistory;
