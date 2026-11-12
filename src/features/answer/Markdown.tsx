import { memo, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // bundled by Vite, fonts included: works offline
import { CodeBlock } from './CodeBlock';

/** Markdown with $inline$ and $$block$$ LaTeX. Unknown LaTeX renders as red text instead of crashing. */
export const Markdown = memo(function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-answer break-words text-[16px] leading-relaxed [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-accent [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-line [&_blockquote]:pl-3 [&_blockquote]:text-muted [&_table]:block [&_table]:overflow-x-auto [&_td]:border [&_td]:border-line [&_td]:px-2 [&_th]:border [&_th]:border-line [&_th]:px-2">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: 'ignore' }]]}
        components={{
          pre: ({ children: c }: { children?: ReactNode }) => <>{c}</>,
          code: ({ className, children: c }: { className?: string; children?: ReactNode }) => {
            const text = String(c ?? '');
            const lang = /language-(\w+)/.exec(className ?? '')?.[1];
            return lang || text.includes('\n')
              ? <CodeBlock code={text.replace(/\n$/, '')} lang={lang} />
              : <code className="rounded bg-raised px-1.5 py-0.5 text-[0.9em]">{c}</code>;
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
});
