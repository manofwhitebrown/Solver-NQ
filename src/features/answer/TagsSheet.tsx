import { useState } from 'react';
import { BottomSheet, Button, Chip, Input } from '@/components/ui';
import { addTag } from './answerText';

export function TagsSheet({ open, tags, onClose, onChange }: {
  open: boolean; tags: string[]; onClose: () => void; onChange: (t: string[]) => void;
}) {
  const [text, setText] = useState('');
  const add = () => { onChange(addTag(tags, text)); setText(''); };
  return (
    <BottomSheet open={open} onClose={onClose} title="Tags">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {tags.length === 0 && <p className="text-sm text-muted">No tags yet.</p>}
          {tags.map((t) => <Chip key={t} onClick={() => onChange(tags.filter((x) => x !== t))} aria-label={`Remove tag ${t}`}>{t} ×</Chip>)}
        </div>
        <div className="flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a tag" aria-label="New tag"
            onKeyDown={(e) => { if (e.key === 'Enter') add(); }} />
          <Button onClick={add} disabled={!text.trim()}>Add</Button>
        </div>
      </div>
    </BottomSheet>
  );
}
