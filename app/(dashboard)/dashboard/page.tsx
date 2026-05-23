import Link from 'next/link';
import { Eye, FileText, CheckCircle2, Wallet, ArrowRight, Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { calcItemsTotal, formatBRL, formatDateBR, relativeTime } from '@/lib/utils';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
import type { ProposalStatus } from '@/lib/types';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const { user, workspace } = await requireSession();

  const proposals = await prisma.proposal.findMany({
    where: { workspaceId: workspace.id },
    include: { items: true },
    orderBy: { updatedAt: 'desc' },
  });

  const totals = proposals.reduce(
    (acc, p) => {
      const value = calcItemsTotal(p.items);
      acc.total += 1;
      if (p.status === 'ACCEPTED') {
        acc.accepted += 1;
        acc.closedValue += value;
      }
      if (p.status === 'VIEWED') acc.viewed += 1;
      if (p.status === 'SENT') acc.sent += 1;
      return acc;
    },
    { total: 0, accepted: 0, viewed: 0, sent: 0, closedValue: 0 },
  );

  const recent = proposals.slice(0, 5);

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-mute">Olá, {user.name?.split(' ')[0] || 'vendedor'}</p>
          <h1 className="text-3xl font-semibold tracking-tight">Seu painel</h1>
        </div>
        <Link
          href="/propostas/nova"
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" />
          Nova proposta
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard
          label="Propostas"
          value={String(totals.total)}
          hint="Total cadastradas"
          icon={<FileText className="h-4 w-4" />}
        />
        <KpiCard
          label="Aguardando"
          value={String(totals.sent + totals.viewed)}
          hint={`${totals.viewed} visualizadas`}
          icon={<Eye className="h-4 w-4" />}
        />
        <KpiCard
          label="Aceitas"
          value={String(totals.accepted)}
          hint="Fechadas com sucesso"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <KpiCard
          label="Valor fechado"
          value={formatBRL(totals.closedValue)}
          hint="Soma das aceitas"
          icon={<Wallet className="h-4 w-4" />}
        />
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Últimas propostas</h2>
          <Link
            href="/propostas"
            className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"
          >
            Ver todas
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="card-elevated divide-y divide-ink-line overflow-hidden">
            {recent.map((p) => {
              const value = calcItemsTotal(p.items);
              return (
                <Link
                  key={p.id}
                  href={`/propostas/${p.id}`}
                  className="block px-5 py-4 transition-colors hover:bg-bg-alt/50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">{p.title}</p>
                      <p className="mt-0.5 text-sm text-ink-mute">
                        {p.clientName}
                        {p.clientCompany ? ` · ${p.clientCompany}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={p.status as ProposalStatus} />
                      <span className="font-mono text-sm text-ink-soft">
                        {formatBRL(value)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-mute">
                    <span>Atualizada {relativeTime(p.updatedAt)}</span>
                    {p.validUntil && (
                      <span>Válida até {formatDateBR(p.validUntil)}</span>
                    )}
                    {p.viewCount > 0 && (
                      <span>
                        {p.viewCount} visualização{p.viewCount === 1 ? '' : 'ões'}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card-elevated p-12 text-center">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-bg-alt text-ink-mute">
        <FileText className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold tracking-tight">Nenhuma proposta ainda</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
        Crie sua primeira proposta para começar a acompanhar aceites pelo seu painel.
      </p>
      <Link
        href="/propostas/nova"
        className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
      >
        <Plus className="h-4 w-4" />
        Criar primeira proposta
      </Link>
    </div>
  );
}
