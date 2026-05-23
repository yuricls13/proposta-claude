import Link from 'next/link';
import { Check, Mail, TimerOff } from 'lucide-react';
import {
  calcItemsTotal,
  formatBRL,
  formatDateBR,
  cn,
} from '@/lib/utils';
import { brandingStyle, fontClasses, type FontPair } from '@/lib/branding';
import { ResultScreen } from './result-screen';
import { SectionTracker } from './section-tracker';
import type { ProposalStatus } from '@/lib/types';

interface PublicProposalProps {
  proposal: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    clientName: string;
    clientCompany: string | null;
    validUntil: Date | null;
    notes: string | null;
    status: string;
    createdAt: Date;
    sentAt: Date | null;
    items: { id: string; description: string; quantity: number; unitPrice: number }[];
    workspace: {
      name: string;
      slug: string;
      logoUrl: string | null;
      accentColor: string;
      fontPair: string;
    };
    acceptance: { name: string; acceptedAt: Date } | null;
    rejection: { rejectedAt: Date; reason: string | null } | null;
  };
}

export function PublicProposalView({ proposal }: PublicProposalProps) {
  const status = proposal.status as ProposalStatus;
  const total = calcItemsTotal(proposal.items);
  const isClosed =
    status === 'ACCEPTED' || status === 'REJECTED' || status === 'EXPIRED';

  const fontPair = (proposal.workspace.fontPair as FontPair) || 'editorial';
  const fonts = fontClasses(fontPair);
  const brandStyle = brandingStyle(proposal.workspace.accentColor);

  const initials = proposal.workspace.name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-[100dvh] bg-bg pb-32" style={brandStyle}>
      {/* Header com branding do workspace */}
      <header className="border-b border-ink-line/40 bg-white">
        <div className="mx-auto flex max-w-editorial items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            {proposal.workspace.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={proposal.workspace.logoUrl}
                alt={proposal.workspace.name}
                className="h-8 w-8 rounded-md object-cover"
              />
            ) : (
              <div
                className="grid h-8 w-8 place-items-center rounded-md text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--brand-accent)',
                  color: 'var(--brand-fg)',
                }}
              >
                {initials}
              </div>
            )}
            <span className={cn('text-sm tracking-tight text-ink', fonts.bodyClass)}>
              {proposal.workspace.name}
            </span>
          </div>
          <span className="font-mono text-xs text-ink-mute">#{proposal.slug}</span>
        </div>
      </header>

      {isClosed && (
        <ResultScreen
          status={status}
          acceptance={proposal.acceptance}
          rejection={proposal.rejection}
        />
      )}

      {/* Tracking discreto */}
      {(status === 'SENT' || status === 'VIEWED') && (
        <SectionTracker slug={proposal.slug} />
      )}

      <article className="mx-auto max-w-editorial px-6 pt-14" data-section="hero">
        <p className="mb-4 text-xs uppercase tracking-[0.18em] text-ink-mute">
          Proposta comercial · {formatDateBR(proposal.sentAt ?? proposal.createdAt)}
        </p>

        <h1 className={cn('text-balance text-display-2xl text-ink', fonts.displayClass)}>
          {proposal.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
          <span>
            Para <strong className="font-medium text-ink">{proposal.clientName}</strong>
          </span>
          {proposal.clientCompany && (
            <>
              <span className="text-ink-mute">·</span>
              <span>{proposal.clientCompany}</span>
            </>
          )}
        </div>

        {proposal.validUntil && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-ink-line bg-white px-3 py-1.5 text-xs text-ink-soft">
            <TimerOff className="h-3.5 w-3.5 text-warn" />
            Válida até <strong className="text-ink">{formatDateBR(proposal.validUntil)}</strong>
          </div>
        )}

        {proposal.description && (
          <div className="mt-10 border-t border-ink-line/60 pt-10" data-section="description">
            <p
              className={cn(
                'text-lg leading-relaxed text-ink-soft whitespace-pre-line pretty-prose',
                fonts.bodyClass,
              )}
            >
              {proposal.description}
            </p>
          </div>
        )}

        <section className="mt-12" data-section="items">
          <h2 className={cn('mb-5 text-display-lg text-ink', fonts.displayClass)}>
            Escopo & Investimento
          </h2>
          <div className="overflow-hidden rounded-lg border border-ink-line bg-white">
            <table className="w-full">
              <tbody className="divide-y divide-ink-line">
                {proposal.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4 align-top">
                      <p className="font-medium text-ink">{item.description}</p>
                      {item.quantity > 1 && (
                        <p className="mt-1 text-xs text-ink-mute">
                          {item.quantity} × {formatBRL(item.unitPrice)}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right align-top">
                      <p className="font-mono text-base text-ink">
                        {formatBRL(item.quantity * item.unitPrice)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-bg-alt/40">
                <tr>
                  <td className="px-5 py-4">
                    <p className={cn('text-lg text-ink', fonts.displayClass)}>Total</p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <p className="font-mono text-xl font-semibold text-ink tabular-nums">
                      {formatBRL(total)}
                    </p>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {proposal.notes && (
          <section className="mt-12 border-t border-ink-line/60 pt-10" data-section="notes">
            <h3 className="mb-3 text-sm uppercase tracking-wider text-ink-mute">
              Observações
            </h3>
            <p
              className={cn(
                'italic text-ink-soft whitespace-pre-line pretty-prose',
                fonts.bodyClass,
              )}
            >
              {proposal.notes}
            </p>
          </section>
        )}

        <footer className="mt-16 border-t border-ink-line/60 pt-8">
          <p className="text-sm text-ink-soft">
            Enviado por <strong className="text-ink">{proposal.workspace.name}</strong>
          </p>
        </footer>
      </article>

      {/* Sticky CTA bar branded */}
      {(status === 'SENT' || status === 'VIEWED') && (
        <div
          data-section="cta"
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-ink-line bg-white/95 shadow-soft backdrop-blur"
        >
          <div className="mx-auto flex max-w-editorial items-center justify-between gap-3 px-6 py-3">
            <p className="hidden text-sm text-ink-soft sm:block">Pronto para confirmar?</p>
            <div className="flex flex-1 items-center justify-end gap-2">
              <Link
                href={`/p/${proposal.slug}/recusar`}
                className="rounded-md border border-ink-line bg-white px-4 py-2 text-sm text-ink-soft transition-colors hover:bg-bg-alt hover:text-ink"
              >
                Recusar
              </Link>
              <Link
                href={`/p/${proposal.slug}/aceitar`}
                className="inline-flex items-center gap-1.5 rounded-md px-5 py-2 text-sm font-medium shadow-soft transition-all duration-150 ease-spring hover:brightness-110 active:scale-[0.98]"
                style={{
                  backgroundColor: 'var(--brand-accent)',
                  color: 'var(--brand-fg)',
                }}
              >
                <Check className="h-4 w-4" />
                Aceitar proposta
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
