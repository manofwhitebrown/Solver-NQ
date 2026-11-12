import { EmptyState } from '@/components/ui';

/** Shown for a main route until its owner ships the real screen. */
export function Placeholder({ name }: { name: string }) {
  return <EmptyState title={name} text="This screen is being built." />;
}
