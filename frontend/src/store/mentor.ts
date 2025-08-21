import { createEffect, createStore } from 'effector';
import { getMentorStudents } from '../api/client';

export const loadMentorStudentsFx = createEffect(getMentorStudents);
export const $mentorStudents = createStore<any[]>([]).on(loadMentorStudentsFx.doneData, (_, d) => d.students ?? []);
