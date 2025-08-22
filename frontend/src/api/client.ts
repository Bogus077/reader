import ky from 'ky';
import { Assignment, Strip, StudentProgress } from './types';

export const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  hooks: {
    beforeRequest: [
      (req) => {
        const t = localStorage.getItem('jwt');
        if (t) req.headers.set('Authorization', `Bearer ${t}`);
      },
    ],
  },
});

export async function authWithTelegram(initData: string) {
  return api.post('auth/telegram', { headers: { 'X-Telegram-Init-Data': initData } })
    .json<{ ok: boolean; token: string; user?: { id: number; name: string; role: string } }>();
}

export const getMe = () => api.get('me').json<{ ok: boolean; user: { id: number; name: string; role: string; timezone?: string } }>();
export const getStudentToday = () =>
  api.get('student/assignment/today')
    .json<{ ok: true; assignment: Assignment | null }>();

export const submitAssignment = (id: number) =>
  api.post(`student/assignment/${id}/submit`).json<{ ok: true }>();

export const getStudentStrips = () =>
  api.get('student/strips')
    .json<{ ok: true; strips: Strip[] }>();

export const getStudentProgress = () =>
  api.get('student/progress')
    .json<{ ok: true } & StudentProgress>();

export const getMentorStudents = () =>
  api.get('mentor/students').json<{ ok: true; students: Array<{
    id: number; name: string;
    activeBook: { id:number; title:string; cover_url?:string } | null;
    progressPercent: number;
    todayStatus: 'pending'|'submitted'|'missed'|'graded'|null;
    lastRating: number | null;
    currentStreak: number;
  }> }>();

// STUDENT
export const getStudentAssignmentByDate = (date: string) =>
  api.get('student/assignment/by-date', { searchParams: { date } })
    .json<{ ok: true; assignment: Assignment | null }>();

export const getBooksAvailable = () =>
  api.get('books/available').json<{ ok: true; books: Array<{ 
    id:number; 
    title:string; 
    author:string; 
    category:string; 
    difficulty:number; 
    description?: string | null;
    cover_url?:string; 
    source_url?:string 
  }> }>();

// STUDENT LIBRARY HELPERS
export const getStudentCurrentBook = () =>
  api.get('student/current-book').json<{
    ok: boolean;
    book: { id:number; title:string; author:string; cover_url?:string } | null;
    progress: { percent: number; daysDone: number; daysTotal: number } | null;
    currentStreak: number;
    bestStreak: number;
  }>();

export const getStudentFinishedBooks = () =>
  api.get('student/finished-books').json<{ ok: boolean; bookIds: number[] }>();

// MENTOR
export const getMentorStudentCard = (id: number) =>
  api.get(`mentor/students/${id}`).json<{ 
    ok: true; 
    student: { id: number; name: string; timezone: string }; 
    activeBook: { id: number; title: string; author: string; cover_url?: string; student_book_id?: number; mode?: 'percent'|'page' } | null; 
    today: { assignment: Assignment | null }; 
    strips: Strip[]; 
    recentRatings: Array<{ date: string; rating: number; comment?: string }>; 
    currentStreak: number; 
    bestStreak: number; 
    avgRating: number 
  }>();

export const patchAssignment = (id: number, body: Partial<{
  deadline_time: string;
  target_percent: number | null;
  target_page: number | null;
  target_chapter: string | null;
  target_last_paragraph: string | null;
}>) => api.patch(`mentor/assignments/${id}`, { json: body }).json<{ ok: true }>();

export const gradeAssignment = (id: number, body: { mentor_rating: number; mentor_comment?: string }) =>
  api.post(`mentor/assignments/${id}/grade`, { json: body }).json<{ ok: true }>();

export const generateAssignments = (body: { 
  student_book_id:number; 
  mode:'percent'|'page'; 
  dailyTarget:number; 
  deadline_time:string; 
  startDate:string; 
  endDate:string 
}) =>
  api.post('mentor/assignments/generate', { json: body }).json<{ ok: true; created: number; skippedExisting: number }>();

export const createAssignment = (body: {
  student_book_id: number;
  date: string; // YYYY-MM-DD
  deadline_time: string; // HH:mm
  target_percent?: number | null;
  target_page?: number | null;
  target_chapter?: string | null;
  target_last_paragraph?: string | null;
}) =>
  api.post('mentor/assignments', { json: body }).json<{ ok: true; assignment: any }>();

export const assignStudentBook = (body: { 
  student_id:number; 
  book_id:number; 
  progress_mode:'percent'|'page'; 
  start_date:string 
}) =>
  api.post('mentor/student-books/assign', { json: body }).json<{ ok: true; student_book_id: number }>();

export const createMentorBook = (body: {
  title: string;
  author: string;
  category: string;
  difficulty: number; // 1..5
  description?: string | null;
  cover_url?: string | null;
  source_url?: string | null;
}) =>
  api.post('mentor/books', { json: body }).json<{ ok: true; book: {
    id:number; title:string; author:string; category:string; difficulty:number; description?:string|null; cover_url?:string|null; source_url?:string|null; created_by?: number|null;
  } }>();
