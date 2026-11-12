// Below this (0-100) we show the gentle "Check the text" warning.
export const LOW_CONFIDENCE = 70;
export const isLowConfidence = (c: number) => c < LOW_CONFIDENCE;
// Below this the photo is probably sideways or upside down: suggest rotating.
export const VERY_LOW_CONFIDENCE = 40;
export const suggestsRotate = (c: number) => c < VERY_LOW_CONFIDENCE;
