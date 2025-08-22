import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Topbar, Button, Input, Textarea, NumberInput, toast } from '../../ui';
import { createMentorBook } from '../../api/client';

export default function MentorAddBook() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !author.trim() || !category.trim() || difficulty === null || difficulty < 1 || difficulty > 5) {
      setError('Пожалуйста, заполните обязательные поля и укажите сложность от 1 до 5');
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        title: title.trim(),
        author: author.trim(),
        category: category.trim(),
        difficulty: difficulty,
        description: description.trim() ? description.trim() : null,
        cover_url: coverUrl.trim() ? coverUrl.trim() : null,
        source_url: sourceUrl.trim() ? sourceUrl.trim() : null,
      };

      const res = await createMentorBook(body);
      if (res.ok) {
        toast.success('Книга создана');
        navigate('/mentor/library');
        return;
      }
      setError('Не удалось создать книгу');
      toast.error('Не удалось создать книгу');
    } catch (err: any) {
      const msg = err?.message || 'Ошибка при создании книги';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Topbar
        title="Новая книга"
        leftSlot={<Link to="/mentor/library"><Button variant="ghost">Назад</Button></Link>}
      />

      <form onSubmit={onSubmit} style={{ padding: 16, display: 'grid', gap: 12, maxWidth: 640, margin: '0 auto' }}>
        <Input label="Название" placeholder="Введите название" required value={title} onChange={(e)=>setTitle(e.target.value)} />
        <Input label="Автор" placeholder="Введите автора" required value={author} onChange={(e)=>setAuthor(e.target.value)} />
        <Input label="Категория" placeholder="Например: Роман, Фантастика" required value={category} onChange={(e)=>setCategory(e.target.value)} />
        <NumberInput label="Сложность (1–5)" placeholder="3" min={1} max={5} required value={difficulty} onChange={setDifficulty} />
        <Textarea label="Описание" placeholder="Краткое описание (необязательно)" value={description} onChange={(e)=>setDescription(e.target.value)} rows={4} />
        <Input label="Ссылка на обложку" placeholder="https://..." value={coverUrl} onChange={(e)=>setCoverUrl(e.target.value)} />
        <Input label="Источник (ссылка)" placeholder="https://..." value={sourceUrl} onChange={(e)=>setSourceUrl(e.target.value)} />

        {error && (
          <div style={{ color: '#b42318' }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Сохранение…' : 'Сохранить'}
          </Button>
          <Link to="/mentor/library">
            <Button type="button" variant="subtle">Отмена</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
