import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import type { LibraryItem } from '@/lib/db';
import { Row } from './Row';

it('renders one page (40 rows) of the library well under 200 ms, so no virtualisation is needed', () => {
  const items: LibraryItem[] = Array.from({ length: 40 }, (_, i) => ({
    q: { id: `q${i}`, text: `Solve $x^2 = ${i}$ and explain`, subject: 'math', tags: ['a', 'b'], starred: i % 2 === 0, createdAt: i },
    a: { id: `a${i}`, questionId: `q${i}`, mode: 'learn', finalAnswer: '$x = \\sqrt{2}$', steps: [], verified: 'unchecked', model: 'm', createdAt: i },
  }));
  const t = performance.now();
  const html = renderToString(h(MemoryRouter, null, h('ul', null, items.map(it => h(Row, { key: it.q.id, item: it, selecting: false, selected: false, onToggle: () => {}, onStar: () => {} })))));
  const ms = Math.round(performance.now() - t);
  console.log(`PERF: 40 library rows render in ${ms} ms`);
  expect(html).toContain('Solve');
  expect(ms).toBeLessThan(200);
});
