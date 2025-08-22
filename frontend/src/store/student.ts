import { createEffect, createStore } from 'effector';
import { getStudentToday, submitAssignment, getStudentStrips, getStudentProgress, getBooksAvailable, getStudentAssignmentByDate, getStudentCurrentBook, getStudentFinishedBooks } from '../api/client';
import { Assignment, Strip, StudentProgress } from '../api/types';

export const loadTodayFx = createEffect(getStudentToday);
export const submitFx = createEffect(async (id: number) => submitAssignment(id));
export const loadStripsFx = createEffect(getStudentStrips);
export const loadProgressFx = createEffect(getStudentProgress);
export const loadBooksAvailableFx = createEffect(getBooksAvailable);
export const loadAssignmentByDateFx = createEffect(async (date: string) => getStudentAssignmentByDate(date));
export const loadCurrentBookFx = createEffect(getStudentCurrentBook);
export const loadFinishedBooksFx = createEffect(getStudentFinishedBooks);

export const $today = createStore<Assignment|null>(null).on(loadTodayFx.doneData, (_, d) => d.assignment ?? null);
export const $strips = createStore<Strip[]>([]).on(loadStripsFx.doneData, (_, d) => d.strips ?? []);
export const $progress = createStore<StudentProgress | null>(null)
  .on(loadProgressFx.doneData, (_, d) => (
    d.ok
      ? {
          currentStreak: d.currentStreak,
          bestStreak: d.bestStreak,
          avgRating: d.avgRating,
          daysDone: d.daysDone,
          daysTotal: d.daysTotal,
          bookTitle: (d as any).bookTitle ?? null,
        }
      : null
  ));

interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  difficulty: number;
  cover_url?: string;
  source_url?: string;
}

export const $booksAvailable = createStore<Book[]>([])
  .on(loadBooksAvailableFx.doneData, (_, d) => d.books ?? []);
export const $assignmentByDate = createStore<Assignment|null>(null)
  .on(loadAssignmentByDateFx.doneData, (_, d) => d.assignment ?? null);

export type CurrentBookState = {
  book: { id:number; title:string; author:string; cover_url?:string } | null;
  progress: { percent:number; daysDone:number; daysTotal:number } | null;
};

export const $currentBook = createStore<CurrentBookState>({ book: null, progress: null })
  .on(loadCurrentBookFx.doneData, (_, d) => ({ book: d.book, progress: d.progress }));

export const $finishedBookIds = createStore<number[]>([])
  .on(loadFinishedBooksFx.doneData, (_, d) => d.bookIds ?? []);
