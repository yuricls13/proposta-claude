/**
 * Branding por workspace — gera CSS vars para a página pública refletir
 * a identidade do vendedor. Aplicado via style inline no <main> da rota /p/[slug].
 */

export type FontPair = 'editorial' | 'modern' | 'classic' | 'mono';

interface FontPairConfig {
  label: string;
  hint: string;
  displayClass: string; // tailwind class para títulos
  bodyClass: string; // tailwind class para corpo
}

export const FONT_PAIRS: Record<FontPair, FontPairConfig> = {
  editorial: {
    label: 'Editorial',
    hint: 'Fraunces + Geist — clássico moderno',
    displayClass: 'font-serif',
    bodyClass: 'font-sans',
  },
  modern: {
    label: 'Moderno',
    hint: 'Sans-serif limpa para tom técnico',
    displayClass: 'font-sans',
    bodyClass: 'font-sans',
  },
  classic: {
    label: 'Clássico',
    hint: 'Serif tradicional para tom corporativo',
    displayClass: 'font-serif',
    bodyClass: 'font-serif',
  },
  mono: {
    label: 'Mono',
    hint: 'Monoespaçada — visual técnico/dev',
    displayClass: 'font-mono',
    bodyClass: 'font-mono',
  },
};

export function isValidFontPair(value: string): value is FontPair {
  return value in FONT_PAIRS;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
  return {
    r: parseInt(cleaned.slice(0, 2), 16),
    g: parseInt(cleaned.slice(2, 4), 16),
    b: parseInt(cleaned.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Deriva tons (hover mais escuro, soft mais claro) e foreground com contraste WCAG AA.
 */
export function deriveAccentShades(hex: string) {
  const rgb = hexToRgb(hex) ?? { r: 47, g: 93, b: 80 };
  const darker = {
    r: rgb.r * 0.82,
    g: rgb.g * 0.82,
    b: rgb.b * 0.82,
  };
  const lighter = {
    r: rgb.r + (255 - rgb.r) * 0.88,
    g: rgb.g + (255 - rgb.g) * 0.88,
    b: rgb.b + (255 - rgb.b) * 0.88,
  };
  const luminance = relativeLuminance(rgb.r, rgb.g, rgb.b);
  const foreground = luminance > 0.55 ? '#1B1A17' : '#FFFFFF';

  return {
    accent: hex,
    accentHover: rgbToHex(darker.r, darker.g, darker.b),
    accentSoft: rgbToHex(lighter.r, lighter.g, lighter.b),
    accentForeground: foreground,
  };
}

/**
 * CSS vars para aplicar no container raiz da página pública.
 * Mapeia para classes Tailwind bg-brand, bg-brand-soft, hover:bg-brand-hover, text-brand-fg.
 */
export function brandingStyle(accentColor: string): React.CSSProperties {
  const shades = deriveAccentShades(accentColor);
  return {
    ['--brand-accent' as string]: shades.accent,
    ['--brand-hover' as string]: shades.accentHover,
    ['--brand-soft' as string]: shades.accentSoft,
    ['--brand-fg' as string]: shades.accentForeground,
  };
}

export function fontClasses(pair: FontPair) {
  return FONT_PAIRS[pair];
}

export const DEFAULT_ACCENT = '#2F5D50';
export const DEFAULT_FONT_PAIR: FontPair = 'editorial';

export const ACCENT_PRESETS = [
  { name: 'Verde Eucalipto', value: '#2F5D50' },
  { name: 'Azul Petróleo', value: '#0F4C5C' },
  { name: 'Borgonha', value: '#7A1F2B' },
  { name: 'Terracota', value: '#B45A3C' },
  { name: 'Ouro Velho', value: '#9C7C38' },
  { name: 'Ametista', value: '#5A3A75' },
  { name: 'Antracite', value: '#2C2C32' },
  { name: 'Marinho', value: '#1F3A5F' },
];
