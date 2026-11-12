// Runs INSIDE the page (page.evaluate). Reports sideways scroll, overflow, small tap targets, tiny text and content under the tab bar.
// Adapted from docs/audit/tools/layout-audit.mjs.
/* global window, document, getComputedStyle */
export function auditFn() {
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
    if (el.matches('button,a[href],[role=button],[role=tab],input:not([type=hidden]),select,textarea,summary') && !el.closest('.sr-only') && cs.position !== 'absolute' && (r.width < 44 || r.height < 44)) {
      const k = 's' + label(el) + Math.round(r.width) + Math.round(r.height);
      if (!seen.has(k)) { seen.add(k); out.small.push(`${el.tagName.toLowerCase()} "${label(el)}" ${Math.round(r.width)}x${Math.round(r.height)}`); }
    }
    const direct = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (direct && parseFloat(cs.fontSize) < 12) { const k = 't' + label(el); if (!seen.has(k)) { seen.add(k); out.tiny.push(`"${label(el)}" ${cs.fontSize}`); } }
  }
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
