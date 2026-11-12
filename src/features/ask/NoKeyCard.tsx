import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { useFallbackState } from '@/features/ai-settings/useFallbackState';
import { useSettings } from '@/lib/settings';

/** True when there is no way to call the AI yet (no key in the pool, no old key, no proxy). */
export function useNoKey(): boolean {
  const pool = useFallbackState();
  const s = useSettings();
  return pool.keys.length === 0 && !s.apiKey.trim() && !s.proxyUrl.trim();
}

/** Shown instead of the question box until a free key is added. */
export function NoKeyCard() {
  const nav = useNavigate();
  return (
    <Card className="flex flex-col items-start gap-4" role="status">
      <h2 className="text-xl font-semibold">Add your free key to start</h2>
      <p className="text-base text-muted">It takes about a minute and costs nothing. Your key stays on this device.</p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => nav('/welcome')}>Get started</Button>
        <Button variant="secondary" onClick={() => nav('/settings')}>I have a key</Button>
      </div>
    </Card>
  );
}
