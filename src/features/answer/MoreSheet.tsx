import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BottomSheet, Cluster, Button } from '@/components/ui';
import { Icon } from './icons';
import { useReadAloud, type AnswerActions } from './actions';

const row = 'flex min-h-[56px] w-full items-center gap-4 rounded-md px-2 text-left text-base font-semibold text-ink hover:bg-raised';

function Row({ icon, onClick, children, label }: { icon: Parameters<typeof Icon>[0]['name']; onClick: () => void; children: ReactNode; label?: string }) {
  return <button type="button" className={row} onClick={onClick} aria-label={label}><Icon name={icon} className="h-6 w-6 text-ink-2" />{children}</button>;
}

/** Phone "More" sheet: everything that is not in the bottom bar. */
export function MoreSheet({ open, onClose, a, graphFn, onTags, onShare, onCopy }:
  Pick<AnswerActions, 'a' | 'graphFn' | 'onTags' | 'onShare' | 'onCopy'> & { open: boolean; onClose: () => void }) {
  const ra = useReadAloud(a);
  const then = (fn: () => void) => () => { onClose(); fn(); };
  return (
    <BottomSheet open={open} onClose={onClose} title="More">
      <div className="flex flex-col">
        <Row icon="tag" onClick={then(onTags)}>Tags</Row>
        <Row icon={ra.status === 'speaking' ? 'pause' : 'speaker'} onClick={ra.toggle} label={ra.label}>{ra.label}</Row>
        {ra.status !== 'idle' && (
          <Cluster gap={3} className="pb-2 pl-12">
            <Button variant="secondary" onClick={ra.stop}>Stop</Button>
            <Button variant="secondary" onClick={ra.cycleSpeed} aria-label="Change reading speed">{ra.rate}x</Button>
          </Cluster>
        )}
        <Row icon="share" onClick={then(onShare)}>Share</Row>
        <Row icon="copy" onClick={then(onCopy)}>Copy</Row>
        {graphFn && (
          <Link to={`/graph?f=${encodeURIComponent(graphFn)}`} className={row} onClick={onClose}>
            <Icon name="graph" className="h-6 w-6 text-ink-2" />Graph this
          </Link>
        )}
      </div>
    </BottomSheet>
  );
}
