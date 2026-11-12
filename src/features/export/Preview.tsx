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
        h += `<p>${await mdToHtml(q.text)}</p>`;
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
    <div className="mx-auto max-w-[44rem] space-y-4 rounded-lg border border-line bg-white p-5 text-[15px] leading-relaxed text-black shadow-soft">
      {html.map((h, i) => (
        <div key={i} className={`print-item border-b border-black/10 pb-4 last:border-0 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:font-semibold [&_h4]:mt-2 [&_h4]:font-medium [&_.meta]:text-[13px] [&_.meta]:text-black/55 ${i >= 3 ? 'hidden print:block' : ''}`}
          dangerouslySetInnerHTML={{ __html: h }} />
      ))}
      {html.length > 3 && <p data-no-print className="text-center text-[13px] text-black/55">+ {html.length - 3} more in the export</p>}
    </div>
  );
}
