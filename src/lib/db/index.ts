// STUB owned by AI-3. Replace bodies, keep signatures.
import type {
  Answer, CardFilter, Flashcard, LibraryEntry, LibraryFilter, PendingItem, Question,
} from '@/types';

const ni = (): never => { throw new Error('not implemented'); };

export async function saveQuestion(_q: Question): Promise<void> { return ni(); }
export async function saveAnswer(_a: Answer): Promise<void> { return ni(); }
export async function getQuestion(_id: string): Promise<Question | undefined> { return ni(); }
export async function getAnswer(_id: string): Promise<Answer | undefined> { return ni(); }
export async function listLibrary(_filter: LibraryFilter): Promise<LibraryEntry[]> { return ni(); }
export async function search(_text: string): Promise<LibraryEntry[]> { return ni(); }
export async function getCachedAnswer(_hash: string): Promise<Answer | undefined> { return ni(); }
export async function putCachedAnswer(_hash: string, _a: Answer): Promise<void> { return ni(); }
export async function queuePending(_item: PendingItem): Promise<void> { return ni(); }
export async function listPending(): Promise<PendingItem[]> { return ni(); }
export async function removePending(_id: string): Promise<void> { return ni(); }
export async function putCard(_c: Flashcard): Promise<void> { return ni(); }
export async function listCards(_filter: CardFilter): Promise<Flashcard[]> { return ni(); }
export async function listDueCards(_now: number): Promise<Flashcard[]> { return ni(); }
export async function deleteCard(_id: string): Promise<void> { return ni(); }
export async function exportBackup(): Promise<string> { return ni(); }
export async function importBackup(_json: string): Promise<{ added: number; skipped: number }> { return ni(); }
