'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { acceptanceSchema, rejectionSchema } from '@/lib/validations';
import { assertTransition } from '@/lib/status-machine';
import { recordEvent } from '@/lib/event-service';
import {
  buildVerificationEmail,
  generateVerificationCode,
  sendEmail,
} from '@/lib/email-service';
import type { ProposalStatus } from '@/lib/types';

export type AcceptanceState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  step?: 'form' | 'verify';
  pendingEmail?: string;
};

function clientMeta() {
  const h = headers();
  return {
    ipAddress:
      h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || null,
    userAgent: h.get('user-agent') || null,
  };
}

/**
 * STEP 1: registra Acceptance "pending" (status segue VIEWED) + envia código por e-mail.
 * Returns state com step=verify para o cliente.
 */
export async function requestAcceptanceCodeAction(
  slug: string,
  _prev: AcceptanceState | undefined,
  formData: FormData,
): Promise<AcceptanceState> {
  const proposal = await prisma.proposal.findUnique({
    where: { slug },
    include: { acceptance: true },
  });
  if (!proposal) return { error: 'Proposta não encontrada' };

  if (proposal.status === 'ACCEPTED') {
    return { error: 'Esta proposta já foi aceita.' };
  }
  if (
    proposal.status === 'REJECTED' ||
    proposal.status === 'EXPIRED' ||
    proposal.status === 'DRAFT'
  ) {
    return { error: 'Esta proposta não está disponível para aceite.' };
  }

  const raw = {
    name: String(formData.get('name') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    document: String(formData.get('document') ?? '').trim(),
    confirmed: formData.get('confirmed') ?? false,
  };

  const parsed = acceptanceSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join('.')] = issue.message;
    }
    return { error: 'Verifique os campos destacados', fieldErrors };
  }

  const code = generateVerificationCode(6);
  const meta = clientMeta();

  await prisma.acceptance.upsert({
    where: { proposalId: proposal.id },
    create: {
      proposalId: proposal.id,
      name: parsed.data.name,
      email: parsed.data.email,
      document: parsed.data.document || null,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      verificationCode: code,
      acceptedAt: new Date(),
    },
    update: {
      name: parsed.data.name,
      email: parsed.data.email,
      document: parsed.data.document || null,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      verificationCode: code,
      verifiedAt: null,
    },
  });

  const emailContent = buildVerificationEmail(parsed.data.name, code, proposal.title);
  await sendEmail({
    to: parsed.data.email,
    subject: emailContent.subject,
    body: emailContent.body,
    category: 'verification_code',
  });

  // Log também no event timeline (visível ao vendedor)
  await recordEvent(proposal.id, 'VIEWED', {
    note: 'Cliente solicitou código de aceite',
    email: parsed.data.email,
  });

  return {
    step: 'verify',
    pendingEmail: parsed.data.email,
    ok: true,
  };
}

/**
 * STEP 2: valida código e finaliza o aceite (status → ACCEPTED).
 */
export async function verifyAcceptanceCodeAction(
  slug: string,
  _prev: AcceptanceState | undefined,
  formData: FormData,
): Promise<AcceptanceState> {
  const code = String(formData.get('code') ?? '').trim().replace(/\D/g, '');
  if (code.length !== 6) {
    return {
      step: 'verify',
      error: 'Código deve ter 6 dígitos',
      pendingEmail: String(formData.get('email') ?? ''),
    };
  }

  const proposal = await prisma.proposal.findUnique({
    where: { slug },
    include: { acceptance: true },
  });
  if (!proposal || !proposal.acceptance) {
    return { error: 'Não há solicitação de aceite pendente.' };
  }

  if (proposal.acceptance.verificationCode !== code) {
    return {
      step: 'verify',
      error: 'Código inválido. Confira o e-mail e tente novamente.',
      pendingEmail: proposal.acceptance.email,
    };
  }

  if (proposal.status === 'ACCEPTED') {
    redirect(`/p/${slug}`);
  }

  assertTransition(proposal.status as ProposalStatus, 'ACCEPTED');

  await prisma.$transaction([
    prisma.acceptance.update({
      where: { proposalId: proposal.id },
      data: { verifiedAt: new Date(), verificationCode: null },
    }),
    prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    }),
  ]);

  await recordEvent(proposal.id, 'ACCEPTED', { name: proposal.acceptance.name });

  revalidatePath(`/p/${slug}`);
  revalidatePath(`/propostas/${proposal.id}`);
  redirect(`/p/${slug}`);
}

export async function rejectProposalAction(
  slug: string,
  _prev: AcceptanceState | undefined,
  formData: FormData,
): Promise<AcceptanceState> {
  const proposal = await prisma.proposal.findUnique({ where: { slug } });
  if (!proposal) return { error: 'Proposta não encontrada' };

  if (
    proposal.status === 'ACCEPTED' ||
    proposal.status === 'REJECTED' ||
    proposal.status === 'EXPIRED' ||
    proposal.status === 'DRAFT'
  ) {
    return { error: 'Esta proposta não está disponível para recusa.' };
  }

  const parsed = rejectionSchema.safeParse({
    reason: String(formData.get('reason') ?? '').trim(),
  });
  if (!parsed.success) return { error: 'Motivo inválido' };

  assertTransition(proposal.status as ProposalStatus, 'REJECTED');
  const meta = clientMeta();

  await prisma.$transaction([
    prisma.rejection.create({
      data: {
        proposalId: proposal.id,
        reason: parsed.data.reason || null,
        ipAddress: meta.ipAddress,
        rejectedAt: new Date(),
      },
    }),
    prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: 'REJECTED', rejectedAt: new Date() },
    }),
  ]);

  await recordEvent(proposal.id, 'REJECTED');

  revalidatePath(`/p/${slug}`);
  revalidatePath(`/propostas/${proposal.id}`);
  redirect(`/p/${slug}`);
}
