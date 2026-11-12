import { Link } from 'react-router-dom';
import { Button, EmptyState } from '@/components/ui';

export function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      text="That address doesn't lead anywhere. Let's get you back."
      action={<Link to="/"><Button>Go to Ask</Button></Link>}
    />
  );
}
