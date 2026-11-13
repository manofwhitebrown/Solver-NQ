import { describe, expect, it } from 'vitest';
import type { LibraryItem } from '@/lib/db';
import { groupByDay, libraryStats } from './grouping';

const NOW = new Date(2026, 10, 13, 15, 0).getTime(); const DAY = 86_400_000;
const mk = (id: string, createdAt: number, starred = false) => ({ q: { id, createdAt, starred }, a: undefined }) as unknown as LibraryItem;

describe('library grouping', () => {
  it('groups newest-first items into Today, Yesterday, This week and months', () => {
    const g = groupByDay([mk('a', NOW - 1000), mk('b', NOW - 2000), mk('c', NOW - DAY), mk('d', NOW - 3 * DAY), mk('e', NOW - 60 * DAY)], NOW);
    expect(g.map(x => x.label).slice(0, 3)).toEqual(['Today', 'Yesterday', 'This week']);
    expect(g[0].items).toHaveLength(2);
    expect(g).toHaveLength(4);
  });
  it('handles an empty list', () => { expect(groupByDay([], NOW)).toEqual([]); });
  it('counts totals, starred and this week', () => {
    const s = libraryStats([mk('a', NOW, true), mk('b', NOW - 2 * DAY), mk('c', NOW - 30 * DAY, true)], NOW);
    expect(s).toEqual({ total: 3, starred: 2, thisWeek: 2 });
  });
});
