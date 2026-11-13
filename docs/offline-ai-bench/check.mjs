/* global console */
// node docs/offline-ai-bench/check.mjs : tests the grader and the question list (no model needed).
import assert from 'node:assert/strict';
import { extractNumber, isCorrect } from './grade.mjs';
import { QUESTIONS } from './questions.mjs';
assert.equal(QUESTIONS.length, 30);
assert.ok(QUESTIONS.every(x => typeof x.q === 'string' && Number.isFinite(x.a)));
assert.equal(extractNumber('Steps...\nANSWER: 6'), 6);
assert.equal(extractNumber('x = 6, so the price is 1,000 rupees.'), 1000);
assert.equal(extractNumber('ANSWER: 1/2'), 0.5);
assert.equal(extractNumber('ANSWER: x = -3'), -3);
assert.equal(extractNumber('no digits here'), null);
assert.ok(isCorrect('ANSWER: 0.5', 0.5));
assert.ok(isCorrect('ANSWER: 154.0', 154));
assert.ok(!isCorrect('ANSWER: 7', 6));
assert.ok(!isCorrect('I cannot help', 6));
// every expected value is graded correct against its own "ANSWER:" line
for (const x of QUESTIONS) assert.ok(isCorrect(`ANSWER: ${x.a}`, x.a), x.q);
console.log('grader and questions ok');
