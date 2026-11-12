import type { Flashcard, Subject } from '@/types';
import { listCards, putCard } from '@/lib/db';
import { saveFile } from '@/lib/export';
import { cardsFromImport, exportCards, importCards } from '@/lib/srs';

export async function exportDeck(cards: Flashcard[], sep: '\t' | ','): Promise<void> {
  const blob = new Blob([exportCards(cards, sep)], { type: 'text/plain;charset=utf-8' });
  await saveFile(blob, sep === '\t' ? 'solver-nq-cards.tsv' : 'solver-nq-cards.csv');
}

/** Reads a CSV/TSV file, saves new non-duplicate cards, returns counts. */
export async function importDeck(file: File, defaultSubject: Subject): Promise<{ added: number; skipped: number }> {
  const rows = importCards(await file.text());
  const fresh = cardsFromImport(rows, await listCards({}), defaultSubject);
  for (const c of fresh) await putCard(c);
  return { added: fresh.length, skipped: rows.length - fresh.length };
}
