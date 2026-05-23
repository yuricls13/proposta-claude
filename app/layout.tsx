import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Fraunces } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  axes: ['opsz', 'SOFT'],
});

export const metadata: Metadata = {
  title: {
    default: 'Proposta · Propostas comerciais simples',
    template: '%s · Proposta',
  },
  description:
    'Crie propostas profissionais, envie por link e acompanhe o aceite digital do seu cliente.',
  metadataBase: new URL('http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${GeistSans.variable} ${GeistMono.variable} ${fraunces.variable}`}
      style={{ ['--font-sans' as string]: 'var(--font-geist-sans)' }}
    >
      <body>{children}</body>
    </html>
  );
}
