// What `npm run shots` captures. Edit here to add a route or a size.
// Screenshots (committed): PHONE and LAPTOP, light and dark. Layout checks also run on the EXTRA sizes (light only).
export const PHONE = { name: 'phone', w: 390, h: 844, dpr: 1, mobile: true };
export const LAPTOP = { name: 'laptop', w: 1280, h: 800, dpr: 1, mobile: false };
export const SHOT_DEVICES = [PHONE, LAPTOP];
export const EXTRA_DEVICES = [
  { name: 'w320', w: 320, h: 568, dpr: 2, mobile: true }, { name: 'w360', w: 360, h: 640, dpr: 2, mobile: true },
  { name: 'w375', w: 375, h: 667, dpr: 2, mobile: true }, { name: 'w412', w: 412, h: 915, dpr: 2, mobile: true },
  { name: 'w430', w: 430, h: 932, dpr: 2, mobile: true }, { name: 'land640x360', w: 640, h: 360, dpr: 2, mobile: true },
];
export const THEMES = ['light', 'dark'];
export const SETTINGS_KEY = 'solver-nq:settings'; // onboarded: true skips the welcome screen

/** [file name, hash route, optional action]. `ids` are the demo ids returned by seedDemoData(). */
export const routesFor = (ids) => [
  ['home', '#/'], ['scan', '#/scan'],
  ['answer-learn', `#/answer/${ids.learn}`], ['answer-answer', `#/answer/${ids.answer}`],
  ['answer-wide-math', `#/answer/${ids.wideMath}`], ['answer-code', `#/answer/${ids.code}`],
  ['answer-long-word', `#/answer/${ids.longWord}`], ['answer-mismatch', `#/answer/${ids.mismatch}`],
  ['library', '#/library'], ['library-select', '#/library', 'select'],
  ['learn', '#/learn'], ['learn-review', '#/learn/review'], ['learn-quiz', '#/learn/quiz'],
  ['learn-stats', '#/learn/stats'], ['learn-cards', '#/learn/cards'],
  ['export', `#/export?ids=${ids.all.slice(0, 3).join(',')}`],
  ['settings', '#/settings'], ['graph', '#/graph'], ['backup', '#/backup'], ['notes', '#/notes'], ['plan', '#/plan'],
  ['design', '#/design'], ['onboarding', '#/welcome', 'fresh'],
];
