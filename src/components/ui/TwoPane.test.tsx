import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TwoPane } from './TwoPane';

const html = (props: Partial<Parameters<typeof TwoPane>[0]> = {}) =>
  renderToStaticMarkup(<TwoPane primary={<p>MAIN</p>} secondary={<p>SIDE</p>} primaryLabel="Main pane" secondaryLabel="Side pane" {...props} />);

describe('TwoPane', () => {
  it('keeps the main pane first in the DOM so phones stack it on top', () => {
    const h = html();
    expect(h.indexOf('MAIN')).toBeLessThan(h.indexOf('SIDE'));
    expect(h).toContain('grid-cols-1');
  });
  it('is not a second <main> and both panes are named regions', () => {
    const h = html();
    expect(h).not.toContain('<main');
    expect(h).toContain('aria-label="Main pane"');
    expect(h).toContain('aria-label="Side pane"');
  });
  it('lets panes shrink so nothing forces sideways scroll', () => {
    expect(html().match(/min-w-0/g)).toHaveLength(2);
  });
  it('only goes two-column from md (768 px) and honours width and sticky options', () => {
    const h = html({ secondaryWidth: 'sm', stickySecondary: false });
    expect(h).toContain('md:grid-cols-[minmax(0,1fr)_minmax(0,min(18rem,40%))]');
    expect(h).not.toContain('md:sticky');
    expect(html()).toContain('md:sticky');
  });
});
