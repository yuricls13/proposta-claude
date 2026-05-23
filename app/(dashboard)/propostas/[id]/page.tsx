import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Building2, Calendar, Eye, Mail, User } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import {
  calcItemsTotal,
  formatBRL,
  formatDateBR,
  formatDateTimeBR,
  formatDocument,
  relativeTime,
} from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { Separator } from '@/components/ui/separator';
import { ProposalActions } from '@/components/dashboard/proposal-actions';
import { EventTimeline } from '@/components/dashboard/event-timeline';
import { AnalyticsPanel } from '@/components/dashboard/analytics-panel';
import type { ProposalStatus } from '@/lib/types';

interface PageProps {
  params: { id: string };
}

export default async function ProposalDetailPage({ params }: PageProps) {
  const { workspace } = await requireSession();
  const proposal = await prisma.proposal.findFirst({
    where: { id: params.id, workspaceId: workspace.id },
    include: {
      items: { orderBy: { order: 'asc' } },
      events: { orderBy: { createdAt: 'asc' } },
      acceptance: true,
      rejection: true,
    },
  });

  if (!proposal) notFound();

  const total = calcItemsTotal(proposal.items);
  const status = proposal.status as ProposalStatus;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Link
          href="/propostas"
          className="inline-flex items-center gap-1 text-sm text-ink-mute transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Propostas
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-3">
            <StatusBadge status={status} />
            <span className="text-xs text-ink-mute">
              Criada {relativeTime(proposal.createdAt)}
            </span>
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            {proposal.title}
          </h1>
        </div>
      </div>

      <ProposalActions proposalId={proposal.id} slug={proposal.slug} status={status} />

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          {proposal.description && (
            <section>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-ink-mute">
                Descrição
              </h2>
              <p className="whitespace-pre-line text-ink-soft">{proposal.description}</p>
            </section>
          )}

          <Separator />

          <section>
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-ink-mute">
              Itens
            </h2>
            <div className="overflow-hidden rounded-lg border border-ink-line bg-white">
              <table className="w-full text-sm">
                <thead className="bg-bg-alt/40 text-xs uppercase tracking-wider text-ink-mute">
                  <tr>
                    <th className="px-5 py-2.5 text-left font-medium">Descrição</th>
                    <th className="px-5 py-2.5 text-right font-medium">Qtd</th>
                    <th className="px-5 py-2.5 text-right font-medium">Unit.</th>
                    <th className="px-5 py-2.5 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-line">
                  {proposal.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-3 text-ink">{item.description}</td>
                      <td className="px-5 py-3 text-right text-ink-soft">
                        {item.quantity}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-ink-soft">
                        {formatBRL(item.unitPrice)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono">
                        {formatBRL(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-bg-alt/30">
                  <tr>
                    <td colSpan={3} className="px-5 py-3 text-right font-medium text-ink-soft">
                      Total geral
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-lg font-semibold">
                      {formatBRL(total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {proposal.notes && (
            <>
              <Separator />
              <section>
                <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-ink-mute">
                  Observações
                </h2>
                <p className="whitespace-pre-line italic text-ink-soft pretty-prose">
                  {proposal.notes}
                </p>
              </section>
            </>
          )}

          <Separator />

          <AnalyticsPanel
            proposalId={proposal.id}
            viewCount={proposal.viewCount}
            firstViewedAt={proposal.firstViewedAt}
          />

          <Separator />

          <EventTimeline events={proposal.events} />
        </div>

        <aside className="space-y-8 lg:border-l lg:border-ink-line/60 lg:pl-8">
          <section>
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-ink-mute">
              Cliente
            </h3>
            <dl className="space-y-2.5 text-sm">
              <InfoRow icon={<User className="h-4 w-4" />} label={proposal.clientName} />
              {proposal.clientCompany && (
                <InfoRow
                  icon={<Building2 className="h-4 w-4" />}
                  label={proposal.clientCompany}
                />
              )}
              {proposal.clientEmail && (
                <InfoRow icon={<Mail className="h-4 w-4" />} label={proposal.clientEmail} />
              )}
            </dl>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-ink-mute">
              Tracking
            </h3>
            <dl className="space-y-2.5 text-sm">
              <InfoRow
                icon={<Eye className="h-4 w-4" />}
                label={`${proposal.viewCount} visualização${proposal.viewCount === 1 ? '' : 'ões'}`}
              />
              {proposal.firstViewedAt && (
                <DescRow
                  label="Primeira visualização"
                  value={formatDateTimeBR(proposal.firstViewedAt)}
                />
              )}
              {proposal.lastViewedAt && (
                <DescRow
                  label="Última visualização"
                  value={formatDateTimeBR(proposal.lastViewedAt)}
                />
              )}
              {proposal.validUntil && (
                <InfoRow
                  icon={<Calendar className="h-4 w-4" />}
                  label={`Válida até ${formatDateBR(proposal.validUntil)}`}
                />
              )}
            </dl>
          </section>

          {proposal.acceptance && (
            <section className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-5">
              <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-emerald-900/70">
                Aceite
              </h3>
              <dl className="space-y-2 text-sm text-emerald-900">
                <DescRow label="Nome" value={proposal.acceptance.name} />
                <DescRow label="E-mail" value={proposal.acceptance.email} />
                {proposal.acceptance.document && (
                  <DescRow
                    label="Documento"
                    value={formatDocument(proposal.acceptance.document)}
                  />
                )}
                <DescRow
                  label="Aceito em"
                  value={formatDateTimeBR(proposal.acceptance.acceptedAt)}
                />
              </dl>
            </section>
          )}

          {proposal.rejection && (
            <section className="rounded-lg border border-red-200 bg-red-50/50 p-5">
              <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-red-900/70">
                Recusa
              </h3>
              <dl className="space-y-2 text-sm text-red-900">
                <DescRow
                  label="Recusado em"
                  value={formatDateTimeBR(proposal.rejection.rejectedAt)}
                />
                {proposal.rejection.reason && (
                  <DescRow label="Motivo" value={proposal.rejection.reason} />
                )}
              </dl>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function InfoRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-ink-soft">
      <span className="text-ink-mute">{icon}</span>
      <span className="text-ink">{label}</span>
    </div>
  );
}

function DescRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider opacity-60">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
