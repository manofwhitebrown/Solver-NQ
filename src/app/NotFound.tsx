import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/ui';

export function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      text="That address doesn't lead anywhere."
      action={<Link to="/" className="font-semibold text-accent">Go to Ask</Link>}
    />
  );
}
