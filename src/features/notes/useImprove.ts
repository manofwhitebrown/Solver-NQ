import { useRef, useState } from 'react';
import { toast } from '@/components/ui';
import { aiAvailable, capText, linesOf, transform, type SummaryLength } from '@/lib/notes';
import type { Note } from '@/types';

/** "Improve with AI": fills summary, cheat sheet and key terms; any failure keeps the offline results. */
export function useImprove(note: Note | null | undefined, update: (p: Partial<Note>) => Promise<void>) {
  const [busy, setBusy] = useState(false);
  const [questions, setQuestions] = useState<string>();
  const abort = useRef<AbortController | undefined>(undefined);

  async function improve(length: SummaryLength) {
    if (!note) return;
    if (!(await aiAvailable())) { toast('AI is not available right now. Your quick offline summary still works.', 'info'); return; }
    abort.current?.abort(); abort.current = new AbortController();
    const { signal } = abort.current;
    const text = capText(note.text).text;
    setBusy(true);
    try {
      const [summary, cheatsheet, terms] = await Promise.all([
        transform('summary', text, { length }, signal), transform('cheatsheet', text, {}, signal), transform('keyterms', text, {}, signal)]);
      const keyTerms = linesOf(terms);
      await update({ summary, cheatsheet, ...(keyTerms.length ? { keyTerms } : {}) });
      toast('Improved with AI', 'success');
    } catch { toast('Could not reach the AI. Your quick offline summary is still here.', 'error'); }
    finally { setBusy(false); }
  }

  async function aiQuestions() {
    if (!note) return;
    setBusy(true);
    try { setQuestions(await transform('qa-from-text', capText(note.text).text, {}, abort.current?.signal)); }
    catch { toast('Could not make questions with AI. Showing offline ones.', 'error'); }
    finally { setBusy(false); }
  }
  return { improve, aiQuestions, busy, questions };
}
