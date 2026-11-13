import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import type { AiErrorCode } from '@/lib/ai/errors';

/** Problems the person fixes in Settings; anything else is worth a plain "Try again". */
const SETTINGS_CODES: AiErrorCode[] = ['no_key', 'bad_key', 'no_model', 'bad_request'];

/** Error under the input card: what happened, plus one button for the likeliest fix. Text and icon, never colour alone. */
export function ErrorBanner({ message, code, onRetry, onDismiss }: { message: string; code?: AiErrorCode; onRetry: () => void; onDismiss: () => void }) {
  const nav = useNavigate();
  const toSettings = code !== undefined && SETTINGS_CODES.includes(code);
  const canRetry = code !== 'blocked' && !toSettings; // a blocked question needs rewording, not a resend
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-lg border border-bad/40 bg-bad-soft p-4">
      <div className="flex items-start gap-3">
        <AlertCircle size={22} aria-hidden className="mt-0.5 shrink-0 text-bad" />
        <p className="min-w-0 flex-1 break-words text-base text-ink">{message}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {toSettings && <Button size="md" onClick={() => nav('/settings')}>Open settings</Button>}
        {canRetry && <Button size="md" onClick={onRetry}>Try again</Button>}
        <Button size="md" variant="ghost" onClick={onDismiss}>Dismiss</Button>
      </div>
    </div>
  );
}
