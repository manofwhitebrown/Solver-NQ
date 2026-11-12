import { describe, it, expect } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { Markdown } from './Markdown';
import { Steps } from './Steps';
import { FinalAnswerCard } from './FinalAnswerCard';
import { VerifyBadge } from './VerifyBadge';

const steps = [
  { id: '1', title: 'Subtract three', body: 'We get $2x = 8$.' },
  { id: '2', title: 'Divide by two', body: 'So $x = 4$.' },
  { id: 'fu-9', title: 'Extra note', body: 'Follow-up text.' },
];
const noop = () => undefined;

describe('Markdown', () => {
  it('renders LaTeX with KaTeX (no network needed)', () => {
    const html = renderToString(h(Markdown, null, 'Inline $x^2$ and block:\n\n$$\\frac{a}{b}$$'));
    expect(html).toContain('class="katex"');
    expect(html).toContain('katex-display');
    expect(html).not.toMatch(/https?:\/\/(?!www\.w3\.org)/); // nothing fetched from a CDN
  });
  it('survives broken LaTeX', () => {
    expect(() => renderToString(h(Markdown, null, '$\\notacommand{$'))).not.toThrow();
  });
  it('highlights code and offers Copy', () => {
    const html = renderToString(h(Markdown, null, '```python\nprint(1)\n```'));
    expect(html).toContain('hljs-');
    expect(html).toContain('Copy');
  });
});

describe('Steps in Learn mode', () => {
  it('hides every step body and shows the try-this prompt first', () => {
    const html = renderToString(h(Steps, { steps, initialMode: 'learn', onAllRevealed: noop }));
    expect(html).toContain('try this first');
    expect(html).toContain('Subtract three');
    expect(html).not.toContain('We get');
    expect(html).toContain('Show next step');
    expect(html).toContain('Show everything');
    expect(html).toContain('Follow-up text.'); // follow-ups are never hidden
  });
  it('shows all steps in Answer mode', () => {
    const html = renderToString(h(Steps, { steps, initialMode: 'answer', onAllRevealed: noop }));
    expect(html).toContain('We get');
    expect(html).toContain('So');
    expect(html).not.toContain('try this first');
  });
});

describe('FinalAnswerCard', () => {
  it('hides the answer until revealed', () => {
    expect(renderToString(h(FinalAnswerCard, { text: 'x = 4', hidden: true, onReveal: noop }))).not.toContain('x = 4');
    expect(renderToString(h(FinalAnswerCard, { text: 'x = 4', hidden: false, onReveal: noop }))).toContain('x = 4');
  });
});

describe('VerifyBadge is honest', () => {
  it('says Checked only on a real match', () => {
    expect(renderToString(h(VerifyBadge, { verified: 'match' }))).toContain('Checked');
    expect(renderToString(h(VerifyBadge, { verified: 'unchecked' }))).not.toContain('Checked');
    expect(renderToString(h(VerifyBadge, { verified: 'mismatch' }))).not.toContain('Checked');
  });
  it('warns clearly on mismatch and stays calm when unchecked', () => {
    const bad = renderToString(h(VerifyBadge, { verified: 'mismatch' }));
    expect(bad).toContain("Doesn&#x27;t match");
    expect(bad).toContain('role="alert"');
    const un = renderToString(h(VerifyBadge, { verified: 'unchecked' }));
    expect(un).toContain('always double-check');
    expect(un).not.toContain('role="alert"');
  });
});
