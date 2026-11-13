import { Link } from 'react-router-dom';
import { Clock, WifiOff } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { formatTime } from '@/lib/ai/errors';

/** The question is saved and will be answered later: either free limits are used up (retryAt) or the phone is offline. */
export function QueuedCard({ retryAt, onAskAnother }: { retryAt?: number; onAskAnother: () => void }) {
  const Icon = retryAt ? Clock : WifiOff;
  return (
    <Card className="elev-2 flex flex-col items-start gap-4" role="status">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-warn-soft text-warn"><Icon size={24} aria-hidden /></span>
      <div>
        <h2 className="text-xl font-semibold">{retryAt ? 'Saved. Free limits are used up' : "Saved. I'll answer when you're online"}</h2>
        <p className="mt-1 text-base text-muted">
          {retryAt
            ? `I'll answer automatically when the quota resets (about ${formatTime(retryAt)}). The answer will appear in your library.`
            : 'You can keep asking. Answers appear in your library.'}
        </p>
      </div>
      <div className="flex w-full flex-wrap gap-3">
        <Button onClick={onAskAnother}>Ask another</Button>
        <Link to="/library" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line-strong bg-surface px-5 text-base font-semibold text-ink shadow-soft hover:bg-raised">
          Open library
        </Link>
      </div>
    </Card>
  );
}
