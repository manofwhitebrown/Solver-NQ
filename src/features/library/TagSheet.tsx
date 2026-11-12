import { useState } from 'react';
import { BottomSheet, Button, Chip, IconButton, Input } from '@/components/ui';
import { renameTag } from '@/lib/db';

const clean = (s: string) => s.trim().replace(/^#/, '').toLowerCase();

/** Add a tag to the selected questions. */
export function AddTagSheet({ open, existing, onAdd, onClose }: { open: boolean; existing: string[]; onAdd: (t: string) => void; onClose: () => void }) {
  const [text, setText] = useState('');
  const submit = (t: string) => { const v = clean(t); if (v) { onAdd(v); setText(''); onClose(); } };
  return (
    <BottomSheet open={open} title="Add tag" onClose={onClose}>
      <div className="flex gap-2">
        <Input value={text} autoFocus placeholder="New tag" onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(text); }} />
        <Button onClick={() => submit(text)}>Add</Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {existing.map(t => <Chip key={t} onClick={() => submit(t)}>#{t}</Chip>)}
      </div>
    </BottomSheet>
  );
}

/** Rename or delete tags everywhere. */
export function ManageTagsSheet({ open, tags, onChanged, onClose }: { open: boolean; tags: Array<{ tag: string; count: number }>; onChanged: () => void; onClose: () => void }) {
  const [edits, setEdits] = useState<Record<string, string>>({});
  const apply = async (from: string, to: string) => { await renameTag(from, clean(to)); onChanged(); };
  return (
    <BottomSheet open={open} title="Edit tags" onClose={onClose}>
      <ul className="space-y-3">
        {tags.map(({ tag, count }) => {
          const value = edits[tag] ?? tag;
          return (
            <li key={tag} className="flex items-center gap-2">
              <Input value={value} aria-label={`Rename ${tag}`} onChange={e => setEdits(s => ({ ...s, [tag]: e.target.value }))} />
              <span className="w-6 text-center text-caption text-muted">{count}</span>
              <Button variant="secondary" disabled={!clean(value) || clean(value) === tag} onClick={() => void apply(tag, value)}>Save</Button>
              <IconButton label={`Delete ${tag}`} onClick={() => { if (window.confirm(`Remove #${tag} from ${count} item(s)?`)) void apply(tag, ''); }}>🗑</IconButton>
            </li>
          );
        })}
      </ul>
    </BottomSheet>
  );
}
