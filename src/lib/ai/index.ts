// AI engine public API (AI-2). Signatures match the shared contract.
export { askQuestion, IMAGE_ONLY_TEXT } from './ask';
export { flushPending, startQueueFlush } from './pending';
export { followUp, generateCards, generateQuiz, similarProblem } from './extras';
export { AiError, formatTime } from './errors';
export { getPrimaryModel } from './fallback/store';
export { transformText, transcribeImage } from './transform';
export type { TransformKind, TransformOpts } from './transform';
export { previewAnswer } from './parse';
