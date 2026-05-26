import Link from 'next/link';
import { ArrowRight, CheckCircle2, Eye, Link2, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-[100dvh] bg-bg">
      {/* Header — Navy */}
      <header className="bg-primary border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-white text-primary">
              <span className="font-serif text-sm font-bold leading-none">P</span>
            </div>
            <span className="font-serif text-lg font-semibold tracking-tight text-white">Proposta</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/login"
              className="text-white/70 transition-colors hover:text-white"
            >
              Entrar
            </Link>
            <Link
              href="/login"
              className="press-feedback inline-flex items-center gap-1.5 rounded-md border border-white/30 bg-white/10 px-3.5 py-2 text-white transition-colors hover:bg-white/20"
            >
              Começar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero — Navy background */}
      <section className="bg-primary">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-16 md:pt-28">
          <div className="grid items-end gap-12 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="mb-5 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/60">
                Propostas comerciais sem fricção
              </p>
              <h1 className="font-serif text-balance text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl">
                <span className="block">Suas propostas,</span>
                <span className="block">
                  fechadas com{' '}
                  <em className="font-normal italic text-cta">elegância</em>.
                </span>
              </h1>
            </div>
            <div className="md:col-span-5">
              <p className="max-w-prose text-lg leading-relaxed text-white/75">
                Monte uma proposta profissional, envie por link e veja quando o cliente
                abrir, ler e aceitar. Sem PDF em anexo, sem mistério.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="press-feedback inline-flex items-center gap-1.5 rounded-md bg-cta px-5 py-2.5 font-serif font-semibold text-white shadow-cta transition-colors hover:bg-cta-hover"
                >
                  Entrar no app
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-3 text-xs text-white/40">
                Demo:{' '}
                <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-white/70">
                  demo@proposta.app
                </code>{' '}
                /{' '}
                <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-white/70">demo1234</code>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features — Off-white background */}
      <section className="border-t border-ink-line/60 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <FeatureRow
            index="01"
            icon={<Link2 className="h-5 w-5" />}
            title="Um link curto faz o trabalho"
            text="Cada proposta vira uma URL elegante que seu cliente abre direto no navegador. Sem login, sem cadastro, sem PDF preso no e-mail."
            align="left"
          />
          <FeatureRow
            index="02"
            icon={<Eye className="h-5 w-5" />}
            title="Você vê o que o cliente vê"
            text="Saiba na hora quando a proposta foi aberta, quantas vezes foi revisitada e quando o aceite chegou. Sem tela de espera, sem ansiedade."
            align="right"
          />
          <FeatureRow
            index="03"
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Aceite com registro pronto"
            text="O cliente confirma com nome, e-mail e — se quiser — CPF/CNPJ. A gente registra data, hora e IP para você ter onde se apoiar."
            align="left"
          />
        </div>
      </section>

      <footer className="border-t border-ink-line/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-sm text-ink-mute">
          <span>© {new Date().getFullYear()} Proposta.</span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-ok" />
            App rodando localmente
          </span>
        </div>
      </footer>
    </main>
  );
}

function FeatureRow({
  index,
  icon,
  title,
  text,
  align,
}: {
  index: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  align: 'left' | 'right';
}) {
  return (
    <div
      className={`grid items-center gap-8 border-b border-ink-line/40 py-12 last:border-b-0 md:grid-cols-12 ${
        align === 'right' ? 'md:[&>*:first-child]:order-2' : ''
      }`}
    >
      <div className="md:col-span-5">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-ink-mute">{index}</span>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-accent-soft text-accent">
            {icon}
          </div>
        </div>
        <h3 className="font-serif mt-3 text-balance text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h3>
      </div>
      <p className="text-ink-soft md:col-span-7 md:text-lg">{text}</p>
    </div>
  );
}
