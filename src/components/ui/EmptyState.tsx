import type { ReactNode } from 'react';

export function EmptyState({ title, text, action, icon }: {
  title: string; text?: string; action?: ReactNode; icon?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 px-6 py-16 text-center">
      {icon && <div className="text-muted">{icon}</div>}
      <h2 className="text-lg font-semibold">{title}</h2>
      {text && <p className="text-[15px] leading-relaxed text-muted">{text}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
