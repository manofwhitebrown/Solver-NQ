// Layout audit: seeds demo data, screenshots every route on 6 screen sizes x light/dark, and checks
// horizontal overflow, tap targets < 44px, text < 12px and content hidden under the tab bar.
// Works in sandboxes WITHOUT a browser: the Chromium binary comes from the npm package below.
//   npm i -D puppeteer-core @sparticuz/chromium
//   npm run build && (npx vite preview --port 4173 &) && sleep 3
//   OUT=docs/screenshots/audit node docs/audit/tools/layout-audit.mjs
// Output: PNG per screen + report.json + a printed summary. Takes ~5 minutes for everything;
// edit DEVICES / THEMES / ROUTES below to run a smaller set. Route '#/answer/aq1' etc. use the seeded demo ids.
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:4173/';
const OUT = process.env.OUT || './layout-audit-out';
fs.mkdirSync(OUT, { recursive: true });

const DEVICES = [
  { name: 'se1-320x568', w: 320, h: 568, dpr: 2 },     // smallest still in use
  { name: 'android-360x640', w: 360, h: 640, dpr: 2 }, // very common budget Android
  { name: 'iphone8-375x667', w: 375, h: 667, dpr: 2 },
  { name: 'pixel-412x915', w: 412, h: 915, dpr: 2 },
  { name: 'promax-430x932', w: 430, h: 932, dpr: 2 },
  { name: 'laptop-1280x800', w: 1280, h: 800, dpr: 1, desktop: true },
];
const THEMES = ['light', 'dark'];

const now = Date.now();
const day = 86400000;
const Q = [
  ['q1', 'math', 'Solve the quadratic equation x^2 - 5x + 6 = 0 and explain every step.', ['algebra'], true, 'learn',
    '$x = 2$ or $x = 3$',
    [['Factor', 'Look for two numbers that multiply to $6$ and add to $-5$: they are $-2$ and $-3$.\n\n$$x^2 - 5x + 6 = (x-2)(x-3)$$'],
     ['Set each factor to zero', '$$x-2=0 \\Rightarrow x=2 \\qquad x-3=0 \\Rightarrow x=3$$'],
     ['Check', 'Substitute back: $2^2-5(2)+6=0$ and $3^2-5(3)+6=0$.']], 'match'],
  ['q2', 'physics', 'A car accelerates from rest at 3 m/s^2 for 8 s. How far does it travel and what is its final speed?', ['kinematics'], false, 'answer',
    '$s = 96\\ \\text{m}$, $v = 24\\ \\text{m/s}$',
    [['Known values', '$u=0$, $a=3\\ \\text{m/s}^2$, $t=8\\ \\text{s}$.'],
     ['Distance', '$$s = ut + \\tfrac{1}{2}at^2 = 0 + \\tfrac{1}{2}(3)(8)^2 = 96\\ \\text{m}$$'],
     ['Final speed', '$$v = u + at = 0 + 3\\times 8 = 24\\ \\text{m/s}$$']], 'match'],
  ['q3', 'math', 'Evaluate the definite integral of sin(x) cos(x) from 0 to pi/2, and also give the general expansion of (a+b)^10 with a very long expression.', ['calculus', 'long'], false, 'answer',
    '$\\tfrac{1}{2}$',
    [['Substitution', '$$\\int_0^{\\pi/2} \\sin x\\cos x\\,dx = \\left[\\tfrac{1}{2}\\sin^2 x\\right]_0^{\\pi/2} = \\tfrac{1}{2}$$'],
     ['A very wide expression', '$$(a+b)^{10} = a^{10} + 10a^9b + 45a^8b^2 + 120a^7b^3 + 210a^6b^4 + 252a^5b^5 + 210a^4b^6 + 120a^3b^7 + 45a^2b^8 + 10ab^9 + b^{10}$$']], 'unchecked'],
  ['q4', 'chemistry', 'Balance the equation: C3H8 + O2 -> CO2 + H2O', ['balancing'], false, 'answer',
    '$\\text{C}_3\\text{H}_8 + 5\\text{O}_2 \\to 3\\text{CO}_2 + 4\\text{H}_2\\text{O}$',
    [['Balance carbon', 'Three carbons on the left means $3\\,\\text{CO}_2$.'], ['Balance hydrogen', 'Eight hydrogens means $4\\,\\text{H}_2\\text{O}$.'], ['Balance oxygen', 'Total oxygen on the right is $6+4=10$, so $5\\,\\text{O}_2$.']], 'unchecked'],
  ['q5', 'coding', 'Write a Python function that returns the n-th Fibonacci number efficiently.', ['python'], true, 'answer',
    'Use iteration (O(n) time, O(1) space).',
    [['Idea', 'Keep only the last two values instead of recursing.'],
     ['Code', '```python\ndef fib(n: int) -> int:\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\n\nprint([fib(i) for i in range(15)])  # a deliberately long line to test horizontal scrolling inside code blocks\n```']], 'unchecked'],
  ['q6', 'history', 'Why did the Industrial Revolution begin in Britain rather than elsewhere in Europe in the eighteenth century?', ['modern-history'], false, 'learn',
    'A mix of coal, capital, colonial markets, institutions and technology.',
    [['Resources', 'Accessible **coal** and iron ore near each other and near ports.'], ['Institutions', 'Secure property rights, patents and a stable banking system encouraged investment.'], ['Markets', 'Colonies supplied raw cotton and bought finished textiles.']], 'unchecked'],
  ['q7', 'biology', 'Supercalifragilisticexpialidocious_antidisestablishmentarianism_pneumonoultramicroscopicsilicovolcanoconiosis is a very long unbroken word; what is mitosis?', ['cells', 'long-word'], false, 'answer',
    'Mitosis is division of one cell into two identical daughter cells.',
    [['Phases', 'Prophase, metaphase, anaphase, telophase.']], 'unchecked'],
];
const questions = Q.map((q, i) => ({ id: q[0], text: q[2], subject: q[1], tags: q[3], starred: q[4], createdAt: now - i * day }));
const answers = Q.map((q, i) => ({
  id: 'a' + q[0], questionId: q[0], mode: q[5], finalAnswer: q[6],
  steps: q[7].map((s, j) => ({ id: `${q[0]}s${j}`, title: s[0], body: s[1] })),
  verified: q[8], model: 'gemini-flash', createdAt: now - i * day,
}));
const cards = [];
for (let i = 0; i < 14; i++) {
  const q = Q[i % Q.length];
  cards.push({ id: 'c' + i, front: `What is the key idea in "${q[2].slice(0, 40)}"?`, back: q[6], subject: q[1], sourceAnswerId: 'a' + q[0],
    due: i < 9 ? now - day : now + (i - 8) * day, interval: i, ease: 2.5, reps: i % 4, lapses: i % 3 });
}

async function seed(page) {
  await page.evaluate(async (data) => {
    const open = () => new Promise((res, rej) => { const r = indexedDB.open('solver-nq'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    const db = await open();
    await new Promise((res, rej) => {
      const tx = db.transaction(['questions', 'answers', 'flashcards'], 'readwrite');
      data.questions.forEach((x) => tx.objectStore('questions').put(x));
      data.answers.forEach((x) => tx.objectStore('answers').put(x));
      data.cards.forEach((x) => tx.objectStore('flashcards').put(x));
      tx.oncomplete = res; tx.onerror = () => rej(tx.error);
    });
    db.close();
    try { localStorage.setItem('solver-nq:onboarded', '1'); } catch {}
  }, { questions, answers, cards });
}

const ROUTES = [
  ['ask', '#/'], ['scan', '#/scan'], ['library', '#/library'],
  ['answer-learn', '#/answer/aq1'], ['answer-wide-math', '#/answer/aq3'], ['answer-code', '#/answer/aq5'], ['answer-longword', '#/answer/aq7'],
  ['learn', '#/learn'], ['review', '#/learn/review'], ['quiz', '#/learn/quiz'], ['stats', '#/learn/stats'], ['cards', '#/learn/cards'],
  ['export', '#/export?ids=aq1,aq2'], ['settings', '#/settings'], ['graph', '#/graph'], ['backup', '#/backup'],
];

function auditFn() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const out = { hscroll: document.documentElement.scrollWidth - vw, overflow: [], small: [], tiny: [], overlap: [], bar: null };
  const inScrollX = (el) => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden') return true; } return false; };
  const label = (el) => (el.getAttribute('aria-label') || el.textContent || el.placeholder || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 28);
  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if ((r.right > vw + 1 || r.left < -1) && !inScrollX(el)) { const k = 'o' + el.tagName + label(el); if (!seen.has(k)) { seen.add(k); out.overflow.push(`${el.tagName.toLowerCase()} "${label(el)}" right=${Math.round(r.right)} (vw ${vw})`); } }
    if (el.matches('button,a[href],[role=button],[role=tab],input:not([type=hidden]),select,textarea,summary') && r.height > 0) {
      if ((r.width < 44 || r.height < 44) && !el.closest('.sr-only') && cs.position !== 'absolute') { const k = 's' + label(el) + Math.round(r.width) + Math.round(r.height); if (!seen.has(k)) { seen.add(k); out.small.push(`${el.tagName.toLowerCase()} "${label(el)}" ${Math.round(r.width)}x${Math.round(r.height)}`); } }
    }
    const direct = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (direct && parseFloat(cs.fontSize) < 12) { const k = 't' + label(el); if (!seen.has(k)) { seen.add(k); out.tiny.push(`"${label(el)}" ${cs.fontSize}`); } }
  }
  // fixed bottom bar and content hidden behind it after scrolling to the end
  let bar = null;
  for (const el of document.querySelectorAll('nav,div,footer')) { const cs = getComputedStyle(el); if (cs.position === 'fixed') { const r = el.getBoundingClientRect(); if (r.bottom >= vh - 2 && r.height > 40 && r.width >= vw * 0.9) { bar = { el, r }; break; } } }
  if (bar) {
    out.bar = Math.round(bar.r.height);
    const scrollers = [document.scrollingElement, ...[...document.querySelectorAll('*')].filter((e) => { const o = getComputedStyle(e).overflowY; return (o === 'auto' || o === 'scroll') && e.scrollHeight > e.clientHeight + 2; })];
    scrollers.forEach((s) => { s.scrollTop = s.scrollHeight; });
    const top = bar.el.getBoundingClientRect().top;
    for (const el of document.querySelectorAll('button,a[href],input,textarea,select,p,h1,h2,h3,li,label')) {
      if (bar.el.contains(el)) continue;
      const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
      if (cs.display === 'none' || r.height === 0) continue;
      if (r.bottom > top + 2 && r.top < top + bar.r.height - 2 && r.top < vh && cs.position !== 'fixed') out.overlap.push(`${el.tagName.toLowerCase()} "${label(el)}" is under the tab bar`);
    }
    out.overlap = [...new Set(out.overlap)].slice(0, 5);
    scrollers.forEach((s) => { s.scrollTop = 0; });
  }
  out.overflow = out.overflow.slice(0, 6); out.small = out.small.slice(0, 10); out.tiny = out.tiny.slice(0, 6);
  return out;
}

const browser = await puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: 'shell' });
const report = {};
for (const dev of DEVICES) {
  for (const theme of THEMES) {
    const page = await browser.newPage();
    await page.setViewport({ width: dev.w, height: dev.h, deviceScaleFactor: dev.dpr, isMobile: !dev.desktop, hasTouch: !dev.desktop });
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
    await page.goto(BASE, { waitUntil: 'networkidle2' });
    await seed(page);
    for (const [name, hash] of ROUTES) {
      await page.goto(BASE + hash, { waitUntil: 'networkidle2' });
      await page.reload({ waitUntil: 'networkidle2' });
      await new Promise((r) => setTimeout(r, 500));
      const a = await page.evaluate(auditFn);
      await page.screenshot({ path: `${OUT}/${dev.name}__${theme}__${name}.png` });
      report[`${dev.name}|${theme}|${name}`] = a;
    }
    report[`${dev.name}|${theme}|ERRORS`] = [...new Set(errors)].slice(0, 5);
    await page.close();
  }
}
await browser.close();
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
console.log('done', Object.keys(report).length);

// ---- printed summary (unique issues per route) ----
const by = {};
for (const [k, v] of Object.entries(report)) {
  if (k.endsWith('|ERRORS')) { if (v.length) console.log('CONSOLE ERRORS', k, v); continue; }
  const route = k.split('|')[2];
  const add = (t, x) => ((by[route] ||= {})[t] ||= new Set()).add(x);
  if (v.hscroll > 0) add('PAGE SCROLLS SIDEWAYS', v.hscroll + 'px');
  v.overflow.forEach((x) => add('OVERFLOW', x)); v.overlap.forEach((x) => add('UNDER TAB BAR', x));
  v.small.forEach((x) => add('SMALL TAP TARGET', x)); v.tiny.forEach((x) => add('TEXT < 12px', x));
}
for (const [route, types] of Object.entries(by)) {
  console.log('\n## ' + route);
  for (const [t, set] of Object.entries(types)) console.log('  ' + t + ': ' + [...set].slice(0, 4).join(' | '));
}
