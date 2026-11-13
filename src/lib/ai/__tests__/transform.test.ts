import { beforeEach, describe, expect, it, vi } from 'vitest';
const run = vi.hoisted(() => vi.fn());
vi.mock('../run', () => ({ runModel: run }));
import { isRefusal, transcribeImage, transformText } from '../transform';

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

describe('transcribeImage refusals (R2)', () => {
  const img = 'data:image/jpeg;base64,AAAA';
  it.each([
    "I'm sorry, I can't help with that.",
    'I cannot read this image.',
    "I can’t transcribe handwriting.",
    'As an AI, I am unable to view pictures.',
    "Sorry, I can't do that.",
  ])('rejects the refusal %j with its own message', async (reply) => {
    run.mockResolvedValue({ text: reply, model: 'm' });
    await expect(transcribeImage(img)).rejects.toMatchObject({
      code: 'image_refused', message: 'The AI would not read this picture. Type the question instead.',
    });
  });
  it.each([
    "I can't remember if 2x + 3 = 11 is right. Solve for x.",
    'I cannot solve $x^2 = 4$ without help. Please explain.',
    "I'm sorry, but what is 15% of 80?",
    "As an AI textbook example says: find 3 + 4.",
    'I can add 2 and 3. Show the steps.',
  ])('still passes the real question %j', async (reply) => {
    run.mockResolvedValue({ text: reply, model: 'm' });
    expect(await transcribeImage(img)).toBe(reply);
  });
  it('does not flag ordinary transcriptions', () => {
    expect(isRefusal('What is the capital of France?')).toBe(false);
    expect(isRefusal('Photosynthesis converts light to chemical energy')).toBe(false);
  });
  it('an empty reply gets its own message', async () => {
    run.mockResolvedValue({ text: '  ', model: 'm' });
    await expect(transcribeImage(img)).rejects.toMatchObject({ code: 'empty', message: 'The AI sent nothing back. Try again.' });
  });
});
