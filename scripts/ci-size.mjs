// Fails if the entry JS chunk is too big. Limits in kB (raw). Usage: node scripts/ci-size.mjs
import { readdirSync, statSync } from 'node:fs';
const LIMIT_ENTRY_KB = 400; // entry (index-*.js); target was <= 600
const dir = 'dist/assets';
const entries = readdirSync(dir).filter((f) => /^index-.*\.js$/.test(f));
let bad = false;
for (const f of entries) {
  const kb = statSync(`${dir}/${f}`).size / 1024;
  const ok = kb <= LIMIT_ENTRY_KB;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${f} ${kb.toFixed(1)} kB (limit ${LIMIT_ENTRY_KB})`);
  if (!ok) { console.log(`::error title=Bundle too big::${f} is ${kb.toFixed(0)} kB, limit ${LIMIT_ENTRY_KB} kB`); bad = true; }
}
if (!entries.length) { console.log('::error::no entry chunk found'); bad = true; }
process.exit(bad ? 1 : 0);
