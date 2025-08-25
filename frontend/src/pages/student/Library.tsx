import { FC, useEffect, useMemo, useState } from "react";
import { useUnit } from "effector-react";
import { BookOpen } from "lucide-react";
import { Topbar, Tabbar, BookCard, BackButton } from "../../ui";
import {
  $booksAvailable,
  loadBooksAvailableFx,
  $currentBook,
  loadCurrentBookFx,
  $finishedBookIds,
  loadFinishedBooksFx,
} from "../../store/student";
import styles from "./Library.module.scss";
import { LibraryFilters } from "./LibraryFilters";
import { postLog } from "../../api/client";

export const StudentLibrary: FC = () => {
  const books = useUnit($booksAvailable);
  const current = useUnit($currentBook);
  const finishedIds = useUnit($finishedBookIds);
  const loadBooks = useUnit(loadBooksAvailableFx);
  const loadCurrent = useUnit(loadCurrentBookFx);
  const loadFinished = useUnit(loadFinishedBooksFx);

  useEffect(() => {
    loadBooks();
    loadCurrent();
    loadFinished();
    void postLog("library_open");
  }, [loadBooks, loadCurrent, loadFinished]);

  const [query, setQuery] = useState("");
  const [author, setAuthor] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(
    null
  );

  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(id);
  }, [query]);

  const categories = useMemo(() => {
    const s = new Set<string>();
    books.forEach((b) => {
      if (b.category) s.add(b.category);
    });
    return Array.from(s).sort();
  }, [books]);

  const authors = useMemo(() => {
    const s = new Set<string>();
    books.forEach((b) => {
      if (b.author) s.add(b.author);
    });
    return Array.from(s).sort();
  }, [books]);

  const difficulties = useMemo(() => {
    const s = new Set<number>();
    books.forEach((b) => {
      if (typeof b.difficulty === "number") s.add(b.difficulty);
    });
    return Array.from(s).sort((a, b) => a - b);
  }, [books]);

  const filteredBooks = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return books.filter((b) => {
      if (q && !b.title.toLowerCase().includes(q)) return false;
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(b.category)
      )
        return false;
      if (author && b.author !== author) return false;
      if (selectedDifficulty !== null && b.difficulty !== selectedDifficulty)
        return false;
      return true;
    });
  }, [books, debouncedQuery, selectedCategories, author, selectedDifficulty]);

  const sortedBooks = useMemo(() => {
    const activeId = current.book?.id ?? null;
    const finishedSet = new Set(finishedIds);
    return [...filteredBooks].sort((a, b) => {
      const rank = (id: number) => {
        if (activeId && id === activeId) return 0;
        if (finishedSet.has(id)) return 2;
        return 1;
      };
      const ra = rank(a.id);
      const rb = rank(b.id);
      if (ra !== rb) return ra - rb;
      return a.title.localeCompare(b.title);
    });
  }, [filteredBooks, current.book, finishedIds]);

  return (
    <div>
      <Topbar title="Библиотека" leftSlot={<BackButton />} />
      <div style={{ padding: "16px" }}>
        <LibraryFilters
          query={query}
          onQueryChange={setQuery}
          categories={categories}
          selectedCategories={selectedCategories}
          onToggleCategory={(c) =>
            setSelectedCategories((prev) =>
              prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
            )
          }
          authors={authors}
          author={author}
          onAuthorChange={setAuthor}
          difficulties={difficulties}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
        />
        {books.length > 0 ? (
          sortedBooks.length > 0 ? (
            <div className={styles.grid}>
              {sortedBooks.map((book) => {
                const isActive = current.book?.id === book.id;
                const isFinished = finishedIds.includes(book.id);
                const progress = isActive
                  ? Math.max(0, Math.min(100, current.progress?.percent ?? 0))
                  : isFinished
                  ? 100
                  : undefined;
                const status: "in_progress" | "finished" | undefined = isActive
                  ? "in_progress"
                  : isFinished
                  ? "finished"
                  : undefined;
                return (
                  <BookCard
                    key={book.id}
                    coverUrl={book.cover_url || ""}
                    title={book.title}
                    author={book.author}
                    category={book.category}
                    difficulty={book.difficulty}
                    description={book.description ?? undefined}
                    sourceUrl={book.source_url ?? undefined}
                    progress={progress}
                    status={status}
                    compact
                  />
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <BookOpen size={48} />
              <p>Ничего не найдено</p>
            </div>
          )
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
