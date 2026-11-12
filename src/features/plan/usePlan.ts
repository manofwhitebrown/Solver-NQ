import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { kvGet, kvSet } from '@/lib/db';
import {
  buildPlan, createPlanStore, dayKey, DEFAULT_STATE, loadSubjectStats, pruneDone,
  type PlanDay, type PlanState, type StatsMap,
} from '@/lib/plan';

const store = createPlanStore({ get: (k) => kvGet(k), set: (k, v) => kvSet(k, v) });

/** Loads the planner state + subject stats and keeps the computed plan in sync with edits and the date. */
export function usePlan() {
  const [state, setState] = useState<PlanState | null>(null);
  const [stats, setStats] = useState<StatsMap>({});
  const [today, setToday] = useState(() => dayKey());
  const ref = useRef<PlanState>(DEFAULT_STATE);

  useEffect(() => {
    let live = true;
    store.load().then((s) => { if (live) { ref.current = s; setState(s); } });
    loadSubjectStats().then((x) => live && setStats(x)).catch(() => {});
    const onShow = () => document.visibilityState === 'visible' && setToday(dayKey());
    document.addEventListener('visibilitychange', onShow);
    return () => { live = false; document.removeEventListener('visibilitychange', onShow); };
  }, []);

  const update = useCallback((patch: Partial<PlanState>) => {
    const next = { ...ref.current, ...patch };
    ref.current = next;
    setState(next);
    void store.save(next);
  }, []);

  const toggle = useCallback((id: string) => {
    const done = ref.current.done.includes(id) ? ref.current.done.filter((x) => x !== id) : [...ref.current.done, id];
    update({ done: pruneDone(done, dayKey()) });
  }, [update]);

  const plan: PlanDay[] = useMemo(() => (state ? buildPlan(state, stats, today) : []), [state, stats, today]);
  return { state, plan, today, update, toggle, loading: state === null };
}
