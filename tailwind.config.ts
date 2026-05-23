import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // === Tokens próprios (warm neutral) — fonte da verdade do design system ===
        bg: {
          DEFAULT: '#FBF9F6',
          alt: '#F3EFE8',
          dark: '#1B1A17',
        },
        ink: {
          DEFAULT: '#1B1A17',
          soft: '#3D3A34',
          mute: '#6F6A60',
          line: '#E5DFD4',
        },
        accent: {
          DEFAULT: '#2F5D50',
          hover: '#264A40',
          soft: '#E6EFEC',
        },
        // Brand dinâmico — usado SOMENTE na rota pública /p/[slug] via CSS vars
        brand: 'var(--brand-accent, #2F5D50)',
        'brand-soft': 'var(--brand-soft, #E6EFEC)',
        'brand-hover': 'var(--brand-hover, #264A40)',
        'brand-fg': 'var(--brand-fg, #FFFFFF)',
        warn: '#B45309',
        ok: '#15803D',
        danger: '#B91C1C',

        // === Aliases que shadcn primitives consomem (mapeiam para os tokens acima) ===
        border: '#E5DFD4',
        input: '#E5DFD4',
        ring: '#2F5D50',
        background: '#FBF9F6',
        foreground: '#1B1A17',
        primary: {
          DEFAULT: '#2F5D50',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F3EFE8',
          foreground: '#1B1A17',
        },
        destructive: {
          DEFAULT: '#B91C1C',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F3EFE8',
          foreground: '#6F6A60',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#1B1A17',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1B1A17',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-xl': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      maxWidth: {
        prose: '70ch',
        editorial: '720px',
      },
      borderRadius: {
        lg: '10px',
        md: '8px',
        sm: '6px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(27, 26, 23, 0.04), 0 4px 12px rgba(27, 26, 23, 0.04)',
        focus: '0 0 0 3px rgba(47, 93, 80, 0.18)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s linear infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
