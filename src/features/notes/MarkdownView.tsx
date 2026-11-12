import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui';

// Lazy so KaTeX and the markdown stack only load when a note is opened.
const Markdown = lazy(() => import('@/features/answer/Markdown').then((m) => ({ default: m.Markdown })));

export function MarkdownView({ children }: { children: string }) {
  return (
    <div className="text-[17px] leading-[1.7]">
      <Suspense fallback={<Skeleton className="h-24 w-full" />}><Markdown>{children}</Markdown></Suspense>
    </div>
  );
}
