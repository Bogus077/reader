import { FC, useEffect } from 'react';
import { useUnit } from 'effector-react';
import { BookOpen, Plus } from 'lucide-react';
import { Topbar, Tabbar, Button, BookCard } from '../../ui';
import { $booksAvailable, loadBooksAvailableFx } from '../../store/student';
import { Link } from 'react-router-dom';
import styles from '../student/Library.module.scss';

const MentorLibrary: FC = () => {
  const books = useUnit($booksAvailable);
  const loadBooks = useUnit(loadBooksAvailableFx);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  return (
    <div>
      <Topbar
        title="Библиотека"
        rightSlot={
          <Link to="/mentor/books/add">
            <Button variant="primary">
              <Plus size={16} style={{ marginRight: 6 }} /> Добавить
            </Button>
          </Link>
        }
      />

      <div style={{ padding: '16px' }}>
        {books.length > 0 ? (
          <div className={styles.grid}>
            {books.map((book) => (
              <BookCard
                key={book.id}
                coverUrl={book.cover_url || ''}
                title={book.title}
                author={book.author}
                category={book.category}
                difficulty={book.difficulty}
                description={book.description ?? undefined}
                sourceUrl={book.source_url ?? undefined}
                compact
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

      <Tabbar type="mentor" />
    </div>
  );
};

export default MentorLibrary;
