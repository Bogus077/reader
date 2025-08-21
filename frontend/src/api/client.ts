import ky from 'ky';

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
    .json<{ ok: boolean; token: string; user?: any }>();
}

export const getMe = () => api.get('me').json<{ ok: boolean; user: any }>();
export const getStudentToday = () => api.get('student/assignment/today').json<{ ok: boolean; assignment: any|null }>();
export const postSubmitAssignment = (id: number) => api.post(`student/assignment/${id}/submit`).json<{ ok: boolean }>();
export const getStudentStrips = () => api.get('student/strips').json<{ ok: boolean; strips: any[] }>();
export const getStudentProgress = () => api.get('student/progress').json<{ ok: boolean; currentStreak:number; bestStreak:number; avgRating:number; daysDone:number; daysTotal:number }>();

export const getMentorStudents = () => api.get('mentor/students').json<{ ok: boolean; students: any[] }>();

// STUDENT
export const getStudentAssignmentByDate = (date:string) =>
  api.get('student/assignment/by-date', { searchParams: { date }})
    .json<{ ok:boolean; assignment: any|null }>();
export const getBooksAvailable = () =>
  api.get('books/available').json<{ ok:boolean; books: any[] }>();

// MENTOR
export const getMentorStudentCard = (id:number) =>
  api.get(`mentor/students/${id}`).json<{ ok:boolean; student:any; activeBook:any; today:any; strips:any[]; recentRatings:any[]; currentStreak:number; bestStreak:number; avgRating:number }>();
export const patchAssignment = (id:number, body:any) =>
  api.patch(`mentor/assignments/${id}`, { json: body }).json<{ ok:boolean }>();
export const gradeAssignment = (id:number, body:{ mentor_rating:number; mentor_comment?:string }) =>
  api.post(`mentor/assignments/${id}/grade`, { json: body }).json<{ ok:boolean }>();
export const generateAssignments = (body:any) =>
  api.post('mentor/assignments/generate', { json: body }).json<{ ok:boolean; created:number; skippedExisting:number }>();
export const assignStudentBook = (body:any) =>
  api.post('mentor/student-books/assign', { json: body }).json<{ ok:boolean; student_book_id:number }>();
