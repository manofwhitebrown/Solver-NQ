// Real-API smoke test for the model chain. Needs Node 22.
//   GEMINI_API_KEY=... node scripts/gemini-smoke.mjs
// Optional: GEMINI_MODELS=a,b,c (test these instead of the default chain)
//           SMOKE_MAX_TOKENS=256 (output cap for the tiny calls)
// Prints model, HTTP status, finishReason, latency, characters, token counts and how the
// app's classify() treats any error. The key is read from the environment only and is
// never printed (it is also scrubbed from any text this script shows).
import { deflateSync } from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const KEY = (process.env.GEMINI_API_KEY ?? '').trim();
if (!KEY) {
  console.error('Set GEMINI_API_KEY first, e.g.  GEMINI_API_KEY=your-key node scripts/gemini-smoke.mjs');
  process.exit(2);
}

// Reuse the app's own code (TypeScript). Node 22.18+ runs .ts directly; older 22.x needs a flag.
const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'lib', 'ai', 'fallback');
let classify, defaultPick, SUGGESTED_MODELS;
try {
  ({ classify } = await import(pathToFileURL(join(root, 'classify.ts')).href));
  ({ defaultPick, SUGGESTED_MODELS } = await import(pathToFileURL(join(root, 'rank.ts')).href));
} catch (e) {
  if (!process.execArgv.includes('--experimental-strip-types')) {
    const r = spawnSync(process.execPath, ['--experimental-strip-types', '--no-warnings', ...process.argv.slice(1)], { stdio: 'inherit', env: process.env });
    process.exit(r.status ?? 1);
  }
  console.error('Could not load the app code:', scrub(String(e?.message ?? e)));
  process.exit(2);
}

const BASE = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta'; // override only for local tests
const MAX_TOKENS = Number(process.env.SMOKE_MAX_TOKENS) || 256;

function scrub(s) { return String(s).split(KEY).join('[key]'); }
const short = (s, n = 160) => scrub(s).replace(/\s+/g, ' ').slice(0, n);

/** 64x64 solid red PNG, built here so the script needs no files or packages. */
function redPng() {
  const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const w = 64, h = 64;
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const row = Buffer.concat([Buffer.from([0]), Buffer.from(Array.from({ length: w }, () => [255, 0, 0]).flat())]);
  const raw = Buffer.concat(Array.from({ length: h }, () => row));
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]).toString('base64');
}

async function listModels() {
  const out = [];
  let page = '';
  for (let i = 0; i < 5; i++) {
    const res = await fetch(`${BASE}/models?pageSize=200${page ? `&pageToken=${encodeURIComponent(page)}` : ''}`, { headers: { 'x-goog-api-key': KEY } });
    const body = await res.text();
    if (!res.ok) return { status: res.status, body, models: out };
    const json = JSON.parse(body);
    out.push(...(json.models ?? []));
    if (!json.nextPageToken) break;
    page = json.nextPageToken;
  }
  return { status: 200, models: out };
}

/** Same rules as geminiCall() in src/lib/ai/fallback/slotCall.ts, plus measurements. */
async function tiny(model, kind) {
  const parts = kind === 'image'
    ? [{ text: 'Reply with one word: the main colour of this image.' }, { inlineData: { mimeType: 'image/png', data: redPng() } }]
    : [{ text: 'Reply with exactly: OK' }];
  const t0 = Date.now();
  let status = 0, bodyText = '';
  try {
    const res = await fetch(`${BASE}/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: 'You are a test. Be brief.' }] },
        contents: [{ role: 'user', parts }],
        generationConfig: { maxOutputTokens: MAX_TOKENS },
      }),
      signal: AbortSignal.timeout(60_000),
    });
    status = res.status;
    bodyText = await res.text();
  } catch (e) {
    return { model, kind, status: 0, ms: Date.now() - t0, verdict: 'transient (network/timeout, the app retries once)', note: short(e?.message ?? e) };
  }
  const ms = Date.now() - t0;
  if (status < 200 || status >= 300) {
    const f = classify(status, bodyText);
    return { model, kind, status, ms, verdict: `classify -> ${JSON.stringify(f)}`, note: short(bodyText) };
  }
  let json;
  try { json = JSON.parse(bodyText); } catch { return { model, kind, status, ms, verdict: 'reply was not JSON', note: short(bodyText) }; }
  const cand = json.candidates?.[0];
  const text = (cand?.content?.parts ?? []).map((p) => p.text ?? '').join('');
  const reason = cand?.finishReason;
  const u = json.usageMetadata ?? {};
  let verdict = 'accepted by the app';
  if (!text && (json.promptFeedback?.blockReason || reason === 'SAFETY')) verdict = "safety -> shown to the user, not retried";
  else if (!text.trim()) verdict = 'EMPTY -> app treats as "incomplete" (retry once, then brief rest)';
  else if (reason && reason !== 'STOP') verdict = `finishReason ${reason} -> app treats as "incomplete" (retry once, then brief rest)`;
  return {
    model, kind, status, ms, finishReason: reason ?? '(none)', chars: text.length,
    tokens: `prompt ${u.promptTokenCount ?? '?'} / out ${u.candidatesTokenCount ?? '?'} / thinking ${u.thoughtsTokenCount ?? 0}`,
    verdict, note: short(text, 60),
  };
}

const pad = (s, n) => String(s).padEnd(n);
function show(r) {
  console.log(`  ${pad(r.kind, 5)} HTTP ${pad(r.status, 3)} ${pad(`${r.ms} ms`, 9)} finish=${pad(r.finishReason ?? '-', 10)} chars=${pad(r.chars ?? '-', 4)} tokens: ${r.tokens ?? '-'}`);
  console.log(`        -> ${r.verdict}`);
  if (r.note) console.log(`        text/body: "${r.note}"`);
}

console.log(`Gemini smoke test  (Node ${process.version}, output cap ${MAX_TOKENS} tokens)`);
console.log('');
console.log('1) ListModels');
let lm;
try { lm = await listModels(); } catch (e) {
  console.log(`  Network error: ${short(e?.cause?.code ?? e?.message ?? e)}. Check your internet connection and try again.`);
  process.exit(1);
}
if (lm.status !== 200) {
  const f = classify(lm.status, lm.body ?? '');
  console.log(`  HTTP ${lm.status}  classify -> ${JSON.stringify(f)}`);
  console.log(`  body: ${short(lm.body ?? '')}`);
  console.log('Stopping: the key cannot list models.');
  process.exit(1);
}
const gen = lm.models.filter((m) => m.supportedGenerationMethods?.includes('generateContent')).map((m) => m.name.replace(/^models\//, ''));
console.log(`  HTTP 200, ${lm.models.length} models, ${gen.length} support generateContent`);
console.log('  ' + gen.join(', '));

const picked = defaultPick(gen);
console.log('');
console.log(`  App default chain from this list (defaultPick): ${picked.join(', ') || '(none)'}`);
console.log('  Suggested names in the app: ' + SUGGESTED_MODELS.map((m) => `${m} [${gen.includes(m) ? 'listed' : 'NOT LISTED'}]`).join(', '));

const slots = process.env.GEMINI_MODELS ? process.env.GEMINI_MODELS.split(',').map((s) => s.trim()).filter(Boolean) : picked;
console.log('');
console.log(`2) Tiny text + image call per chain slot (${slots.length} models)`);
const results = [];
for (const m of slots) {
  console.log(`- ${m}`);
  for (const kind of ['text', 'image']) {
    const r = await tiny(m, kind);
    results.push(r);
    show(r);
  }
}

console.log('');
console.log('3) Probe: a model name that does not exist (shows how a 404 is classified)');
show(await tiny('gemini-does-not-exist', 'text'));

console.log('');
const bad = results.filter((r) => r.status !== 200 || r.finishReason !== 'STOP');
console.log(bad.length ? `Done. ${bad.length} of ${results.length} calls were not a clean STOP: please paste everything above.` : `Done. All ${results.length} calls finished with STOP.`);
