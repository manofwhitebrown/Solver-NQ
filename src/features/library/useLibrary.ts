import { useCallback, useEffect, useRef, useState } from 'react';
import { deleteQuestions, listLibrary, listTags, restoreDeleted, search, updateQuestions, type DeletedSnapshot, type LibraryItem } from '@/lib/db';
import type { Subject } from '@/types';

export interface Filters { subject?: Subject; tag?: string; starred?: boolean }

export function useLibrary() {
  const [filters, setFilters] = useState<Filters>({});
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<LibraryItem[] | null>(null);
  const [tags, setTags] = useState<Array<{ tag: string; count: number }>>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [undo, setUndo] = useState<DeletedSnapshot | null>(null);
  const seq = useRef(0);

  const reload = useCallback(async () => {
    const mine = ++seq.current;
    const text = query.trim();
    let list = text ? await search(text) : await listLibrary(filters);
    if (text) {
      list = list.filter(({ q }) => (!filters.subject || q.subject === filters.subject)
        && (!filters.tag || q.tags.includes(filters.tag)) && (!filters.starred || q.starred));
    }
    const t = await listTags();
    if (mine === seq.current) { setItems(list); setTags(t); } // ignore stale results
  }, [filters, query]);

  useEffect(() => {
    const id = setTimeout(() => { void reload(); }, query ? 120 : 0);
    return () => clearTimeout(id);
  }, [reload, query]);

  const toggle = (id: string) => setSelected(s => {
    const n = new Set(s);
    if (!n.delete(id)) n.add(id);
    return n;
  });
  const clearSelection = () => setSelected(new Set());
  const ids = () => [...selected];

  const patch = async (fn: Parameters<typeof updateQuestions>[1]) => {
    await updateQuestions(ids(), fn); clearSelection(); await reload();
  };
  const star = (on: boolean) => patch(q => { q.starred = on; });
  const addTag = (tag: string) => patch(q => { if (!q.tags.includes(tag)) q.tags = [...q.tags, tag]; });
  const toggleStar = async (id: string, on: boolean) => { await updateQuestions([id], q => { q.starred = on; }); await reload(); };

  const remove = async () => {
    const snap = await deleteQuestions(ids());
    clearSelection(); setUndo(snap); await reload();
  };
  const dismissUndo = useCallback(() => setUndo(null), []);
  const doUndo = async () => { if (undo) { await restoreDeleted(undo); setUndo(null); await reload(); } };

  return { filters, setFilters, query, setQuery, items, tags, selected, toggle, clearSelection, star, addTag, toggleStar,
    remove, undo, dismissUndo, doUndo, reload };
}
