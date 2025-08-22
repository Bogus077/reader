import { FC, useState } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Input, Select, Button } from "../../ui";
import styles from "./LibraryFilters.module.scss";

export type LibraryFiltersProps = {
  query: string;
  onQueryChange: (v: string) => void;

  categories: string[];
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;

  authors: string[];
  author: string;
  onAuthorChange: (v: string) => void;

  difficulties: number[];
  selectedDifficulty: number | null;
  onDifficultyChange: (v: number | null) => void;
};

export const LibraryFilters: FC<LibraryFiltersProps> = ({
  query,
  onQueryChange,
  categories,
  selectedCategories,
  onToggleCategory,
  authors,
  author,
  onAuthorChange,
  difficulties,
  selectedDifficulty,
  onDifficultyChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const clearFilters = () => {
    if (selectedCategories.length) {
      // снять все выбранные категории
      selectedCategories.forEach((cat) => onToggleCategory(cat));
    }
    if (selectedDifficulty != null) {
      onDifficultyChange(null);
    }
    if (author) {
      onAuthorChange("");
    }
  };
  const hasActiveFilters =
    selectedCategories.length > 0 || selectedDifficulty != null || !!author;
  return (
    <div className={styles.root}>
      <div className={styles.searchRow}>
        <div className={styles.searchWrap}>
          <Input
            placeholder="Название книги"
            value={query}
            onChange={(e) => onQueryChange(e.currentTarget.value)}
            prefix={<Search size={16} />}
            fullWidth
          />
        </div>
        <Button
          variant="ghost"
          size="lg"
          aria-label={expanded ? "Свернуть фильтры" : "Развернуть фильтры"}
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          leftIcon={
            expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />
          }
        />
      </div>

      {expanded && (
        <>
          <div className={styles.actionsRow}>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              fullWidth
            >
              Сбросить фильтры
            </Button>
          </div>

          <div className={styles.group}>
            <span className={styles.groupTitle}>Категории</span>
            <div className={styles.chips}>
              {categories.map((cat) => {
                const active = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`${styles.chip} ${
                      active ? styles.chipActive : ""
                    }`}
                    onClick={() => onToggleCategory(cat)}
                    role="checkbox"
                    aria-checked={active}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.group}>
            <span className={styles.groupTitle}>Сложность</span>
            <div className={styles.dots}>
              {difficulties.map((d) => {
                const active = selectedDifficulty === d;
                return (
                  <button
                    key={d}
                    type="button"
                    className={`${styles.dot} ${
                      active ? styles.dotActive : ""
                    }`}
                    aria-pressed={active}
                    onClick={() => onDifficultyChange(active ? null : d)}
                    title={`Сложность ${d}`}
                  />
                );
              })}
            </div>
          </div>

          <div className={styles.group}>
            <Select
              options={[
                { value: "", label: "Все авторы" },
                ...authors.map((a) => ({ value: a, label: a })),
              ]}
              value={author}
              onChange={(e) => onAuthorChange(e.currentTarget.value)}
              fullWidth
            />
          </div>
        </>
      )}
    </div>
  );
};
