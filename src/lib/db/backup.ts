import { db } from './db';
import { resetIndex } from './search';
import { BACKUP_VERSION, parseBackup, type BackupFile, type BackupImage } from './validate';

async function blobToBase64(b: Blob): Promise<string> {
  const bytes = new Uint8Array(await b.arrayBuffer());
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

function base64ToBlob(data: string, type: string): Blob {
  const bin = atob(data);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}

export async function exportBackup(): Promise<string> {
  const [questions, answers, flashcards, imgRows] = await Promise.all([
    db.questions.toArray(), db.answers.toArray(), db.flashcards.toArray(), db.images.toArray(),
  ]);
  const images: BackupImage[] = [];
  for (const r of imgRows) images.push({ id: r.id, type: r.blob.type, data: await blobToBase64(r.blob) });
  const file: BackupFile = { app: 'solver-nq', version: BACKUP_VERSION, exportedAt: Date.now(), questions, answers, flashcards, images };
  return JSON.stringify(file);
}

export interface ImportResult { added: number; skipped: number; error?: string }

/** Merge a backup into the database: existing ids are kept, never overwritten. All-or-nothing. */
export async function importBackup(json: string): Promise<ImportResult> {
  const parsed = parseBackup(json);
  if (!parsed.ok) return { added: 0, skipped: 0, error: parsed.error };
  const f = parsed.file;
  let added = 0;
  let skipped = parsed.dropped;
  try {
    await db.transaction('rw', [db.questions, db.answers, db.flashcards, db.images], async () => {
      const addNew = async <T extends { id: string }>(table: { bulkGet(k: string[]): Promise<(T | undefined)[]>; bulkAdd(v: T[]): Promise<unknown> }, rows: T[]) => {
        const have = await table.bulkGet(rows.map(r => r.id));
        const fresh = rows.filter((_, i) => !have[i]);
        await table.bulkAdd(fresh);
        added += fresh.length;
        skipped += rows.length - fresh.length;
      };
      await addNew(db.questions, f.questions);
      // An answer needs its question, either just imported or already stored.
      const qIds = new Set((await db.questions.toCollection().primaryKeys()) as string[]);
      const answers = f.answers.filter(a => qIds.has(a.questionId));
      skipped += f.answers.length - answers.length;
      await addNew(db.answers, answers);
      await addNew(db.flashcards, f.flashcards);
      await addNew(db.images, f.images.map(i => ({ id: i.id, blob: base64ToBlob(i.data, i.type), createdAt: Date.now() })));
    });
  } catch (e) {
    return { added: 0, skipped: 0, error: `Import failed and nothing was changed: ${(e as Error).message}` };
  }
  resetIndex();
  return { added, skipped };
}
