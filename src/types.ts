export type Subject = 'math' | 'physics' | 'chemistry' | 'biology' | 'coding'
  | 'languages' | 'history' | 'commerce' | 'other';
export type Mode = 'learn' | 'answer';

export interface Step { id: string; title: string; body: string } // body = markdown, math as $...$ / $$...$$
export interface Question {
  id: string; text: string; subject: Subject; tags: string[];
  imageBlobId?: string; starred: boolean; createdAt: number;
}
export interface Answer {
  id: string; questionId: string; mode: Mode; finalAnswer: string; steps: Step[];
  summary?: string; verified: 'match' | 'mismatch' | 'unchecked';
  model: string; createdAt: number;
}
export interface Flashcard {
  id: string; front: string; back: string; subject: Subject; sourceAnswerId?: string;
  due: number; interval: number; ease: number; reps: number; lapses: number;
}

// --- Additions: the contracts in the task file reference these but never define them.
// Owners may extend them (tell the manager); kept deliberately loose.
export interface QuizItem {
  id: string; questionId: string; prompt: string;
  options?: string[]; // multiple choice when present
  answer: string; explanation?: string;
}
export interface ExportOptions {
  includeSteps?: boolean; includeImages?: boolean; title?: string;
  paper?: 'a4' | 'letter';
}
export interface PendingItem {
  id: string; text: string; subject: Subject; mode: Mode;
  imageDataUrl?: string; createdAt: number;
}
export interface LibraryFilter { subject?: Subject; tag?: string; starred?: boolean }
export interface LibraryEntry { q: Question; a?: Answer }
export interface CardFilter { subject?: Subject; sourceAnswerId?: string }

// Phase 2 (added by AI-3, tell AI-1): study notes.
export interface Note {
  id: string; title: string; source: 'paste' | 'file' | 'pdf' | 'image'; text: string;
  summary?: string; cheatsheet?: string; keyTerms?: string[];
  subject: Subject; tags: string[]; createdAt: number; updatedAt: number;
}
export interface NoteFilter { subject?: Subject; tag?: string }
