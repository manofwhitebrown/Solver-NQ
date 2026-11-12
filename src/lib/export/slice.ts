/**
 * Picks the row at which to cut a tall raster so no line of text/math is sliced through.
 * Searches upward from `limit` for a blank row (the gap between lines); falls back to `limit`.
 * `isBlank(y)` says whether pixel row y is entirely background.
 */
export function findCutRow(isBlank: (y: number) => boolean, start: number, limit: number, minRun = 3): number {
  const floor = start + Math.floor((limit - start) * 0.5); // never give up more than half a page
  for (let y = limit; y > floor; y--) {
    let ok = true;
    for (let k = 0; k < minRun && ok; k++) ok = isBlank(y - k);
    if (ok) return y - Math.floor(minRun / 2);
  }
  return limit;
}

/** Row ranges [from, to) that split `total` rows into pages of at most `pageRows`. */
export function planSlices(total: number, pageRows: number, isBlank: (y: number) => boolean): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  let from = 0;
  while (total - from > pageRows) {
    const to = findCutRow(isBlank, from, from + pageRows);
    out.push([from, to]);
    from = to;
  }
  out.push([from, total]);
  return out;
}
