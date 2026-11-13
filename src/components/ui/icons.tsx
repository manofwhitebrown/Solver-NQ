import { ArrowLeft, BookOpen, Camera, Database, GraduationCap, Info, MessageSquare, Palette, Settings, SlidersHorizontal, Sparkles, WifiOff, type LucideProps } from 'lucide-react';

/** One icon set: lucide, 1.75 stroke, 20/24 px. Import only the icons you use (tree-shaken). */
const wrap = (I: typeof Settings) => ({ size = 24, strokeWidth = 1.75, ...p }: LucideProps) => (
  <I size={size} strokeWidth={strokeWidth} aria-hidden {...p} />
);
export const AskIcon = wrap(MessageSquare);
export const LibraryIcon = wrap(BookOpen);
export const LearnIcon = wrap(GraduationCap);
export const SettingsIcon = wrap(Settings);
export const BackIcon = wrap(ArrowLeft);
export const CameraIcon = wrap(Camera);
export const SparklesIcon = wrap(Sparkles);
export const OfflineIcon = wrap(WifiOff);
export const PaletteIcon = wrap(Palette);
export const SlidersIcon = wrap(SlidersHorizontal);
export const DataIcon = wrap(Database);
export const InfoIcon = wrap(Info);
