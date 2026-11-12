const BAD = /[\\/:*?"<>|]/g;

export function dateStamp(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** e.g. "Math - Quadratic equations - 2026-11-12.pdf" */
export function makeFilename(subject: string, title: string, ext: string, now = Date.now()): string {
  const clean = [...title].filter((c) => c.charCodeAt(0) > 31).join('').replace(/[$\\{}]/g, '').replace(BAD, ' ').replace(/\s+/g, ' ').trim();
  const short = clean.length > 50 ? clean.slice(0, 50).trim() : clean;
  const parts = [cap(subject), short || 'Answers', dateStamp(now)];
  return `${parts.join(' - ')}.${ext}`;
}
