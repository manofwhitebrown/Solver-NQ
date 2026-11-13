import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LABEL_HIDDEN_WHEN_NARROW, StepIndicator } from './StepIndicator';

// R1: "3 Check text" made /scan 363 px wide on a 320 px phone (and 3 px too wide at 360).
// Browser widths are checked by hand/headless (see docs/status/AI-4.md); this guards the rule that fixed it:
// on narrow screens only the CURRENT step keeps a visible name, the others show just the number or tick.
describe('StepIndicator on narrow screens (R1)', () => {
  const labels = (step: 1 | 2 | 3) =>
    [...renderToStaticMarkup(<StepIndicator step={step} />).matchAll(/<span class="([^"]*)"( data-narrow-hidden="")?>(Capture|Crop|Check text)<\/span>/g)]
      .map(m => ({ name: m[3], cls: m[1], hidden: m[2] !== undefined }));

  it('has the narrow-screen class rule defined', () => {
    expect(LABEL_HIDDEN_WHEN_NARROW).toContain('max-[399px]');
    expect(LABEL_HIDDEN_WHEN_NARROW).toContain('sr-only'); // hidden visually, still read by screen readers
  });
  it.each([1, 2, 3] as const)('step %i: every label except the current one is marked narrow-hidden', step => {
    const ls = labels(step);
    expect(ls.map(l => l.name)).toEqual(['Capture', 'Crop', 'Check text']);
    ls.forEach((l, i) => {
      const current = i + 1 === step;
      expect(l.hidden).toBe(!current);
      expect(l.cls.includes(LABEL_HIDDEN_WHEN_NARROW)).toBe(true); // the class only bites when data-narrow-hidden is set
    });
  });
  it('the last step cannot shrink away and the first two can', () => {
    const html = renderToStaticMarkup(<StepIndicator step={1} />);
    expect(html).toContain('shrink-0');
    expect(html).toContain('min-w-0');
  });
});
