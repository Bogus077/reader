import { FC, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUnit } from 'effector-react';
import { format, parseISO, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Topbar, Tabbar, Card, Badge, Button, RatingStars, Skeleton } from '../../ui';
import clsx from 'clsx';
import { $strips, $assignmentByDate, loadStripsFx, loadAssignmentByDateFx } from '../../store/student';
import { resolveVisualStatus, mapAssignmentToDayStripStatus, mapStatusToColor } from "../../lib/visualStatus";
import { Assignment } from "../../api/types";
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

// Текст статуса для инлайн-отображения
const getStatusText = (assignment: Assignment, tz = '+03:00') => {
  const visualStatus = resolveVisualStatus(assignment, tz);
  switch (visualStatus) {
    case 'submitted':
      return 'Отмечено';
    case 'graded':
      return 'Проверено';
    case 'missed':
      return 'Пропущено';
    default:
      return 'Ожидает';
  }
};

// CSS-класс цвета статуса
const getStatusClass = (assignment: Assignment, tz = '+03:00') => {
  const color = mapStatusToColor(resolveVisualStatus(assignment, tz));
  switch (color) {
    case 'green':
      return styles.statusSuccess;
    case 'blue':
      return styles.statusInfo;
    case 'red':
      return styles.statusDanger;
    default:
      return styles.statusMuted;
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

// Функция для определения статуса дня с использованием resolveVisualStatus и mapStatusToColor
const getStatusBadge = (assignment: Assignment, tz = '+03:00') => {
  const visualStatus = resolveVisualStatus(assignment, tz);
  const color = mapStatusToColor(visualStatus);
  
  switch (visualStatus) {
    case 'submitted':
      return <Badge color={color}>Отмечено</Badge>;
    case 'graded':
      return <Badge color={color}>Проверено</Badge>;
    case 'missed':
      return <Badge color={color}>Пропущено</Badge>;
    default:
      return <Badge color={color}>Ожидает</Badge>;
  }
};

// Функция для получения иконки статуса (цвет наследуется от CSS currentColor)
const getStatusIcon = (assignment: Assignment, tz = '+03:00') => {
  const visualStatus = resolveVisualStatus(assignment, tz);
  switch (visualStatus) {
    case 'submitted':
    case 'graded':
      return <CheckCircle size={16} />;
    case 'missed':
      return <XCircle size={16} />;
    default:
      return <Clock size={16} />;
  }
};

export const DayHistory: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const date = searchParams.get('date');
  
  const [strips, assignmentByDate] = useUnit([$strips, $assignmentByDate]);
  const [loadStrips, loadAssignmentByDate] = useUnit([loadStripsFx, loadAssignmentByDateFx]);
  const isStripsLoading = useUnit(loadStripsFx.pending);
  const isAssignmentLoading = useUnit(loadAssignmentByDateFx.pending);
  
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
  
  // Преобразуем данные для компонента DayStrips
  const stripsData = useMemo(() => {
    return strips.map((strip) => {
      // Если есть задание, определяем его визуальный статус
      const visualStatus = strip.assignment ? resolveVisualStatus(strip.assignment, '+03:00') : 'pending';
      // Преобразуем визуальный статус в статус для DayStrips
      const stripStatus = mapAssignmentToDayStripStatus(visualStatus);
      
      // Преобразуем mentor_rating в number | undefined для соответствия типу DayStripItem
      const rating = strip.assignment?.mentor_rating !== null ? strip.assignment?.mentor_rating : undefined;
      
      return {
        date: strip.date,
        status: stripStatus,
        rating
      };
    });
  }, [strips]);
  
  // Находим текущий сегмент в strips и соответствующее задание
  const currentStrip = useMemo(() => {
    // Находим сегмент в исходных данных
    return strips.find((strip) => strip.date === date);
  }, [strips, date]);
  
  // Находим индексы предыдущего и следующего дней
  const { prevDate, nextDate } = useMemo(() => {
    if (!stripsData.length) return { prevDate: null, nextDate: null };
    
    const currentIndex = stripsData.findIndex(strip => strip.date === date);
    if (currentIndex === -1) return { prevDate: null, nextDate: null };
    
    const prevDate = currentIndex > 0 ? stripsData[currentIndex - 1].date : null;
    const nextDate = currentIndex < stripsData.length - 1 ? stripsData[currentIndex + 1].date : null;
    
    return { prevDate, nextDate };
  }, [stripsData, date]);
  
  // Если дата не указана, редирект уже выполнен
  if (!date) return null;
  
  return (
    <div>
      <Topbar title="История чтения" />
      <div className={styles.container}>
        {/* Верхняя часть с датой и статусом */}
        {isStripsLoading ? (
          <div className={styles.header}>
            <div className={styles.date}>
              <Skeleton variant="text" height={20} width={120} />
            </div>
            <div>
              <Skeleton variant="rect" height={20} width={80} />
            </div>
          </div>
        ) : (
          <div className={styles.header}>
            <div className={styles.dateRow}>
              <div className={styles.date}>{formatDate(date)}</div>
              {(() => {
                const a = (assignmentByDate || currentStrip?.assignment) as Assignment | undefined;
                return (
                  <div className={clsx(
                    styles.statusInline,
                    a ? getStatusClass(a) : styles.statusMuted
                  )}>
                    {a ? getStatusIcon(a) : <Clock size={16} />}
                    <span>{a ? getStatusText(a) : 'Ожидает'}</span>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
        
        {/* Карточка с заданием на день */}
        <Card className={styles.card}>
          <div className={styles.cardTitle}>Задание на день</div>
          
          {isAssignmentLoading ? (
            <div>
              <Skeleton variant="text" height={16} width="60%" />
              <div style={{ height: 8 }} />
              <Skeleton variant="text" height={14} width="40%" />
            </div>
          ) : assignmentByDate ? (
            <>
              <div className={styles.infoRow}>
                <div className={styles.label}>Цель:</div>
                <div className={styles.value}>
                  {assignmentByDate?.target?.percent && `${assignmentByDate.target.percent}%`}
                  {assignmentByDate?.target?.page && `стр. ${assignmentByDate.target.page}`}
                  {assignmentByDate?.target?.chapter && `глава ${assignmentByDate.target.chapter}`}
                </div>
              </div>
              
              {assignmentByDate.description && (
                <div className={styles.infoRow}>
                  <div className={styles.label}>Описание:</div>
                  <div className={styles.value}>{assignmentByDate.description}</div>
                </div>
              )}
              
              {assignmentByDate?.target?.last_paragraph && (
                <div className={styles.infoRow}>
                  <div className={styles.label}>Последний абзац:</div>
                  <div className={styles.value}>"{assignmentByDate.target.last_paragraph}"</div>
                </div>
              )}
              
              {/* Поддержка двух вариантов дедлайна */}
              {(() => {
                // Формируем ISO строку из даты и времени дедлайна
                const deadlineIso = assignmentByDate?.date && assignmentByDate?.deadline_time 
                  ? `${assignmentByDate.date}T${assignmentByDate.deadline_time}:00` 
                  : null;
                
                return deadlineIso ? (
                  <div className={styles.infoRow}>
                    <div className={styles.label}>Дедлайн:</div>
                    <div className={styles.value}>{formatDateTime(deadlineIso)}</div>
                  </div>
                ) : null;
              })()}
            </>
          ) : currentStrip ? (
            <div>
              <div className={styles.infoRow}>
                <div className={styles.label}>Статус:</div>
                <div className={styles.value} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {currentStrip?.assignment && getStatusIcon(currentStrip.assignment)}
                  {(() => {
                    if (!currentStrip?.assignment) return 'Нет задания';
                    
                    const visualStatus = resolveVisualStatus(currentStrip.assignment, '+03:00');
                    switch (visualStatus) {
                      case 'submitted': return 'Отмечено как прочитано';
                      case 'graded': return 'Проверено ментором';
                      case 'missed': return 'Пропущено';
                      default: return 'Ожидает выполнения';
                    }
                  })()}
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
