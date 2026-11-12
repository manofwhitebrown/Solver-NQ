import type { Config } from 'tailwindcss';

// Colors come from CSS variables (src/components/ui/tokens.css) so light/dark is one switch.
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'),
        surface: v('surface'),
        raised: v('raised'),
        line: v('line'),
        ink: v('ink'),
        muted: v('muted'),
        accent: v('accent'),
        'accent-ink': v('accent-ink'),
        ok: v('ok'),
        warn: v('warn'),
        bad: v('bad'),
      },
      fontFamily: { sans: ['"Figtree Variable"', 'system-ui', 'sans-serif'] },
      borderRadius: { sm: '8px', md: '12px', lg: '18px', xl: '24px' },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--shadow) / .06), 0 4px 16px rgb(var(--shadow) / .06)',
        lift: '0 8px 32px rgb(var(--shadow) / .16)',
      },
      transitionDuration: { DEFAULT: '180ms' },
      maxWidth: { read: '44rem' },
    },
  },
  plugins: [],
} satisfies Config;
