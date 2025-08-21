import { createEffect, createStore } from 'effector';
import { getStudentToday, postSubmitAssignment, getStudentStrips, getStudentProgress } from '../api/client';

export const loadTodayFx = createEffect(getStudentToday);
export const submitFx = createEffect(async (id: number) => postSubmitAssignment(id));
export const loadStripsFx = createEffect(getStudentStrips);
export const loadProgressFx = createEffect(getStudentProgress);

export const $today = createStore<any|null>(null).on(loadTodayFx.doneData, (_, d) => d.assignment ?? null);
export const $strips = createStore<any[]>([]).on(loadStripsFx.doneData, (_, d) => d.strips ?? []);
export const $progress = createStore<{currentStreak:number;bestStreak:number;avgRating:number;daysDone:number;daysTotal:number} | null>(null)
  .on(loadProgressFx.doneData, (_, d) => (d.ok ? { currentStreak: d.currentStreak, bestStreak: d.bestStreak, avgRating: d.avgRating, daysDone: d.daysDone, daysTotal: d.daysTotal } : null));
