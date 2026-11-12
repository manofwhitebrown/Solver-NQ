const PATHS: Record<string, string> = {
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.9z',
  tag: 'M3 12V4h8l10 10-8 8L3 12zM7.5 8.5h.01',
  cards: 'M5 9a1 1 0 011-1h12a1 1 0 011 1v9a1 1 0 01-1 1H6a1 1 0 01-1-1zM8 5.5h8M10.5 3h3',
  export: 'M12 4v11m0 0l-4-4m4 4l4-4M5 20h14',
  speaker: 'M4 10v4h4l5 4V6L8 10H4zM16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11',
  stop: 'M7 7h10v10H7z',
  share: 'M21 5a3 3 0 11-6 0 3 3 0 016 0zM9 12a3 3 0 11-6 0 3 3 0 016 0zM21 19a3 3 0 11-6 0 3 3 0 016 0zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
  copy: 'M8 8h12v12H8zM16 8V4H4v12h4',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  close: 'M6 6l12 12M18 6L6 18',
  pause: 'M8 5v14M16 5v14',
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
