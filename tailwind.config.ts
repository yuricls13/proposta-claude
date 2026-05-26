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
        // === Tokens próprios (Agência Dedicada design system) ===
        bg: {
          DEFAULT: '#F8FAFC',
          alt: '#F1F5F9',
          dark: '#0B0058',
        },
        ink: {
          DEFAULT: '#1E293B',
          soft: '#475569',
          mute: '#64748B',
          line: '#E2E8F0',
        },
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          soft: '#DBEAFE',
        },
        cta: {
          DEFAULT: '#F97316',
          hover: '#EA6A00',
        },
        // Brand dinâmico — usado SOMENTE na rota pública /p/[slug] via CSS vars
        brand: 'var(--brand-accent, #2563EB)',
        'brand-soft': 'var(--brand-soft, #DBEAFE)',
        'brand-hover': 'var(--brand-hover, #1D4ED8)',
        'brand-fg': 'var(--brand-fg, #FFFFFF)',
        warn: '#D97706',
        ok: '#16A34A',
        danger: '#DC2626',

        // === Aliases que shadcn primitives consomem ===
        border: '#E2E8F0',
        input: '#E2E8F0',
        ring: '#2563EB',
        background: '#F8FAFC',
        foreground: '#1E293B',
        primary: {
          DEFAULT: '#0B0058',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F1F5F9',
          foreground: '#1E293B',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F1F5F9',
          foreground: '#64748B',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#1E293B',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1E293B',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Poppins', 'system-ui', 'sans-serif'],
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
        lg: '12px',
        md: '8px',
        sm: '4px',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(11, 0, 88, 0.08), 0 4px 12px rgba(11, 0, 88, 0.06)',
        focus: '0 0 0 3px rgba(37, 99, 235, 0.18)',
        cta: '0 4px 16px rgba(249, 115, 22, 0.35)',
        md: '0 4px 12px rgba(11, 0, 88, 0.12)',
        lg: '0 8px 24px rgba(11, 0, 88, 0.16)',
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
