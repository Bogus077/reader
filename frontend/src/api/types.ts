export type AssignmentStatus = 'pending' | 'submitted' | 'missed' | 'graded';

export interface AssignmentTarget {
  percent: number | null;
  page: number | null;
  chapter: string | null;
  last_paragraph: string | null;
}

export interface Assignment {
  id: number;
  date: string;               // YYYY-MM-DD
  deadline_time: string;      // HH:mm
  status: AssignmentStatus;
  target: AssignmentTarget;
  submitted_at?: string | null;
  mentor_rating?: number | null;
  mentor_comment?: string | null;
  // опционально, если есть доп. мета
  title?: string | null;
  description?: string | null;
}

export type Strip = {
  date: string;
  status: 'done' | 'current' | 'future' | 'missed';
  rating?: number;
  submittedAt?: string;
  assignment?: Assignment;
};

export interface StudentProgress {
  currentStreak: number;
  bestStreak: number;
  avgRating: number;
  daysDone: number;
  daysTotal: number;
  bookTitle?: string | null;
}

export type LogAction = 'progress_open' | 'history_open' | 'today_open' | 'library_open';

export interface StudentLog {
  id: number;
  action: LogAction;
  metadata: any;
  createdAt: string; // ISO
}

export type GoalStatus = 'pending' | 'achieved' | 'cancelled';

export interface Goal {
  id: number;
  student_id: number;
  title: string;
  reward_text: string | null;
  status: GoalStatus;
  required_bonuses: number;
  achieved_at: string | null; // ISO or null
  createdAt: string;
  updatedAt: string;
}

// Bonuses
export type StudentBonusHistoryItem = {
  id: number;
  assignment_id?: number | null;
  delta: number;
  source: string;
  reason?: string | null;
  createdAt: string; // ISO
};

export interface StudentBonusResponse {
  ok: boolean;
  balance: number;
  history: StudentBonusHistoryItem[];
}
