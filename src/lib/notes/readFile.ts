/** Plain-text files. Markdown is kept as is (headings and lists help the summariser). */
export const isTextFile = (f: File) => /\.(txt|md|markdown)$/i.test(f.name) || f.type.startsWith('text/');
export const isPdfFile = (f: File) => /\.pdf$/i.test(f.name) || f.type === 'application/pdf';
export const isImageFile = (f: File) => f.type.startsWith('image/') || /\.(png|jpe?g|webp|heic)$/i.test(f.name);

export const readTextFile = (f: File) => f.text();

/** Pasted YouTube transcripts often have "0:12" lines and no punctuation; make it readable. */
export function cleanTranscript(raw: string): string {
  const lines = raw.replace(/\r\n?/g, '\n').split('\n')
    .map((l) => l.replace(/^\s*\[?\(?\d{1,2}:\d{2}(?::\d{2})?\)?\]?\s*/, '').trim())
    .filter(Boolean);
  const joined = lines.join(' ').replace(/\s+/g, ' ');
  // Without punctuation, break into paragraphs of about 8 lines so the summariser gets sentences to work with.
  if (/[.!?]/.test(joined)) return joined.replace(/([.!?])\s+/g, '$1 ').trim();
  const out: string[] = [];
  for (let i = 0; i < lines.length; i += 8) out.push(lines.slice(i, i + 8).join(' ') + '.');
  return out.join('\n\n');
}

export const readStats = (text: string) => ({
  chars: text.length,
  words: (text.match(/\S+/g) ?? []).length,
});
