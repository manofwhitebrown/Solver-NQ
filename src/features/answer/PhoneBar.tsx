import { ActionBar } from '@/components/ui';
import { Icon } from './icons';
import type { AnswerActions } from './actions';

type Props = Pick<AnswerActions, 'q' | 'onStar' | 'onCards' | 'onExport'> & { onMore: () => void };

/** Phone: the only bottom bar on this page. Four labelled actions, each at least 56 px tall. */
export function PhoneBar({ q, onStar, onCards, onExport, onMore }: Props) {
  const item = 'flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md text-caption font-semibold text-ink-2 active:bg-raised';
  return (
    <ActionBar className="!bottom-0 !px-2 !py-0 lg:hidden" >
      <div className="flex w-full pb-[var(--sab)]" role="toolbar" aria-label="Answer actions">
        <button type="button" className={`${item} ${q.starred ? 'text-warn' : ''}`} aria-pressed={q.starred} onClick={onStar}>
          <Icon name="star" filled={q.starred} />Star
        </button>
        <button type="button" className={item} title="Make flashcards" onClick={onCards}><Icon name="cards" />Cards</button>
        <button type="button" className={item} onClick={onExport}><Icon name="export" />Export</button>
        <button type="button" className={item} aria-haspopup="dialog" onClick={onMore}><Icon name="more" />More</button>
      </div>
    </ActionBar>
  );
}
