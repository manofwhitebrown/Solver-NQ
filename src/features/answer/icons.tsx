const PATHS: Record<string, string> = {
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.9z',
  tag: 'M3 12V4h8l10 10-8 8L3 12zM7.5 8.5h.01',
  cards: 'M4 7h12v12H4zM8 7V4h12v12h-4',
  export: 'M12 15V3m0 0l-4 4m4-4l4 4M5 13v7h14v-7',
  speaker: 'M4 10v4h4l5 4V6L8 10H4zM16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11',
  stop: 'M7 7h10v10H7z',
  share: 'M12 4v11m0-11L8 8m4-4l4 4M6 12H5v8h14v-8h-1',
  copy: 'M9 9h11v11H9zM5 15V4h11',
  graph: 'M4 4v16h16M7 15l4-5 3 3 5-7',
  send: 'M4 12l16-8-6 16-2-7z',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  warn: 'M12 4l9 16H3zM12 10v4m0 3h.01',
  chat: 'M4 5h16v11H9l-5 4z',
};

export function Icon({ name, filled, className = 'h-5 w-5' }: { name: keyof typeof PATHS; filled?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={PATHS[name]} />
    </svg>
  );
}
