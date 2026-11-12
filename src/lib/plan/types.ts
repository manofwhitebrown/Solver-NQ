import type { Subject } from '@/types';

export interface Exam { id: string; subject: Subject; name: string; date: string } // date = YYYY-MM-DD
export interface PlanSettings {
  exams: Exam[];
  minutesPerDay: number;
  offWeekdays: number[]; // 0 = Sunday ... 6 = Saturday
  weakSubjects: Subject[];
}
export interface PlanState extends PlanSettings { done: string[] } // ids of ticked tasks

export type TaskKind = 'review' | 'quiz' | 'saved' | 'note' | 'rest';
export interface Task {
  id: string; day: string; kind: TaskKind; subject?: Subject;
  minutes: number; title: string; to: string; // to = in-app deep link
}
export interface PlanDay { day: string; tasks: Task[]; minutes: number; off: boolean; restDay: boolean; exams: Exam[] }

export interface SubjectStat {
  due: number;            // flashcards due now
  lapseRate: number;      // 0..1, share of reviews that were forgotten
  reviews: number;
  saved: number;          // saved questions in the library
  notes: Array<{ id: string; title: string }>;
}
export type StatsMap = Partial<Record<Subject, SubjectStat>>;

export const DEFAULT_STATE: PlanState = { exams: [], minutesPerDay: 60, offWeekdays: [], weakSubjects: [], done: [] };
