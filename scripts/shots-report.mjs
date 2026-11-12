import fs from 'node:fs';

const uniq = (a) => [...new Set(a)];

/** layout: { `${device}|${theme}|${route}`: auditResult }  ->  layout.md */
export function writeLayout(file, layout, errors) {
  const by = {};
  for (const [k, v] of Object.entries(layout)) {
    const [dev, theme, route] = k.split('|');
    const tag = `${dev}/${theme}`;
    const add = (type, x) => (((by[route] ||= {})[type] ||= {})[x] ||= new Set()).add(tag);
    if (v.hscroll > 0) add('Page scrolls sideways', `${v.hscroll}px`);
    v.overflow.forEach((x) => add('Overflow', x)); v.overlap.forEach((x) => add('Under tab bar', x));
    v.small.forEach((x) => add('Tap target < 44px', x)); v.tiny.forEach((x) => add('Text < 12px', x));
  }
  const lines = ['# Layout checks', '', `Generated ${new Date().toISOString().slice(0, 10)} by \`npm run shots\`. Each finding lists the sizes/themes where it appears.`, ''];
  const routes = Object.keys(by);
  lines.push(routes.length ? `${routes.length} route(s) with findings.` : 'No findings.', '');
  for (const route of routes) {
    lines.push(`## ${route}`);
    for (const [type, items] of Object.entries(by[route])) {
      lines.push(`- **${type}**`);
      for (const [x, tags] of Object.entries(items).slice(0, 8)) lines.push(`  - ${x} _(${[...tags].slice(0, 6).join(', ')}${tags.size > 6 ? ', ...' : ''})_`);
    }
    lines.push('');
  }
  const errs = Object.entries(errors).filter(([, v]) => v.length);
  if (errs.length) { lines.push('## Console errors'); for (const [k, v] of errs) lines.push(`- ${k}: ${uniq(v).slice(0, 3).join(' | ')}`); }
  fs.writeFileSync(file, lines.join('\n') + '\n');
}

/** a11y: { `${route}|${device}|${theme}`: axe violations[] }  ->  a11y.md */
export function writeA11y(file, a11y) {
  const rank = { critical: 0, serious: 1, moderate: 2, minor: 3 };
  const lines = ['# Accessibility scan (axe-core)', '', `Generated ${new Date().toISOString().slice(0, 10)} by \`npm run shots\`. Reported, never failing.`, ''];
  const byRoute = {};
  for (const [k, vs] of Object.entries(a11y)) {
    const [route, dev, theme] = k.split('|');
    for (const v of vs) {
      const r = ((byRoute[route] ||= {})[v.id] ||= { impact: v.impact, help: v.help, n: 0, tags: new Set(), sample: v.nodes[0]?.target?.join(' ') ?? '' });
      r.n += v.nodes.length; r.tags.add(`${dev}/${theme}`);
    }
  }
  const routes = Object.keys(a11y).map((k) => k.split('|')[0]);
  const withIssues = uniq(routes).filter((r) => byRoute[r]);
  lines.push(`Scanned ${uniq(routes).length} route(s); ${withIssues.length} with violations.`, '');
  lines.push('| Route | Violations | Worst |', '|---|---|---|');
  for (const r of uniq(routes)) {
    const list = Object.values(byRoute[r] ?? {});
    const worst = list.sort((a, b) => rank[a.impact] - rank[b.impact])[0]?.impact ?? '-';
    lines.push(`| ${r} | ${list.length} | ${worst} |`);
  }
  lines.push('');
  for (const r of withIssues) {
    lines.push(`## ${r}`);
    for (const [id, v] of Object.entries(byRoute[r]).sort((a, b) => rank[a[1].impact] - rank[b[1].impact]))
      lines.push(`- **${v.impact}** \`${id}\`: ${v.help} (${v.n} element(s); ${[...v.tags].join(', ')}). e.g. \`${v.sample}\``);
    lines.push('');
  }
  fs.writeFileSync(file, lines.join('\n') + '\n');
}
