import { Button, Card } from '@/components/ui';
import { saveFile, type BuildResult } from '@/lib/export';

const fmtSize = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const OPENABLE = /\.(pdf|md|txt|json)$/;

export function ResultCard({ result, onShareError }: { result: BuildResult; onShareError: (m: string) => void }) {
  function open() {
    const url = URL.createObjectURL(result.blob);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
  return (
    <Card className="space-y-3" role="status">
      <p className="text-[15px] font-semibold">Ready</p>
      <p className="break-words text-[15px]">{result.filename}</p>
      <p className="text-[13px] text-muted">{result.count} answer{result.count === 1 ? '' : 's'} · {fmtSize(result.blob.size)} · made in {(result.ms / 1000).toFixed(1)}s</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button block onClick={() => saveFile(result.blob, result.filename).catch((e) => onShareError(String(e?.message ?? e)))}>
          Save / Share
        </Button>
        {OPENABLE.test(result.filename) && !('Capacitor' in globalThis && (globalThis as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()) && (
          <Button block variant="secondary" onClick={open}>Open</Button>
        )}
      </div>
    </Card>
  );
}
