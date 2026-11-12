// npm run shots [-- /library /learn]   Builds a demo build, seeds demo data, screenshots every route and runs layout + a11y checks.
// Needs only the dev dependencies (puppeteer-core + @sparticuz/chromium ship their own Chromium). See docs/screenshots/README.md.
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { auditFn } from './shots-audit.mjs';
import { EXTRA_DEVICES, ONBOARDED_KEY, SHOT_DEVICES, THEMES, routesFor } from './shots-config.mjs';
import { writeA11y, writeLayout } from './shots-report.mjs';

const PORT = 4173, BASE = `http://localhost:${PORT}/`;
const OUT = 'docs/screenshots', TMP = 'shots-out', MAX_KB = 150;
const only = process.argv.slice(2).map((a) => a.replace(/^\/+/, '').replace(/^#\/?/, ''));
const full = only.length === 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const axePath = createRequire(import.meta.url).resolve('axe-core/axe.min.js');

if (!process.env.SHOTS_SKIP_BUILD) {
  console.log('Building demo build (VITE_DEMO=1) ...');
  const b = spawnSync('npx', ['vite', 'build', '--outDir', 'dist-shots', '--emptyOutDir'], { env: { ...process.env, VITE_DEMO: '1' }, stdio: 'inherit' });
  if (b.status !== 0) { console.error('Build failed.'); process.exit(1); }
}
const server = spawn('npx', ['vite', 'preview', '--outDir', 'dist-shots', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
for (let i = 0; ; i++) { try { if ((await fetch(BASE)).ok) break; } catch { /* not up yet */ } if (i > 60) { server.kill(); console.error('Preview server did not start.'); process.exit(1); } await sleep(500); }

const browser = await puppeteer.launch({ args: chromium.args.filter((a) => a !== '--single-process'), executablePath: await chromium.executablePath(), headless: 'shell' });
const matches = (name, hash) => !only.length || only.some((o) => name === o || name.startsWith(o + '-') || hash.replace(/^#\/?/, '').split(/[/?]/)[0] === o);

async function newPage(dev, theme, { onboarded = true, seed = true } = {}) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: dev.w, height: dev.h, deviceScaleFactor: dev.dpr, isMobile: dev.mobile, hasTouch: dev.mobile });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(String(e).slice(0, 160)));
  page.on('console', (m) => { if (m.type() === 'error') page.errors.push(m.text().slice(0, 160)); });
  await page.goto(BASE, { waitUntil: 'networkidle2' });
  let ids = null;
  if (seed) {
    await page.waitForFunction(() => window.__solverDemo, { timeout: 15000 });
    ids = await page.evaluate(() => window.__solverDemo.seedDemoData());
  }
  if (onboarded) await page.evaluate((k) => { try { localStorage.setItem(k, '1'); } catch { /* ignore */ } }, ONBOARDED_KEY);
  return { page, ctx, ids };
}

async function jpeg(page, file) {
  const height = await page.evaluate(() => Math.max(document.documentElement.scrollHeight, window.innerHeight));
  const clip = { x: 0, y: 0, width: page.viewport().width, height: Math.min(height, 3000) };
  for (let q = 70; ; q -= 10) {
    const buf = await page.screenshot({ type: 'jpeg', quality: q, clip, captureBeyondViewport: true });
    if (buf.length <= MAX_KB * 1024 || q <= 40) {
      fs.writeFileSync(file, buf);
      if (buf.length > MAX_KB * 1024) console.warn(`  ! ${path.basename(file)} is ${(buf.length / 1024) | 0} KB (> ${MAX_KB})`);
      return;
    }
  }
}

const isMissing = (text) => /page not found|this screen is being built/i.test(text);
const layout = {}, a11y = {}, errors = {}, skipped = new Map(), shots = [];
const outDir = full ? OUT : TMP;
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (/\.jpg$/.test(f) && (full || only.some((o) => f.startsWith(o + '__') || f.startsWith(o + '-')))) fs.rmSync(path.join(OUT, f));

for (const dev of [...SHOT_DEVICES, ...EXTRA_DEVICES]) {
  const isShot = SHOT_DEVICES.includes(dev);
  for (const theme of isShot ? THEMES : ['light']) {
    const { page, ctx, ids } = await newPage(dev, theme);
    for (const [name, hash, action] of routesFor(ids)) {
      if (!matches(name, hash) || action === 'fresh') continue;
      if (skipped.has(name)) continue;
      await page.goto(BASE + hash, { waitUntil: 'networkidle2' });
      await page.reload({ waitUntil: 'networkidle2' });
      await sleep(500);
      if (action === 'select') {
        const ok = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Select'); b?.click(); return !!b; });
        if (!ok) { skipped.set(name, 'no Select button'); continue; }
        await sleep(300);
      }
      if (isMissing(await page.evaluate(() => document.body.innerText))) { skipped.set(name, 'route not built yet'); continue; }
      const key = `${name}__${dev.name}__${theme}`;
      if (isShot) {
        await jpeg(page, path.join(outDir, `${key}.jpg`)); shots.push(key);
        try {
          await page.addScriptTag({ path: axePath });
          a11y[`${name}|${dev.name}|${theme}`] = (await page.evaluate(() => window.axe.run({ resultTypes: ['violations'] }))).violations;
        } catch (e) { console.warn(`  ! axe failed on ${key}: ${String(e).slice(0, 80)}`); }
      }
      layout[`${dev.name}|${theme}|${name}`] = await page.evaluate(auditFn);
    }
    errors[`${dev.name}/${theme}`] = page.errors;
    await ctx.close();
    console.log(`${dev.name} ${theme} done`);
  }
}

// Onboarding: a first-run profile (no onboarded flag, no data).
if (routesFor({ all: [] }).some(([n]) => n === 'onboarding' && matches(n, '#/onboarding'))) {
  for (const dev of SHOT_DEVICES) for (const theme of THEMES) {
    const { page, ctx } = await newPage(dev, theme, { onboarded: false, seed: false });
    await sleep(600);
    const text = await page.evaluate(() => document.body.innerText);
    if (/welcome|get started|let.s begin|onboard/i.test(text) && !isMissing(text)) await jpeg(page, path.join(outDir, `onboarding__${dev.name}__${theme}.jpg`));
    else skipped.set('onboarding', 'no first-run screen yet');
    await ctx.close();
  }
}

await browser.close(); server.kill();
writeLayout(path.join(outDir, 'layout.md'), layout, errors);
writeA11y(path.join(outDir, 'a11y.md'), a11y);
for (const [n, why] of skipped) console.log(`skipped ${n}: ${why}`);
console.log(`\n${shots.length} screenshots, ${Object.keys(a11y).length} a11y scans -> ${outDir}/${full ? '' : ' (partial run: reports not committed)'}`);
