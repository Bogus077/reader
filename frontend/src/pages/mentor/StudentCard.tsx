import { FC, useEffect, useState } from 'react';
import { Topbar } from '../../ui/primitives/Topbar';
import { Tabbar } from '../../ui';
import { useParams } from 'react-router-dom';
import { useUnit } from 'effector-react';
import { 
  $studentData, 
  $studentActiveBook, 
  $studentToday, 
  $studentStrips, 
  $studentRecentRatings, 
  $studentStats, 
  loadMentorStudentCardFx 
} from '../../store/mentor';
import { Card, Badge, Button, DayStrips, RatingStars, Toast, Loader } from '../../ui';
import { GradeModal } from '../../ui/composite/GradeModal/GradeModal';
import { AssignmentEditModal, AssignmentData } from '../../ui/composite/AssignmentEditModal/AssignmentEditModal';
import { AssignBookModal, AssignBookData } from '../../ui/composite/AssignBookModal';
import { GeneratePlanModal, GeneratePlanData } from '../../ui/composite/GeneratePlanModal';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CheckCircle, XCircle, Clock, Calendar, BookOpen, CalendarRange, BookPlus, CalendarPlus } from 'lucide-react';
import styles from './StudentCard.module.scss';
import { gradeAssignment, patchAssignment, assignStudentBook, generateAssignments, getBooksAvailable, createAssignment } from '../../api/client';
import { Assignment, Strip } from '../../api/types';

export const MentorStudentCard: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [
    studentData,
    activeBook,
    todayAssignment,
    strips,
    recentRatings,
    stats
  ] = useUnit([
    $studentData,
    $studentActiveBook,
    $studentToday,
    $studentStrips,
    $studentRecentRatings,
    $studentStats
  ]);
  const load = useUnit(loadMentorStudentCardFx);
  const isPageLoading = useUnit(loadMentorStudentCardFx.pending);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  
  // Состояния для модальных окон
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignBookModalOpen, setIsAssignBookModalOpen] = useState(false);
  const [isGeneratePlanModalOpen, setIsGeneratePlanModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [availableBooks, setAvailableBooks] = useState<Array<{ id: number; title: string; author: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Загрузка данных студента при монтировании
  useEffect(() => {
    if (id) {
      load(Number(id));
    }
  }, [id, load]);
  
  // Закрытие тоста через 3 секунды
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);
  
  // Загрузка доступных книг при открытии модального окна назначения книги
  const loadAvailableBooks = async () => {
    try {
      setIsLoading(true);
      const response = await getBooksAvailable();
      if (response.ok && response.books) {
        setAvailableBooks(response.books);
      }
    } catch (error) {
      console.error('Error loading available books:', error);
      setToastMessage('Ошибка при загрузке списка книг');
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик создания задания
  const handleCreateSubmit = async (data: AssignmentData) => {
    if (!id || !activeBook) return;
    try {
      setIsLoading(true);
      // Определяем дату для задания
      const targetDate = selectedDay || todayAssignment?.date || new Date().toISOString().slice(0, 10);
      const createMode: 'percent'|'page' = (activeBook.mode === 'percent' || activeBook.mode === 'page') ? activeBook.mode : 'page';
      const payload = {
        student_book_id: activeBook.student_book_id,
        date: targetDate,
        deadline_time: data.time,
        // В зависимости от режима передаём нужную цель
        target_page: (createMode === 'page') ? (data.pages ?? null) : null,
        target_percent: (createMode === 'percent') ? (data.percent ?? null) : null,
        target_chapter: data.chapter ? String(data.chapter) : null,
        target_last_paragraph: data.lastParagraph ?? null,
      };
      const res = await createAssignment(payload);
      if (res.ok) {
        setToastMessage('Задание создано');
        setIsCreateModalOpen(false);
        await load(Number(id));
      }
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      setToastMessage('Не удалось создать задание');
    } finally {
      setIsLoading(false);
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      return format(date, 'd MMMM yyyy', { locale: ru });
    } catch (e) {
      return dateString;
    }
  };

  // Получение статуса задания
  const getAssignmentStatus = (status: string) => {
    switch (status) {
      case 'submitted':
        return { icon: <CheckCircle size={18} color="#4caf50" />, text: 'Выполнено', tone: 'success' as const };
      case 'graded':
        return { icon: <CheckCircle size={18} color="#4caf50" />, text: 'Оценено', tone: 'success' as const };
      case 'missed':
        return { icon: <XCircle size={18} color="#f44336" />, text: 'Пропущено', tone: 'danger' as const };
      case 'pending':
        return { icon: <Clock size={18} color="#2196f3" />, text: 'Ожидается', tone: 'info' as const };
      default:
        return { icon: <Clock size={18} color="#9e9e9e" />, text: 'Неизвестно', tone: 'default' as const };
    }
  };

  // Проверка, можно ли редактировать задание
  const canEditAssignment = (assignment: Assignment | null) => {
    if (!assignment) return false;
    // Проверяем, что статус задания только pending или submitted
    const deadline = `${assignment.date}T${assignment.deadline_time}`;
    return ['pending', 'submitted'].includes(assignment.status) && new Date(deadline) > new Date();
  };

  // Проверка, можно ли оценить задание
  const canGradeAssignment = (assignment: Assignment | null) => {
    if (!assignment) return false;
    return assignment.status === 'submitted' && !assignment.mentor_rating;
  };
  
  // Получение задания для выбранного дня или сегодняшнего дня
  const getAssignmentForSelectedDay = (): Assignment | null => {
    if (selectedDay) {
      const assignment = strips.find((strip: Strip) => strip.date === selectedDay)?.assignment;
      return assignment || null;
    }
    return todayAssignment;
  };
  
  // Обработчик открытия модального окна оценки
  const handleOpenGradeModal = () => {
    const assignment = getAssignmentForSelectedDay();
    if (assignment) {
      setSelectedAssignment(assignment);
      setIsGradeModalOpen(true);
    }
  };
  
  // Обработчик открытия модального окна редактирования
  const handleOpenEditModal = () => {
    const assignment = getAssignmentForSelectedDay();
    if (assignment) {
      setSelectedAssignment(assignment);
      setIsEditModalOpen(true);
    }
  };
  
  // Обработчик открытия модального окна назначения книги
  const handleAssignBookClick = () => {
    loadAvailableBooks();
    setIsAssignBookModalOpen(true);
  };
  
  // Обработчик открытия модального окна генерации плана
  const handleGeneratePlanClick = () => {
    if (activeBook) {
      setIsGeneratePlanModalOpen(true);
    }
  };
  
  // Обработчик открытия модального окна создания задания
  const handleOpenCreateModal = () => {
    if (activeBook) {
      setIsCreateModalOpen(true);
    }
  };
  
  // Обработчик назначения книги
  const handleAssignBook = async (data: AssignBookData) => {
    if (id) {
      try {
        setIsLoading(true);
        const payload = {
          student_id: Number(id),
          book_id: data.bookId,
          progress_mode: data.mode, // исправлено с mode на progress_mode
          daily_target: data.dailyTarget,
          deadline_time: data.deadlineTime,
          start_date: data.startDate
        };
        
        const response = await assignStudentBook(payload);
        if (response.ok) {
          setToastMessage('Книга успешно назначена');
          setIsAssignBookModalOpen(false);
          load(Number(id)); // Перезагрузка данных
        }
      } catch (error) {
        setToastMessage('Ошибка при назначении книги');
        console.error('Error assigning book:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Обработчик генерации плана
  const handleGeneratePlan = async (data: GeneratePlanData) => {
    if (id && activeBook) {
      try {
        setIsLoading(true);
        const payload = {
          student_book_id: data.studentBookId,
          mode: data.mode,
          dailyTarget: data.dailyTarget, // исправлено с daily_target на dailyTarget
          deadline_time: data.deadlineTime,
          startDate: data.startDate, // исправлено с start_date на startDate
          endDate: data.endDate // исправлено с end_date на endDate
        };
        
        const response = await generateAssignments(payload);
        if (response.ok) {
          setToastMessage(`План успешно сгенерирован: создано ${response.created} заданий, пропущено ${response.skippedExisting} существующих`);
          setIsGeneratePlanModalOpen(false);
          load(Number(id)); // Перезагрузка данных
        }
      } catch (error) {
        setToastMessage('Ошибка при генерации плана');
        console.error('Error generating plan:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Обработчик сохранения оценки
  const handleGradeSubmit = async (data: { rating: number; comment: string }) => {
    if (selectedAssignment && id) {
      try {
        setIsLoading(true);
        // Отправляем оценку на сервер
        const response = await gradeAssignment(selectedAssignment.id, {
          mentor_rating: data.rating,
          mentor_comment: data.comment
        });
        
        if (response.ok) {
          // Закрываем модальное окно
          setIsGradeModalOpen(false);
          
          // Показываем уведомление об успехе
          setToastMessage('Оценка успешно сохранена');
          
          // Обновляем данные карточки без перезагрузки страницы
          await load(Number(id));
          
          // Обновляем выбранное задание, если оно ещё выбрано
          if (selectedDay) {
            // Обновляем выбранное задание из обновленных данных
            const updatedAssignment = strips.find((strip: Strip) => strip.date === selectedDay)?.assignment;
            if (updatedAssignment) {
              setSelectedAssignment(updatedAssignment);
            }
          }
        } else {
          setToastMessage('Ошибка при сохранении оценки');
        }
      } catch (error) {
        setToastMessage('Ошибка при сохранении оценки');
        console.error('Error grading assignment:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Обработчик сохранения отредактированного задания
  const handleEditSubmit = async (data: AssignmentData) => {
    if (selectedAssignment && id) {
      // Проверяем, что статус задания позволяет редактирование
      if (!['pending', 'submitted'].includes(selectedAssignment.status)) {
        setToastMessage('Нельзя редактировать задание с текущим статусом');
        return;
      }
      
      try {
        const isPercent = (selectedAssignment.target?.percent ?? null) !== null;
        const payload = {
          deadline_time: data.time,                 // 'HH:mm'
          target_page: isPercent ? null : (data.pages ?? null),
          target_percent: isPercent ? (data.percent ?? null) : null,
          target_chapter: data.chapter ? String(data.chapter) : null, // преобразуем в string, т.к. API ожидает string
          target_last_paragraph: data.lastParagraph ?? null,
        };
        
        await patchAssignment(selectedAssignment.id, payload);
        setToastMessage('Задание успешно обновлено');
        load(Number(id)); // Перезагрузка данных
      } catch (error) {
        setToastMessage('Ошибка при обновлении задания');
        console.error('Error updating assignment:', error);
      }
    }
  };

  return (
    <div>
      <Topbar title={studentData ? `${studentData.name}` : 'Карточка ученика'} />
      {(isPageLoading || isLoading) && (
        <Loader fullscreen message="Загрузка данных…" />
      )}
      <div className={styles.container}>
        {studentData ? (
          <div className={styles.grid}>
            {/* Левая колонка */}
            <div>
              {/* Активная книга */}
              {activeBook && (
                <div className={styles.bookCard}>
                  <img 
                    src={activeBook.cover_url || 'https://via.placeholder.com/80x120?text=No+Cover'} 
                    alt={activeBook.title} 
                    className={styles.bookCover} 
                  />
                  <div className={styles.bookInfo}>
                    <div className={styles.bookTitle}>{activeBook.title}</div>
                    <div className={styles.bookAuthor}>{activeBook.author}</div>
                    <Badge tone="info">Активная книга</Badge>
                  </div>
                </div>
              )}

              {/* Полоски дней */}
              <div className={styles.card}>
                <h3 className={styles.sectionTitle}>Прогресс чтения</h3>
                <DayStrips 
                  items={strips.map((strip: Strip) => ({
                    date: strip.date,
                    status: strip.status,
                    rating: strip.rating !== null ? strip.rating : undefined
                  }))}
                  onSelect={(idx) => setSelectedDay(strips[idx]?.date || null)}
                  className={styles.dayStrips}
                />
              </div>

              {/* Задание на сегодня */}
              <Card className={styles.card}>
                <h3 className={styles.sectionTitle}>Задание на сегодня</h3>
                {todayAssignment ? (
                  <>
                    <div className={styles.infoRow}>
                      <div className={styles.label}>Цель:</div>
                      <div className={styles.value}>
                        {todayAssignment.target_percent ? `${todayAssignment.target_percent}%` : ''}
                        {todayAssignment.target_pages ? `${todayAssignment.target_pages} стр.` : ''}
                        {todayAssignment.target_chapter ? `Глава ${todayAssignment.target_chapter}` : ''}
                      </div>
                    </div>
                    <div className={styles.infoRow}>
                      <div className={styles.label}>Дедлайн:</div>
                      <div className={styles.value}>
                        <Calendar size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        {formatDate(todayAssignment.deadline)}
                      </div>
                    </div>
                    <div className={styles.infoRow}>
                      <div className={styles.label}>Статус:</div>
                      <div className={styles.value}>
                        <Badge tone={getAssignmentStatus(todayAssignment.status).tone}>
                          {getAssignmentStatus(todayAssignment.status).text}
                        </Badge>
                      </div>
                    </div>
                    {todayAssignment.description && (
                      <div className={styles.infoRow}>
                        <div className={styles.label}>Описание:</div>
                        <div className={styles.value}>{todayAssignment.description}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <div>Нет активного задания на сегодня</div>
                )}
              </Card>
            </div>

            {/* Правая колонка */}
            <div>
              {/* Быстрые действия */}
              <div className={styles.card}>
                <h3 className={styles.sectionTitle}>Быстрые действия</h3>
                <div className={styles.actions}>
                  <Button 
                    variant="success" 
                    disabled={!getAssignmentForSelectedDay() || !canGradeAssignment(getAssignmentForSelectedDay())}
                    title={!canGradeAssignment(getAssignmentForSelectedDay()) ? 'Задание не готово к оценке' : ''}
                    onClick={handleOpenGradeModal}
                  >
                    Оценить
                  </Button>
                  <Button 
                    variant="secondary" 
                    disabled={!getAssignmentForSelectedDay() || !canEditAssignment(getAssignmentForSelectedDay())}
                    title={!canEditAssignment(getAssignmentForSelectedDay()) ? 'Задание нельзя редактировать' : ''}
                    onClick={handleOpenEditModal}
                  >
                    Редактировать задание
                  </Button>
                </div>
              </div>
              
              {/* Управление книгами и планом */}
              <div className={styles.card}>
                <h3 className={styles.sectionTitle}>Управление обучением</h3>
                <div className={styles.actions}>
                  <Button
                    variant="primary"
                    onClick={handleAssignBookClick}
                  >
                    <BookPlus size={16} style={{ marginRight: '8px' }} />
                    Назначить книгу
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleGeneratePlanClick}
                    disabled={!activeBook}
                    title={!activeBook ? "Сначала назначьте книгу" : ""}
                  >
                    <CalendarPlus size={16} style={{ marginRight: '8px' }} />
                    Сгенерировать план
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleOpenCreateModal}
                    disabled={!activeBook}
                    title={!activeBook ? "Сначала назначьте книгу" : ""}
                  >
                    <Calendar size={16} style={{ marginRight: '8px' }} />
                    Добавить задание
                  </Button>
                </div>
              </div>

              {/* Статистика */}
              <div className={styles.card}>
                <h3 className={styles.sectionTitle}>Статистика</h3>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statValue}>{stats.currentStreak}</div>
                    <div className={styles.statLabel}>Текущая серия</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statValue}>{stats.bestStreak || 0}</div>
                    <div className={styles.statLabel}>Лучшая серия</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statValue}>{stats.avgRating ? stats.avgRating.toFixed(1) : '0.0'}</div>
                    <div className={styles.statLabel}>Средняя оценка</div>
                  </div>
                </div>
              </div>

              {/* Последние оценки */}
              <Card className={styles.card}>
                <h3 className={styles.sectionTitle}>Последние оценки</h3>
                {recentRatings && recentRatings.length > 0 ? (
                  recentRatings.map((rating, index) => (
                    <div key={index} className={styles.ratingItem}>
                      <div className={styles.ratingDate}>{formatDate(rating.date)}</div>
                      <RatingStars value={rating.rating} readOnly />
                      {rating.comment && (
                        <div className={styles.ratingComment}>"{rating.comment}"</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div>Нет оценок</div>
                )}
              </Card>
            </div>
          </div>
        ) : (
          <div>Загрузка данных...</div>
        )}
      </div>
      
      {/* Модальное окно оценки */}
      {selectedAssignment && (
        <GradeModal
          isOpen={isGradeModalOpen}
          onClose={() => setIsGradeModalOpen(false)}
          date={selectedAssignment.date}
          targetSummary={`${selectedAssignment.title || 'Задание'} - ${selectedAssignment.target?.page ? `${selectedAssignment.target.page} стр.` : ''}`}
          onSubmit={handleGradeSubmit}
          initialRating={selectedAssignment.mentor_rating || 0}
          initialComment={selectedAssignment.mentor_comment || ''}
        />
      )}
      
      {/* Модальное окно редактирования */}
      {selectedAssignment && (
        <AssignmentEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={{
            title: selectedAssignment.title || '',
            pages: selectedAssignment.target?.page || 0,
            percent: selectedAssignment.target?.percent ?? null,
            time: selectedAssignment.deadline_time || '12:00',
            description: selectedAssignment.description || '',
            chapter: selectedAssignment.target?.chapter ? Number(selectedAssignment.target.chapter) : null,
            lastParagraph: selectedAssignment.target?.last_paragraph || ''
          }}
          onSubmit={handleEditSubmit}
          // Режим редактирования определяем из самого задания
          mode={(selectedAssignment.target?.percent ?? null) !== null ? 'percent' : 'page'}
          isGraded={selectedAssignment.status === 'graded'}
          isDeadlinePassed={new Date(`${selectedAssignment.date}T${selectedAssignment.deadline_time}`) < new Date()}
          disabled={!['pending', 'submitted'].includes(selectedAssignment.status)}
          disabledReason={!['pending', 'submitted'].includes(selectedAssignment.status) ? 
            'Нельзя редактировать задание со статусом "Оценено" или "Пропущено"' : ''}
        />
      )}

      {/* Модальное окно создания задания */}
      {activeBook && (
        <AssignmentEditModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          initialData={{
            title: '',
            pages: 0,
            time: '20:00',
            description: '',
            chapter: null,
            lastParagraph: ''
          }}
          onSubmit={handleCreateSubmit}
          // Передаём режим из активной книги, чтобы ввод переключался между страницами и процентами
          mode={activeBook.mode || 'page'}
          isGraded={false}
          isDeadlinePassed={false}
          disabled={false}
        />
      )}
      
      {/* Модальное окно назначения книги */}
      <AssignBookModal
        isOpen={isAssignBookModalOpen}
        onClose={() => setIsAssignBookModalOpen(false)}
        availableBooks={availableBooks}
        onSubmit={handleAssignBook}
        studentId={Number(id)}
        isLoading={isLoading}
      />
      
      {/* Модальное окно генерации плана */}
      {activeBook && (
        <GeneratePlanModal
          isOpen={isGeneratePlanModalOpen}
          onClose={() => setIsGeneratePlanModalOpen(false)}
          onSubmit={handleGeneratePlan}
          studentBookId={activeBook.student_book_id}
          currentMode={activeBook.mode || 'page'}
          currentDailyTarget={activeBook.daily_target || 10}
          isLoading={isLoading}
        />
      )}
      
      {/* Тост для уведомлений */}
      {toastMessage && (
        <Toast id={`toast-${Date.now()}`} message={toastMessage} type="success" onClose={() => setToastMessage(null)} />
      )}
      <Tabbar type="mentor" />
    </div>
  );
};

export default MentorStudentCard;
