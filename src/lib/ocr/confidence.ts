// Below this (0-100) we show the gentle "Check the text" warning.
export const LOW_CONFIDENCE = 70;
export const isLowConfidence = (c: number) => c < LOW_CONFIDENCE;
