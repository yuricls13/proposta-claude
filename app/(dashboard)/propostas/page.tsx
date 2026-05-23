import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { ProposalsTable } from '@/components/dashboard/proposals-table';

export const metadata = { title: 'Propostas' };

export default async function ProposalsListPage() {
  const { workspace } = await requireSession();
  const proposals = await prisma.proposal.findMany({
    where: { workspaceId: workspace.id },
    include: { items: { select: { quantity: true, unitPrice: true } } },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-mute">Suas propostas</p>
          <h1 className="text-3xl font-semibold tracking-tight">Propostas</h1>
        </div>
        <Link
          href="/propostas/nova"
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" />
          Nova proposta
        </Link>
      </div>

      <ProposalsTable proposals={proposals} />
    </div>
  );
}
