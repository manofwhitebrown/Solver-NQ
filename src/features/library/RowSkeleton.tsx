import { Skeleton } from '@/components/ui';

/** Placeholder rows shown while the library loads (same height as real rows, so nothing jumps). */
export function RowSkeletons({ count = 5 }: { count?: number }) {
  return (
    <ul className="flex flex-col gap-3" aria-busy="true" aria-label="Loading your library">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="elev-1 flex gap-4 rounded-xl p-4">
          <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2.5"><Skeleton className="h-4 w-4/5" /><Skeleton className="h-3.5 w-3/5" /><Skeleton className="h-5 w-24 rounded-full" /></div>
        </li>
      ))}
    </ul>
  );
}
