import type { Answer, Question } from '@/types';

/** Plain markdown of the whole solution, for Copy and Share. */
export function answerToMarkdown(q: Question, a: Answer): string {
  const steps = a.steps.map((s, i) => `${i + 1}. **${s.title}**\n\n${s.body}`).join('\n\n');
  return `**Question**\n\n${q.text}\n\n**Answer**\n\n${a.finalAnswer}\n\n${steps}`.trim();
}

/** What read-aloud should say: answer first, then each step. */
export function answerToSpeech(a: Answer): string {
  return [`Final answer. ${a.finalAnswer}`, ...a.steps.map((s) => `${s.title}. ${s.body}`)].join('\n\n');
}

/** Tags are lowercase, trimmed, single-spaced, and unique. */
export function addTag(tags: string[], raw: string): string[] {
  const t = raw.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 30);
  return t && !tags.includes(t) ? [...tags, t] : tags;
}
