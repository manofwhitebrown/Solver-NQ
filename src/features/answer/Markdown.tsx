import { memo, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // bundled by Vite, fonts included: works offline
import { CodeBlock } from './CodeBlock';
import './answer.css';
import { normalizeDisplayMath } from './mathBlocks';
import { rehypeFocusableMath } from './rehypeFocusableMath';

/** Markdown with $inline$ and $$block$$ LaTeX. Unknown LaTeX renders as red text instead of crashing. */
const SIZES = {
  read: 'text-read',
  question: 'text-lg leading-normal',
  final: 'text-[20px] font-semibold leading-snug',
} as const;

export const Markdown = memo(function Markdown({ children, size = 'read' }: { children: string; size?: keyof typeof SIZES }) {
  return (
    <div className={`prose-answer break-words ${size === 'final' ? 'prose-final ' : ''}${SIZES[size]}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: 'ignore' }], rehypeFocusableMath]}
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
        {normalizeDisplayMath(children)}
      </ReactMarkdown>
    </div>
  );
});
