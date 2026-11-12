export type OcrErrorCode = 'permission' | 'no-camera' | 'too-large' | 'ocr-failed' | 'offline-no-data';

const MESSAGES: Record<OcrErrorCode, string> = {
  'permission': 'Camera access was blocked. You can allow it in your settings, or pick a photo from your gallery instead.',
  'no-camera': "We couldn't find a camera. You can choose a photo or file instead.",
  'too-large': 'That file is very large. Try a smaller photo or crop it first.',
  'ocr-failed': "We couldn't read that image. You can type the question, or send the image to the AI directly.",
  'offline-no-data': 'Text recognition needs a one-time download. Connect once and it will work offline after that.',
};

export class OcrError extends Error {
  constructor(public code: OcrErrorCode) { super(MESSAGES[code]); }
}
export const friendlyMessage = (e: unknown) =>
  e instanceof OcrError ? e.message : MESSAGES['ocr-failed'];
