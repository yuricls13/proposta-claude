import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { isEditable } from '@/lib/status-machine';
import { ProposalForm } from '@/components/proposal-editor/proposal-form';
import type { ProposalStatus } from '@/lib/types';

interface PageProps {
  params: { id: string };
}

export const metadata = { title: 'Editar proposta' };

export default async function EditarPropostaPage({ params }: PageProps) {
  const { workspace } = await requireSession();
  const proposal = await prisma.proposal.findFirst({
    where: { id: params.id, workspaceId: workspace.id },
    include: { items: { orderBy: { order: 'asc' } } },
  });

  if (!proposal) notFound();
  if (!isEditable(proposal.status as ProposalStatus)) {
    redirect(`/propostas/${proposal.id}`);
  }

  const validUntilStr = proposal.validUntil
    ? proposal.validUntil.toISOString().slice(0, 10)
    : '';

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Link
          href={`/propostas/${proposal.id}`}
          className="inline-flex items-center gap-1 text-sm text-ink-mute hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para a proposta
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Editar proposta</h1>
      </div>

      <div className="card-elevated p-8">
        <ProposalForm
          proposalId={proposal.id}
          initial={{
            title: proposal.title,
            description: proposal.description ?? '',
            clientName: proposal.clientName,
            clientEmail: proposal.clientEmail ?? '',
            clientCompany: proposal.clientCompany ?? '',
            validUntil: validUntilStr,
            notes: proposal.notes ?? '',
            items: proposal.items.map((i) => ({
              description: i.description,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
            })),
          }}
        />
      </div>
    </div>
  );
}
