export type OcrErrorCode = 'permission' | 'no-camera' | 'too-large' | 'ocr-failed' | 'offline-no-data' | 'unsupported' | 'heic' | 'empty-pdf';

const MESSAGES: Record<OcrErrorCode, string> = {
  'permission': 'Camera access is turned off. To use it, open your phone Settings, find this app, and allow Camera. Or choose a photo from your gallery instead.',
  'no-camera': "We couldn't find a camera on this device. Choose a photo or file instead.",
  'too-large': 'That file is over 25 MB. Try a smaller photo, or take a new one at a lower quality.',
  'ocr-failed': "We couldn't read that image. You can type the question, or send the image to the AI directly.",
  'offline-no-data': 'Text recognition needs a one-time download. Connect once and it will work offline after that.',
  'unsupported': 'We can only read photos (JPG, PNG, WebP) and PDFs. Please choose one of those.',
  'heic': "This phone saved the photo as HEIC, which we can't open here. Take it as a JPG (Camera settings, Format, Most compatible), or take a screenshot of it and choose that.",
  'empty-pdf': 'That PDF has no pages. Choose a different file.',
};

export class OcrError extends Error {
  constructor(public code: OcrErrorCode) { super(MESSAGES[code]); }
}
export const friendlyMessage = (e: unknown) =>
  e instanceof OcrError ? e.message : MESSAGES['ocr-failed'];
