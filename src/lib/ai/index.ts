// AI engine public API (AI-2). Signatures match the shared contract.
export { askQuestion, IMAGE_ONLY_TEXT } from './ask';
export { flushPending, startQueueFlush } from './pending';
export { followUp, generateCards, generateQuiz, similarProblem } from './extras';
export { AiError } from './errors';
