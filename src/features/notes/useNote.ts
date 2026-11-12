import { useCallback, useEffect, useState } from 'react';
import { getNote, saveNote } from '@/lib/db';
import type { Note } from '@/types';

export function useNote(id?: string) {
  const [note, setNote] = useState<Note | null | undefined>(undefined); // undefined = loading, null = missing
  useEffect(() => {
    let live = true;
    if (!id) { setNote(null); return; }
    getNote(id).then((n) => { if (live) setNote(n ?? null); }).catch(() => { if (live) setNote(null); });
    return () => { live = false; };
  }, [id]);
  const update = useCallback(async (patch: Partial<Note>) => {
    setNote((cur) => {
      if (!cur) return cur;
      const next = { ...cur, ...patch, updatedAt: Date.now() };
      void saveNote(next);
      return next;
    });
  }, []);
  return { note, update };
}
