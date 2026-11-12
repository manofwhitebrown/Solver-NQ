import { useCallback, useEffect, useState } from 'react';
import type { Flashcard } from '@/types';
import { listCards } from '@/lib/db';
import { loadProgress, saveProgress, type Progress } from '@/lib/srs';

/** Loads all cards + local progress; `reload` re-reads after changes. */
export function useLearnData() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try { setCards(await listCards({})); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void reload(); }, [reload]);

  const updateProgress = useCallback((p: Progress) => { setProgress(p); saveProgress(p); }, []);
  return { cards, progress, loading, reload, updateProgress };
}
