/** Read the model's final answer: the "ANSWER:" line if present, else the last number in the reply. */
export function extractNumber(reply) {
  const m = [...reply.matchAll(/ANSWER\s*[:=]\s*([^\n]+)/gi)].pop();
  const part = m ? m[1] : reply;
  const clean = part.replace(/,(?=\d{3}\b)/g, '').replace(/\u2212/g, '-');
  const frac = [...clean.matchAll(/(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/g)].pop();
  const nums = [...clean.matchAll(/-?\d+(?:\.\d+)?/g)];
  if (m) { // an explicit ANSWER line: a fraction there means that fraction
    if (frac && nums.length <= 2) return Number(frac[1]) / Number(frac[2]);
    return nums.length ? Number(nums[0][0]) : null;
  }
  return nums.length ? Number(nums[nums.length - 1][0]) : null;
}

export function isCorrect(reply, expected) {
  const got = extractNumber(reply);
  if (got === null || !Number.isFinite(got)) return false;
  return Math.abs(got - expected) <= Math.max(0.01, Math.abs(expected) * 0.005);
}
