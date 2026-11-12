import { beforeEach, describe, expect, it, vi } from 'vitest';
const run = vi.hoisted(() => vi.fn());
vi.mock('../run', () => ({ runModel: run }));
import { transcribeImage, transformText } from '../transform';

beforeEach(() => run.mockReset());

describe('transformText', () => {
  it('sends the text with a kind-specific prompt and returns trimmed Markdown', async () => {
    run.mockResolvedValue({ text: '\n# Summary\n', model: 'm' });
    expect(await transformText('summary', ' notes ', { maxItems: 5 })).toBe('# Summary');
    expect(run.mock.calls[0][0]).toContain('Summarise');
    expect(run.mock.calls[0][0]).toContain('at most 5');
    expect(run.mock.calls[0][1][0].content).toBe('notes');
  });
  it('rejects empty text without calling the AI', async () => {
    await expect(transformText('keyterms', '  ')).rejects.toMatchObject({ code: 'bad_request' });
    expect(run).not.toHaveBeenCalled();
  });
});

describe('transcribeImage', () => {
  it('requires a vision-capable model and returns the text', async () => {
    run.mockResolvedValue({ text: ' x^2 = 4 ', model: 'm' });
    expect(await transcribeImage('data:image/jpeg;base64,AAAA')).toBe('x^2 = 4');
    expect(run.mock.calls[0][2]).toMatchObject({ requireImage: true, imageDataUrl: 'data:image/jpeg;base64,AAAA' });
  });
  it('rejects anything that is not an image data URL', async () => {
    await expect(transcribeImage('hello')).rejects.toMatchObject({ code: 'bad_request' });
  });
});
