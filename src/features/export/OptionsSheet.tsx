import { BottomSheet, Button, Checkbox, Field, Input, Select, Tabs } from '@/components/ui';
import type { Subject } from '@/types';
import type { ResolvedOptions, StudyPackFilter } from '@/lib/export';
import { SUBJECT_OPTIONS } from './subjects';

interface Props {
  open: boolean; onClose: () => void; isPack: boolean; isPdf: boolean; isDocx: boolean;
  opts: ResolvedOptions; setOpts: (o: ResolvedOptions) => void;
  filter: StudyPackFilter; setFilter: (f: StudyPackFilter) => void;
}

const toMs = (v: string, end = false) =>
  v ? new Date(`${v}T${end ? '23:59:59' : '00:00:00'}`).getTime() : undefined;

export function OptionsSheet({ open, onClose, isPack, isPdf, isDocx, opts, setOpts, filter, setFilter }: Props) {
  const set = <K extends keyof ResolvedOptions>(k: K, v: ResolvedOptions[K]) => setOpts({ ...opts, [k]: v });
  return (
    <BottomSheet open={open} onClose={onClose} title="Export options">
      <div className="space-y-6">
        {isPack && (
          <div className="space-y-3">
            <Field label="Subject" htmlFor="ex-subject">
              <Select
                id="ex-subject" options={SUBJECT_OPTIONS} value={filter.subject ?? ''}
                onChange={(e) => setFilter({ ...filter, subject: (e.target.value || undefined) as Subject | undefined })}
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="From" htmlFor="ex-from">
                <Input id="ex-from" type="date"
                  onChange={(e) => setFilter({ ...filter, from: toMs(e.target.value) })} />
              </Field>
              <Field label="To" htmlFor="ex-to">
                <Input id="ex-to" type="date"
                  onChange={(e) => setFilter({ ...filter, to: toMs(e.target.value, true) })} />
              </Field>
            </div>
            <Checkbox label="Starred only" checked={!!filter.starred} onChange={(e) => { const v = e.target.checked; setFilter({ ...filter, starred: v || undefined }); }} />
            <Checkbox label="Include flashcards section" checked={opts.includeCards} onChange={(e) => { const v = e.target.checked; set('includeCards', v); }} />
          </div>
        )}

        <div className="space-y-1.5">
          <p className="text-sm font-medium">Content</p>
          <Tabs label="Content" value={opts.stepsMode} onChange={(v) => set('stepsMode', v)}
            items={[{ value: 'full', label: 'Full steps' }, { value: 'final', label: 'Final answer only' }]} />
        </div>

        {(isPdf || isPack) && (
          <>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">PDF style</p>
              <Tabs label="PDF style" value={opts.pdfMode} onChange={(v) => set('pdfMode', v)}
                items={[{ value: 'pretty', label: 'Pretty (math as image)' }, { value: 'text', label: 'Selectable text' }]} />
              <p className="text-sm text-muted">
                {opts.pdfMode === 'pretty' ? 'Math looks perfect; text can’t be selected.' : 'Text can be selected; math is written as plain text.'}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Paper" htmlFor="ex-paper">
                <Select id="ex-paper" value={opts.pageSize} onChange={(e) => set('pageSize', e.target.value as 'a4' | 'letter')}
                  options={[{ value: 'a4', label: 'A4' }, { value: 'letter', label: 'Letter' }]} />
              </Field>
              <Field label="Font size" htmlFor="ex-font">
                <Select id="ex-font" value={String(opts.fontSize)} onChange={(e) => set('fontSize', Number(e.target.value))}
                  options={[10, 11, 12, 14, 16].map((n) => ({ value: String(n), label: `${n} pt` }))} />
              </Field>
            </div>
          </>
        )}

 {(isPdf || isPack || isDocx) && (
          <Checkbox label="Include original question image" checked={opts.includeImage} onChange={(e) => { const v = e.target.checked; set('includeImage', v); }} />
        )}
        <Checkbox label="Include date" checked={opts.includeDate} onChange={(e) => { const v = e.target.checked; set('includeDate', v); }} />
        <Button block onClick={onClose}>Done</Button>
      </div>
    </BottomSheet>
  );
}
