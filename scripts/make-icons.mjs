// node scripts/make-icons.mjs   Redraws every app icon from ONE mark (a check stroke on the teal tile, same shape as src/app/Logo.tsx).
// Writes: public/favicon.ico, public/apple-touch-icon.png, public/icons/{pwa-192,pwa-512,maskable-512}.png,
//         android launcher PNGs (legacy square + round) and splash screens (light + night) under android/app/src/main/res.
// public/favicon.svg and the Android vector layers are hand-written (see docs/ICONS.md) and use the same numbers as below.
// No new dependency: renders with the Chromium that `npm run shots` already uses.
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const LIGHT = { a: '#0D7068', b: '#156280', ink: '#FFFFFF', bg: '#F1F6F6' };
const DARK = { a: '#5ECFC2', b: '#7DBEEE', ink: '#041E1C', bg: '#070F11' };
const CHECK = 'M8.5 16.5l5.2 5.2L23.5 10.5'; // 32x32 box, stroke 4, round caps; bounding box is centred on (16, 16.1)
const RES = 'android/app/src/main/res';
let n = 0;

/** One tile. shape: 'round' (rounded square, transparent corners), 'bleed' (full square), 'circle'. */
function tile({ t = LIGHT, shape = 'round', scale = 1, rx = 8 }) {
  const id = `g${n++}`;
  const base = shape === 'circle' ? '<circle cx="16" cy="16" r="16"' : `<rect width="32" height="32" rx="${shape === 'bleed' ? 0 : rx}"`;
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.a}"/><stop offset="1" stop-color="${t.b}"/></linearGradient></defs>`
    + `${base} fill="url(#${id})"/>`
    + `<path d="${CHECK}" transform="translate(16 16) scale(${scale}) translate(-16 -16.1)" fill="none" stroke="${t.ink}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
}
const svg = (size, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}" style="display:block">${inner}</svg>`;

const browser = await puppeteer.launch({ args: chromium.args.filter((a) => a !== '--single-process'), executablePath: await chromium.executablePath(), headless: 'shell' });
const page = await browser.newPage();
async function png(file, w, h, html, transparent = true) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><body style="margin:0;background:${transparent ? 'transparent' : '#fff'};width:${w}px;height:${h}px;overflow:hidden">${html}</body>`);
  const buf = await page.screenshot({ type: 'png', omitBackground: transparent, clip: { x: 0, y: 0, width: w, height: h } });
  if (file) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, buf); }
  return buf;
}

// --- web / PWA ---
await png('public/icons/pwa-192.png', 192, 192, svg(192, tile({ rx: 7 })));
await png('public/icons/pwa-512.png', 512, 512, svg(512, tile({ rx: 7 })));
await png('public/icons/maskable-512.png', 512, 512, svg(512, tile({ shape: 'bleed' }))); // check stays inside the central 80% (circle radius 40%)
await png('public/apple-touch-icon.png', 180, 180, svg(180, tile({ shape: 'bleed', scale: 1.05 })), false); // iOS rounds it itself; no transparency

// favicon.ico: 16, 32, 48 px, each drawn at its own size (PNG frames inside an ICO container)
const frames = [];
for (const s of [16, 32, 48]) frames.push({ s, buf: await png(null, s, s, svg(s, tile({ rx: 8 }))) });
const head = Buffer.alloc(6); head.writeUInt16LE(1, 2); head.writeUInt16LE(frames.length, 4);
let offset = 6 + 16 * frames.length;
const dir = frames.map(({ s, buf }) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0); e.writeUInt8(s, 1); e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(buf.length, 8); e.writeUInt32LE(offset, 12);
  offset += buf.length; return e;
});
fs.writeFileSync('public/favicon.ico', Buffer.concat([head, ...dir, ...frames.map((f) => f.buf)]));

// --- Android legacy launcher icons (API < 26) ---
const DENS = { ldpi: 36, mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
for (const [d, s] of Object.entries(DENS)) {
  await png(`${RES}/mipmap-${d}/ic_launcher.png`, s, s, svg(s, tile({ rx: 7 })));
  await png(`${RES}/mipmap-${d}/ic_launcher_round.png`, s, s, svg(s, tile({ shape: 'circle', scale: 0.95 })));
}

// --- Android splash screens: plain brand background with the tile in the middle (light and night) ---
const splash = (file, w, h, t) => {
  const tileSize = Math.round(Math.min(w, h) * 0.26);
  return png(file, w, h, `<div style="width:${w}px;height:${h}px;background:${t.bg};display:flex;align-items:center;justify-content:center">${svg(tileSize, tile({ t, rx: 8 }))}</div>`, false);
};
const SIZES = {
  'drawable': [320, 480, LIGHT], 'drawable-night': [320, 240, DARK],
  'drawable-port-ldpi': [240, 320], 'drawable-port-mdpi': [320, 480], 'drawable-port-hdpi': [480, 800],
  'drawable-port-xhdpi': [720, 1280], 'drawable-port-xxhdpi': [960, 1600], 'drawable-port-xxxhdpi': [1280, 1920],
  'drawable-land-ldpi': [320, 240], 'drawable-land-mdpi': [480, 320], 'drawable-land-hdpi': [800, 480],
  'drawable-land-xhdpi': [1280, 720], 'drawable-land-xxhdpi': [1600, 960], 'drawable-land-xxxhdpi': [1920, 1280],
};
for (const [dir, [w, h, t]] of Object.entries(SIZES)) {
  await splash(`${RES}/${dir}/splash.png`, w, h, t || LIGHT);
  if (!t) await splash(`${RES}/${dir.replace('drawable-', 'drawable-').replace(/^(drawable-(?:port|land))-/, '$1-night-')}/splash.png`, w, h, DARK);
}
await browser.close();
console.log('Icons written. Frames in favicon.ico:', frames.map((f) => f.s).join('/'));
