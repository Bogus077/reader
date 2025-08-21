export type StripStatus = 'done' | 'current' | 'future' | 'missed';
export type Strip = { date: string; status: StripStatus; rating?: number; submittedAt?: string };
