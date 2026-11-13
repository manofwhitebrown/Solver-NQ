import { useState } from 'react';
import {
  BottomSheet, Button, Card, Checkbox, Chip, Cluster, Dialog, EmptyState, Field, Input, Select, Skeleton,
  Spinner, Stack, Tabs, Textarea, Toolbar, TwoPane, toast,
} from '@/components/ui';

export function Components() {
  const [tab, setTab] = useState('a');
  const [chip, setChip] = useState(true);
  const [dlg, setDlg] = useState(false);
  const [sheet, setSheet] = useState(false);
  return (
    <Stack gap={4}>
      <Card>
        <Stack gap={3}>
          <Cluster><Button>Primary 48</Button><Button variant="secondary">Secondary</Button><Button variant="ghost">Ghost</Button><Button variant="danger">Danger</Button></Cluster>
          <Cluster><Button disabled>Disabled</Button><Button variant="secondary" disabled>Disabled</Button><Button loading>Loading</Button><Button size="sm" variant="secondary">Small 36</Button></Cluster>
          <Cluster><Chip selected={chip} onClick={() => setChip(!chip)}>Selected chip</Chip><Chip>Chip</Chip><Spinner /></Cluster>
        </Stack>
      </Card>
      <Card>
        <Stack gap={3}>
          <Field label="Input" htmlFor="g-in" hint="Hint text, 13 px"><Input id="g-in" placeholder="Type here" /></Field>
          <Field label="Select" htmlFor="g-sel"><Select id="g-sel" options={[{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }]} /></Field>
          <Field label="Textarea" htmlFor="g-ta"><Textarea id="g-ta" placeholder="Longer text" /></Field>
          <Checkbox label="Checkbox with label" defaultChecked />
        </Stack>
      </Card>
      <Card>
        <Stack gap={3}>
          <Tabs label="Demo" value={tab} onChange={setTab} items={[{ value: 'a', label: 'First' }, { value: 'b', label: 'Second' }, { value: 'c', label: 'Third' }]} />
          <Toolbar><Button size="sm" variant="secondary" onClick={() => toast('Saved', 'success')}>Toast</Button><Button size="sm" variant="secondary" onClick={() => setDlg(true)}>Dialog</Button><Button size="sm" variant="secondary" onClick={() => setSheet(true)}>Sheet</Button></Toolbar>
          <Skeleton className="h-4 w-2/3" /><Skeleton className="h-16 w-full" />
        </Stack>
      </Card>
      <Card interactive><p className="font-semibold">Interactive card</p><p className="text-sm text-muted">Hover or tap: border and shadow lift.</p></Card>
      <Card><EmptyState title="Nothing here yet" text="Friendly empty states get a small illustration." /></Card>
      <Card>
        <p className="mb-3 font-semibold">TwoPane (stacks under 768 px, side by side from 768 px)</p>
        <TwoPane
          primaryLabel="Demo main pane" secondaryLabel="Demo side pane" secondaryWidth="sm" stickySecondary={false}
          primary={<Stack gap={3}><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></Stack>}
          secondary={<div className="rounded-md bg-accent-soft p-4 text-sm text-ink-2">Side pane: follow-up chat, details or a preview.</div>}
        />
      </Card>
      <Dialog open={dlg} title="Dialog" onClose={() => setDlg(false)} actions={<Button onClick={() => setDlg(false)}>Close</Button>}>Calm, centered, elevated.</Dialog>
      <BottomSheet open={sheet} title="Bottom sheet" onClose={() => setSheet(false)}><p className="pb-4 text-ink-2">Slides up on phones.</p></BottomSheet>
    </Stack>
  );
}
