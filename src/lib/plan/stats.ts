import { listCards, listLibrary, listNotes } from '@/lib/db';
import type { Subject } from '@/types';
import type { StatsMap, SubjectStat } from './types';

/** Reads per-subject facts the planner needs: due cards, how often cards were forgotten, saved questions, notes. */
export async function loadSubjectStats(now = Date.now()): Promise<StatsMap> {
  const [cards, library, notes] = await Promise.all([listCards(), listLibrary({}), listNotes()]);
  const out: StatsMap = {};
  const get = (s: Subject): SubjectStat => (out[s] ??= { due: 0, lapseRate: 0, reviews: 0, saved: 0, notes: [] });
  const lapses: Partial<Record<Subject, number>> = {};
  for (const c of cards) {
    const st = get(c.subject);
    if (c.due <= now) st.due++;
    st.reviews += c.reps;
    lapses[c.subject] = (lapses[c.subject] ?? 0) + c.lapses;
  }
  for (const [s, st] of Object.entries(out) as Array<[Subject, SubjectStat]>) st.lapseRate = st.reviews ? Math.min(1, (lapses[s] ?? 0) / st.reviews) : 0;
  for (const it of library) get(it.q.subject).saved++;
  for (const n of notes) get(n.subject).notes.push({ id: n.id, title: n.title });
  return out;
}
