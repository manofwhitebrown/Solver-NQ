import type { ReactNode } from 'react';

const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', className: 'h-6 w-6', 'aria-hidden': true } as const;
const wrap = (d: ReactNode) => <svg {...base}>{d}</svg>;

export const AskIcon = () => wrap(<><path d="M4 5h16v11H9l-5 4z" /><path d="M9 10h6" /></>);
export const LibraryIcon = () => wrap(<><path d="M5 4h4v16H5zM11 4h4v16h-4z" /><path d="m17 6 3 .8-3.4 13" /></>);
export const LearnIcon = () => wrap(<><path d="M3 9l9-5 9 5-9 5z" /><path d="M7 11.5V16c0 1 2.2 2.5 5 2.5s5-1.5 5-2.5v-4.5" /></>);
export const SettingsIcon = () => wrap(<><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" /></>);
