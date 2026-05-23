'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { nanoid } from 'nanoid';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { proposalSchema } from '@/lib/validations';
import { assertTransition, isEditable } from '@/lib/status-machine';
import { recordEvent } from '@/lib/event-service';
import type { ProposalStatus } from '@/lib/types';

export type ProposalFormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  proposalId?: string;
};

function parseFormData(formData: FormData) {
  const itemsRaw = formData.getAll('items') as string[];
  const items = itemsRaw
    .map((raw) => {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return {
    title: String(formData.get('title') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    clientName: String(formData.get('clientName') ?? '').trim(),
    clientEmail: String(formData.get('clientEmail') ?? '').trim(),
    clientCompany: String(formData.get('clientCompany') ?? '').trim(),
    validUntil: String(formData.get('validUntil') ?? '').trim(),
    notes: String(formData.get('notes') ?? '').trim(),
    items,
  };
}

export async function createProposalAction(
  _prev: ProposalFormState | undefined,
  formData: FormData,
): Promise<ProposalFormState> {
  const { user, workspace } = await requireSession();
  const raw = parseFormData(formData);
  const parsed = proposalSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join('.')] = issue.message;
    }
    return { error: 'Verifique os campos destacados', fieldErrors };
  }

  const data = parsed.data;

  const templateId = String(formData.get('templateId') ?? '').trim();
  if (templateId) {
    // Incrementa useCount do template usado
    await prisma.proposalTemplate
      .update({
        where: { id: templateId, workspaceId: workspace.id } as any,
        data: { useCount: { increment: 1 } },
      })
      .catch(() => {});
  }

  const proposal = await prisma.proposal.create({
    data: {
      workspaceId: workspace.id,
      createdById: user.id,
      slug: nanoid(8),
      title: data.title,
      description: data.description || null,
      clientName: data.clientName,
      clientEmail: data.clientEmail || null,
      clientCompany: data.clientCompany || null,
      validUntil: data.validUntil,
      notes: data.notes || null,
      status: 'DRAFT',
      items: {
        create: data.items.map((item, index) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          order: index,
        })),
      },
      events: { create: [{ type: 'CREATED' }] },
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/propostas');
  redirect(`/propostas/${proposal.id}`);
}

export async function updateProposalAction(
  proposalId: string,
  _prev: ProposalFormState | undefined,
  formData: FormData,
): Promise<ProposalFormState> {
  const { workspace } = await requireSession();

  const existing = await prisma.proposal.findFirst({
    where: { id: proposalId, workspaceId: workspace.id },
  });
  if (!existing) return { error: 'Proposta não encontrada' };
  if (!isEditable(existing.status as ProposalStatus)) {
    return {
      error: 'Esta proposta não pode ser editada (já foi enviada ou finalizada).',
    };
  }

  const raw = parseFormData(formData);
  const parsed = proposalSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join('.')] = issue.message;
    }
    return { error: 'Verifique os campos destacados', fieldErrors };
  }

  const data = parsed.data;

  await prisma.$transaction([
    prisma.proposalItem.deleteMany({ where: { proposalId } }),
    prisma.proposal.update({
      where: { id: proposalId },
      data: {
        title: data.title,
        description: data.description || null,
        clientName: data.clientName,
        clientEmail: data.clientEmail || null,
        clientCompany: data.clientCompany || null,
        validUntil: data.validUntil,
        notes: data.notes || null,
        items: {
          create: data.items.map((item, index) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            order: index,
          })),
        },
      },
    }),
    prisma.proposalEvent.create({ data: { proposalId, type: 'UPDATED' } }),
  ]);

  revalidatePath(`/propostas/${proposalId}`);
  revalidatePath('/propostas');
  revalidatePath('/dashboard');
  redirect(`/propostas/${proposalId}`);
}

export async function sendProposalAction(proposalId: string) {
  const { workspace } = await requireSession();
  const proposal = await prisma.proposal.findFirst({
    where: { id: proposalId, workspaceId: workspace.id },
  });
  if (!proposal) throw new Error('Proposta não encontrada');

  assertTransition(proposal.status as ProposalStatus, 'SENT');

  await prisma.proposal.update({
    where: { id: proposalId },
    data: { status: 'SENT', sentAt: new Date() },
  });
  await recordEvent(proposalId, 'SENT');

  revalidatePath(`/propostas/${proposalId}`);
  revalidatePath('/propostas');
  revalidatePath('/dashboard');
}

export async function deleteProposalAction(proposalId: string) {
  const { workspace } = await requireSession();
  const proposal = await prisma.proposal.findFirst({
    where: { id: proposalId, workspaceId: workspace.id },
  });
  if (!proposal) throw new Error('Proposta não encontrada');
  if (proposal.status !== 'DRAFT') {
    throw new Error('Só é possível excluir propostas em rascunho.');
  }

  await prisma.proposal.delete({ where: { id: proposalId } });

  revalidatePath('/propostas');
  revalidatePath('/dashboard');
  redirect('/propostas');
}

export async function duplicateProposalAction(proposalId: string) {
  const { user, workspace } = await requireSession();

  const original = await prisma.proposal.findFirst({
    where: { id: proposalId, workspaceId: workspace.id },
    include: { items: true },
  });
  if (!original) throw new Error('Proposta não encontrada');

  const copy = await prisma.proposal.create({
    data: {
      workspaceId: workspace.id,
      createdById: user.id,
      slug: nanoid(8),
      title: `${original.title} (cópia)`,
      description: original.description,
      clientName: original.clientName,
      clientEmail: original.clientEmail,
      clientCompany: original.clientCompany,
      notes: original.notes,
      status: 'DRAFT',
      items: {
        create: original.items.map((it, idx) => ({
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          order: idx,
        })),
      },
      events: { create: [{ type: 'CREATED', metadata: JSON.stringify({ duplicatedFrom: proposalId }) }] },
    },
  });

  revalidatePath('/propostas');
  redirect(`/propostas/${copy.id}/editar`);
}
