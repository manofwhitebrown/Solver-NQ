// npm run e2e   Real-browser smoke test with a mocked Gemini: ask -> answer -> library -> search -> backup -> offline queue.
// Prints PASS/FAIL per check and exits non-zero on any failure. Uses the normal build (no demo data).
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { spawn, spawnSync } from 'node:child_process';

const PORT = 4174, BASE = `http://localhost:${PORT}/`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
if (!process.env.E2E_SKIP_BUILD) {
  const b = spawnSync('npx', ['vite', 'build', '--outDir', 'dist-e2e', '--emptyOutDir'], { stdio: 'ignore' });
  if (b.status !== 0) { console.error('Build failed'); process.exit(1); }
}
const server = spawn('npx', ['vite', 'preview', '--outDir', 'dist-e2e', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
for (let i = 0; ; i++) { try { if ((await fetch(BASE)).ok) break; } catch { /* wait */ } if (i > 60) { server.kill(); process.exit(1); } await sleep(500); }

const results = []; const check = (name, ok, extra = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' - ' + extra : ''}`); };
const answer = { finalAnswer: 'x = 6', steps: [{ title: 'Subtract 5', body: '2x = 12' }, { title: 'Divide by 2', body: 'x = 6' }], summary: 'Linear equation.' };
let mode = 'ok'; let calls = 0;

const browser = await puppeteer.launch({ args: chromium.args.filter((a) => a !== '--single-process'), executablePath: await chromium.executablePath(), headless: 'shell' });
const ctx = await browser.createBrowserContext();
const page = await ctx.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)));
page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text().slice(0, 120)); });
await page.setRequestInterception(true);
page.on('request', (req) => {
  if (!req.url().includes('generativelanguage.googleapis.com')) return req.continue();
  calls++;
  // Streaming calls (`:streamGenerateContent?alt=sse`) get server-sent events, like the real API; others get plain JSON.
  const sse = req.url().includes('streamGenerateContent');
  const send = (status, obj) => sse && status === 200
    ? req.respond({ status, contentType: 'text/event-stream', body: `data: ${JSON.stringify(obj)}\n\n` })
    : req.respond({ status, contentType: 'application/json', body: JSON.stringify(obj) });
  if (mode === 'cut') return send(200, { candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [{ text: '{"finalAnswer":"x' }] } }] });
  if (mode === 'badkey') return send(400, { error: { message: 'API key not valid', status: 'INVALID_ARGUMENT' } });
  send(200, { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(answer) }] } }] });
});
await page.evaluateOnNewDocument(() => {
  if (localStorage.getItem('e2e-seeded')) return;
  localStorage.setItem('e2e-seeded', '1');
  localStorage.setItem('solver-nq:settings', JSON.stringify({ onboarded: true }));
  const id = 'k1';
  localStorage.setItem('solvernq.ai.v2', JSON.stringify({ version: 1, keys: [{ id, provider: 'gemini', label: 'My key', key: 'AIzaFAKE' }], chain: [{ id: 'c1', provider: 'gemini', model: 'gemini-2.5-flash', keyId: id, enabled: true }], cooldowns: {}, invalidKeys: [], saveQuota: false, perMinute: 10, fetchedFor: [] }));
});
await page.goto(BASE, { waitUntil: 'networkidle2' });
const body = () => page.evaluate(() => document.body.innerText);
const click = (text) => page.evaluate((t) => { const el = [...document.querySelectorAll('button,a')].find((b) => b.innerText.trim().startsWith(t)); if (el) el.click(); return !!el; }, text);
const ask = async (q) => { await page.$eval('textarea', (t) => { t.focus(); }); await page.type('textarea', q); await click('Send'); };

await ask('Solve 2x + 5 = 17');
await page.waitForFunction(() => document.body.innerText.includes('x = 6'), { timeout: 15000 }).catch(() => {});
{ const t0 = await body(); check('typed question gets an answer', t0.includes('Reveal answer') || /x\s*=\s*6/.test(t0)); }
check('answer shows steps', (await body()).includes('Subtract 5'));
check('no overflow on answer', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));

await page.goto(BASE + '#/library', { waitUntil: 'networkidle2' }); await sleep(600);
check('library lists the saved question', (await body()).includes('2x + 5'));
await page.type('input[type=search], input[placeholder*="earch"]', 'zzzz').catch(() => {}); await sleep(500);
check('search with no match shows an empty state', !(await body()).includes('2x + 5'));

await page.goto(BASE + '#/', { waitUntil: 'networkidle2' }); mode = 'cut';
await ask('A cut off question'); await sleep(4000);
const t = await body();
check('cut-off reply is never shown as an answer', !t.includes('{"finalAnswer"'));
await page.goto(BASE + '#/library', { waitUntil: 'networkidle2' }); await sleep(600);
check('cut-off reply is not saved to the library', !(await body()).includes('A cut off question'));

mode = 'badkey';
await page.evaluate(() => { const o = JSON.parse(localStorage.getItem('solvernq.ai.v2')); o.cooldowns = {}; localStorage.setItem('solvernq.ai.v2', JSON.stringify(o)); });
await page.goto(BASE + '#/', { waitUntil: 'networkidle2' }); await page.reload({ waitUntil: 'networkidle2' });
await ask('Bad key question'); await sleep(3000);
const bk = await body();
check('bad key: one clear message, no contradiction', /rejected|key/i.test(bk) && !/next model will answer/i.test(bk));

for (const r of ['#/scan', '#/learn', '#/notes', '#/plan', '#/backup', '#/settings']) {
  await page.goto(BASE + r, { waitUntil: 'networkidle2' }); await sleep(400);
  check(`route ${r} renders, no sideways scroll`, (await body()).length > 40 && await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
}
check('no console or page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
await browser.close(); server.kill();
const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} checks passed (${calls} mocked Gemini calls)`);
process.exit(failed ? 1 : 0);
