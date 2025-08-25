import { createEffect, createStore } from 'effector';
import { 
  getMentorStudents, 
  getMentorStudentCard, 
  getMentorStudentBonus,
  getMentorStudentActiveGoal,
} from '../api/client';
import type { Goal, StudentBonusHistoryItem } from '../api/types';

export const loadMentorStudentsFx = createEffect(getMentorStudents);
export const $mentorStudents = createStore<any[]>([]).on(loadMentorStudentsFx.doneData, (_, d) => d.students ?? []);

// Эффект для загрузки карточки студента
export const loadMentorStudentCardFx = createEffect(getMentorStudentCard);

// Сторы для данных студента
export const $studentData = createStore<any>(null).on(loadMentorStudentCardFx.doneData, (_, d) => d.student ?? null);
export const $studentActiveBook = createStore<any>(null).on(loadMentorStudentCardFx.doneData, (_, d) => d.activeBook ?? null);
export const $studentToday = createStore<any>(null).on(loadMentorStudentCardFx.doneData, (_, d) => d.today ?? null);
export const $studentStrips = createStore<any[]>([]).on(loadMentorStudentCardFx.doneData, (_, d) => d.strips ?? []);
export const $studentRecentRatings = createStore<any[]>([]).on(loadMentorStudentCardFx.doneData, (_, d) => d.recentRatings ?? []);
export const $studentStats = createStore<{currentStreak: number; bestStreak?: number; avgRating?: number}>({currentStreak: 0})
  .on(loadMentorStudentCardFx.doneData, (_, d) => ({
    currentStreak: d.currentStreak ?? 0,
    bestStreak: d.bestStreak ?? 0,
    avgRating: d.avgRating ?? 0
  }));

// Mentor: бонусы студента (баланс и история)
export const loadMentorStudentBonusFx = createEffect((params: { studentId: number; limit?: number }) =>
  getMentorStudentBonus(params.studentId, params.limit ? { limit: params.limit } : undefined)
);
export const $studentBonusBalance = createStore<number>(0)
  .on(loadMentorStudentBonusFx.doneData, (_, d) => d?.balance ?? 0);
export const $studentBonusHistory = createStore<StudentBonusHistoryItem[]>([])
  .on(loadMentorStudentBonusFx.doneData, (_, d) => d?.history ?? []);

// Mentor: активная цель студента
export const loadMentorStudentActiveGoalFx = createEffect((studentId: number) => getMentorStudentActiveGoal(studentId));
export const $studentActiveGoal = createStore<Goal | null>(null)
  .on(loadMentorStudentActiveGoalFx.doneData, (_, d) => d?.goal ?? null);
