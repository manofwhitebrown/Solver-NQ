import { useEffect, useState } from 'react';
import 'katex/dist/katex.min.css';
import '@/lib/export/print.css';
import { Spinner } from '@/components/ui';
import type { ResolvedOptions } from '@/lib/export';
import { mdToHtml } from '@/lib/export/html';
import type { ExportItem } from '@/lib/export/markdown';

/** Rendered preview. Only the first 3 show on screen; all print with window.print(). */
export default function Preview({ items, opts }: { items: ExportItem[]; opts: ResolvedOptions }) {
  const [html, setHtml] = useState<string[] | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      const out: string[] = [];
      for (const { q, a } of items) {
        let h = `<h2>${await mdToHtml(q.text.split('\n')[0])}</h2>`;
        if (opts.includeDate) h += `<div class="meta">${q.subject} · ${new Date(q.createdAt).toLocaleDateString()}</div>`;
        const rest = q.text.split('\n').slice(1).join('\n').trim(); // line 1 is already the heading
        if (rest) h += `<p>${await mdToHtml(rest)}</p>`;
        if (a) {
          h += `<h3>Final answer</h3><p>${await mdToHtml(a.finalAnswer)}</p>`;
          if (opts.stepsMode === 'full') {
            for (const [i, s] of a.steps.entries()) h += `<h4>Step ${i + 1}: ${await mdToHtml(s.title)}</h4><p>${await mdToHtml(s.body)}</p>`;
          }
        }
        out.push(h);
      }
      if (live) setHtml(out);
    })();
    return () => { live = false; };
  }, [items, opts.includeDate, opts.stepsMode]);

  if (!html) return <div className="flex justify-center py-10"><Spinner /></div>;
  return (
    <div className="w-full min-w-0 space-y-4">
      {/* One sheet of paper per answer: always white with dark ink, whatever the app theme; shrinks with the screen. */}
      {html.map((h, i) => (
        <article key={i} aria-label={`Answer ${i + 1} of ${html.length}`}
          className={`print-item w-full min-w-0 overflow-hidden rounded-lg border border-line bg-white text-base leading-relaxed text-black elev-2 print:rounded-none print:border-0 print:shadow-none ${i >= 3 ? 'hidden print:block' : ''}`}>
          <div data-no-print className="flex items-center justify-between border-b border-black/10 px-4 py-2 text-caption font-semibold text-black/60 sm:px-6">
            <span>Page {i + 1}</span><span>{items[i]?.q.subject}</span>
          </div>
          <div className="min-w-0 overflow-x-auto break-words p-4 sm:p-6 lg:p-8 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-4 [&_h3]:font-semibold [&_h4]:mt-3 [&_h4]:font-semibold [&_img]:max-w-full [&_.meta]:text-sm [&_.meta]:text-black/60"
            dangerouslySetInnerHTML={{ __html: h }} />
        </article>
      ))}
      {html.length > 3 && <p data-no-print className="text-center text-sm text-muted">+ {html.length - 3} more in the export</p>}
    </div>
  );
}
