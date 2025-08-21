import { FC, useEffect } from 'react';
import { useUnit } from 'effector-react';
import { BookOpen } from 'lucide-react';
import { Topbar, Tabbar, Button, BookCard } from '../../ui';
import { $booksAvailable, loadBooksAvailableFx } from '../../store/student';
import styles from './Library.module.scss';

export const StudentLibrary: FC = () => {
  const books = useUnit($booksAvailable);
  const loadBooks = useUnit(loadBooksAvailableFx);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  return (
    <div>
      <Topbar title="Библиотека" />
      <div style={{ padding: '16px' }}>
        {books.length > 0 ? (
          <div className={styles.grid}>
            {books.map((book) => (
              <BookCard
                key={book.id}
                coverUrl={book.cover_url}
                title={book.title}
                author={book.author}
                category={book.category}
                difficulty={book.difficulty}
                actionButton={
                  <Button variant="primary" disabled>
                    Подробнее
                  </Button>
                }
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <BookOpen size={48} />
            <p>Книг пока нет</p>
          </div>
        )}
      </div>
      <Tabbar />
    </div>
  );
};

export default StudentLibrary;
