import { lazy, Suspense } from 'react';

// KaTeX and code highlighting load only when a card is shown, so they stay out of the main bundle.
const Markdown = lazy(() => import('@/features/answer/Markdown').then((m) => ({ default: m.Markdown })));

/** Card/quiz text with $math$ and code. Shows plain text until the renderer has loaded. */
export function CardText({ children }: { children: string }) {
  return (
    <Suspense fallback={<span className="whitespace-pre-wrap">{children}</span>}>
      <Markdown>{children}</Markdown>
    </Suspense>
  );
}
