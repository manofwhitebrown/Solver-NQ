import { Link } from 'react-router-dom';
import { Button, Cluster } from '@/components/ui';
import { Icon } from './icons';
import { useReadAloud, type AnswerActions } from './actions';

/** Laptop: every action as a labelled button. (Phones use PhoneBar + MoreSheet.) */
export function Toolbar({ q, a, graphFn, onStar, onTags, onCards, onExport, onShare, onCopy }: AnswerActions) {
  const ra = useReadAloud(a);
  return (
    <Cluster gap={2} className="hidden lg:flex" role="toolbar" aria-label="Answer actions">
      <Button variant="secondary" aria-pressed={q.starred} onClick={onStar} className={q.starred ? 'text-warn' : ''}>
        <Icon name="star" filled={q.starred} className="mr-2 h-5 w-5" />{q.starred ? 'Starred' : 'Star'}
      </Button>
      <Button variant="secondary" onClick={onCards}><Icon name="cards" className="mr-2 h-5 w-5" />Cards</Button>
      <Button variant="secondary" onClick={onExport}><Icon name="export" className="mr-2 h-5 w-5" />Export</Button>
      <Button variant="secondary" onClick={onTags}><Icon name="tag" className="mr-2 h-5 w-5" />Tags</Button>
      <Button variant="secondary" onClick={ra.toggle} aria-label={ra.label} className={ra.status !== 'idle' ? 'text-accent' : ''}>
        <Icon name={ra.status === 'speaking' ? 'pause' : 'speaker'} className="mr-2 h-5 w-5" />{ra.status === 'idle' ? 'Read aloud' : ra.status === 'speaking' ? 'Pause' : 'Resume'}
      </Button>
      {ra.status !== 'idle' && (
        <>
          <Button variant="secondary" onClick={ra.stop}><Icon name="stop" className="mr-2 h-5 w-5" />Stop</Button>
          <Button variant="secondary" onClick={ra.cycleSpeed} aria-label="Change reading speed">{ra.rate}x</Button>
        </>
      )}
      <Button variant="secondary" onClick={onShare}><Icon name="share" className="mr-2 h-5 w-5" />Share</Button>
      <Button variant="secondary" onClick={onCopy}><Icon name="copy" className="mr-2 h-5 w-5" />Copy</Button>
      {graphFn && (
        <Link to={`/graph?f=${encodeURIComponent(graphFn)}`}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-md px-4 text-[15px] font-semibold text-accent hover:bg-raised">
          <Icon name="graph" />Graph this
        </Link>
      )}
    </Cluster>
  );
}
