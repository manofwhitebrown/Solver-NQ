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
        overlay: v('overlay'),
        line: v('line'),
        'line-strong': v('line-strong'),
        ink: v('ink'),
        'ink-2': v('ink-2'),
        muted: v('muted'),
        accent: v('accent'),
        'accent-2': v('accent-2'),
        'accent-ink': v('accent-ink'),
        'accent-soft': v('accent-soft'),
        'ok-soft': v('ok-soft'),
        'warn-soft': v('warn-soft'),
        'bad-soft': v('bad-soft'),
        'disabled-bg': v('disabled-bg'),
        'disabled-ink': v('disabled-ink'),
        ok: v('ok'),
        warn: v('warn'),
        bad: v('bad'),
      },
      fontSize: {
        caption: ['13px', '1.4'],
        sm: ['14px', '1.5'],
        base: ['16px', '1.6'],
        read: ['17px', '1.7'],
        lg: ['18px', '1.5'],
        xl: ['22px', '1.35'],
        '2xl': ['28px', '1.25'],
        '3xl': ['30px', '1.2'],
      },
      fontFamily: { sans: ['"Figtree Variable"', 'system-ui', 'sans-serif'] },
      borderRadius: { sm: '10px', md: '16px', lg: '22px', xl: '30px' },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--shadow) / .06), 0 6px 18px rgb(var(--shadow) / .08)',
        glow: '0 6px 20px rgb(var(--accent) / .35)',
        lift: '0 8px 32px rgb(var(--shadow) / .16)',
      },
      transitionDuration: { DEFAULT: '180ms' },
      maxWidth: { read: '44rem', wide: '64rem' },
    },
  },
  plugins: [],
} satisfies Config;
