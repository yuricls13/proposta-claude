'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { calcItemsTotal, formatBRL, formatDateBR } from '@/lib/utils';
import { PROPOSAL_STATUSES, STATUS_LABEL, type ProposalStatus } from '@/lib/types';

type ProposalRow = {
  id: string;
  title: string;
  clientName: string;
  clientCompany: string | null;
  status: string;
  validUntil: Date | string | null;
  updatedAt: Date | string;
  viewCount: number;
  items: { quantity: number; unitPrice: number }[];
};

interface ProposalsTableProps {
  proposals: ProposalRow[];
}

const filterOptions: { value: ProposalStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todas' },
  ...PROPOSAL_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] })),
];

export function ProposalsTable({ proposals }: ProposalsTableProps) {
  const [status, setStatus] = useState<ProposalStatus | 'ALL'>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return proposals.filter((p) => {
      if (status !== 'ALL' && p.status !== status) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        (p.clientCompany ?? '').toLowerCase().includes(q)
      );
    });
  }, [proposals, status, query]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Buscar por título ou cliente..."
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                status === opt.value
                  ? 'border-ink bg-ink text-bg'
                  : 'border-ink-line bg-white text-ink-soft hover:border-ink-mute hover:text-ink'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card-elevated p-10 text-center">
          <p className="text-sm text-ink-mute">Nenhuma proposta encontrada com esses filtros.</p>
        </div>
      ) : (
        <div className="card-elevated divide-y divide-ink-line overflow-hidden">
          {filtered.map((p) => {
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
                  <span>Atualizada em {formatDateBR(p.updatedAt)}</span>
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
    </div>
  );
}
