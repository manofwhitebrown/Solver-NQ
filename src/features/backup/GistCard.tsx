import { useState } from 'react';
import { CloudUpload } from 'lucide-react';
import { Button, Card, Cluster, Stack } from '@/components/ui';
import { disconnectGist, gistId, gistToken, pullFromGist, pushToGist, setGistId, setGistToken } from './gist';

export function GistCard() {
  const [token, setToken] = useState(gistToken());
  const [id, setId] = useState(gistId());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const connected = Boolean(gistToken());

  const run = async (fn: () => Promise<{ message: string }>) => {
    setBusy(true); setMessage('');
    const r = await fn();
    setMessage(r.message); setId(gistId()); setBusy(false);
  };
  const save = () => { setGistToken(token); setGistId(id); setMessage('Saved on this device only.'); };

  return (
    <Card aria-labelledby="gist-title">
      <Stack gap={3}>
        <h2 id="gist-title" className="flex items-center gap-3 text-lg font-bold"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent"><CloudUpload size={20} aria-hidden /></span>Sync between devices (optional)</h2>
        <p className="text-sm text-ink-2">
          Uses a private GitHub gist you own. Create a token at github.com/settings/tokens with only the &quot;gist&quot; permission. The token stays on this device and is never put in backups. Photos are not synced.
        </p>
        <label className="text-sm font-semibold" htmlFor="gist-token">GitHub token</label>
        <input id="gist-token" type="password" autoComplete="off" value={token} onChange={e => setToken(e.target.value)} className="min-h-11 rounded-lg border border-line bg-surface px-3 text-base" />
        <label className="text-sm font-semibold" htmlFor="gist-id">Gist id (filled in after the first upload; paste it on your second device)</label>
        <input id="gist-id" value={id} onChange={e => setId(e.target.value)} className="min-h-11 rounded-lg border border-line bg-surface px-3 text-base" />
        <Cluster gap={3}>
          <Button variant="secondary" disabled={busy} onClick={save}>Save</Button>
          <Button disabled={busy || !connected} onClick={() => void run(pushToGist)}>Upload</Button>
          <Button variant="secondary" disabled={busy || !connected} onClick={() => void run(pullFromGist)}>Download and merge</Button>
          {connected && <Button variant="secondary" disabled={busy} onClick={() => { disconnectGist(); setToken(''); setId(''); setMessage('Disconnected.'); }}>Disconnect</Button>}
        </Cluster>
        {message && <p role="status" className="text-sm font-semibold">{message}</p>}
      </Stack>
    </Card>
  );
}
