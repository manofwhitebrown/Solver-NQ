import type { Flashcard } from '../../types';
import type { CardDraft } from './cardMaker';

// Anki-compatible: plain text, one card per line, Front<sep>Back. Tab = TSV (Anki default), comma = CSV.
function field(s: string, sep: string): string {
  const flat = s.replace(/\r?\n/g, '<br>');
  return flat.includes(sep) || flat.includes('"') ? `"${flat.replace(/"/g, '""')}"` : flat;
}

export function exportCards(cards: Array<Pick<Flashcard, 'front' | 'back' | 'subject'>>, sep: '\t' | ',' = '\t'): string {
  return cards.map((c) => [field(c.front, sep), field(c.back, sep), field(c.subject, sep)].join(sep)).join('\n') + '\n';
}

/** Parse rows into fields, honouring quotes. */
function parseRows(text: string, sep: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cur = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"' && cur === '') quoted = true;
    else if (ch === sep) { row.push(cur); cur = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cur); cur = '';
      if (row.some((f) => f.trim())) rows.push(row);
      row = [];
    } else cur += ch;
  }
  row.push(cur);
  if (row.some((f) => f.trim())) rows.push(row);
  return rows;
}

export function detectSeparator(text: string): '\t' | ',' | ';' {
  const first = text.split(/\r?\n/).find((l) => l.trim() && !l.startsWith('#')) ?? '';
  if (first.includes('\t')) return '\t';
  return (first.match(/;/g)?.length ?? 0) > (first.match(/,/g)?.length ?? 0) ? ';' : ',';
}

export function importCards(text: string): Array<CardDraft & { subject?: string }> {
  const body = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => !l.startsWith('#')).join('\n');
  const sep = detectSeparator(body);
  return parseRows(body, sep)
    .filter((r) => r.length >= 2 && r[0].trim() && r[1].trim())
    .map((r) => ({
      front: r[0].replace(/<br\s*\/?>/gi, '\n').trim(),
      back: r[1].replace(/<br\s*\/?>/gi, '\n').trim(),
      subject: r[2]?.trim() || undefined,
    }));
}
