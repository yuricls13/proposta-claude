'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { prisma } from '@/lib/prisma';
import { requireSession, canManageWorkspace } from '@/lib/auth';
import { isValidFontPair } from '@/lib/branding';

const workspaceSchema = z.object({
  name: z.string().trim().min(2, 'Nome muito curto').max(80),
  accentColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida — use formato #RRGGBB'),
  fontPair: z.string().trim().refine(isValidFontPair, 'Combinação de fonte inválida'),
  brandTone: z.string().trim().max(500).optional().or(z.literal('')),
  logoUrl: z.string().trim().url().optional().or(z.literal('')),
});

export type WorkspaceFormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function updateWorkspaceAction(
  _prev: WorkspaceFormState | undefined,
  formData: FormData,
): Promise<WorkspaceFormState> {
  const { workspace, role } = await requireSession();
  if (!canManageWorkspace(role)) {
    return { error: 'Você não tem permissão para alterar o workspace.' };
  }

  const parsed = workspaceSchema.safeParse({
    name: String(formData.get('name') ?? '').trim(),
    accentColor: String(formData.get('accentColor') ?? '').trim(),
    fontPair: String(formData.get('fontPair') ?? '').trim(),
    brandTone: String(formData.get('brandTone') ?? '').trim(),
    logoUrl: String(formData.get('logoUrl') ?? '').trim(),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join('.')] = issue.message;
    }
    return { error: 'Verifique os campos destacados', fieldErrors };
  }

  await prisma.workspace.update({
    where: { id: workspace.id },
    data: {
      name: parsed.data.name,
      accentColor: parsed.data.accentColor,
      fontPair: parsed.data.fontPair,
      brandTone: parsed.data.brandTone || null,
      logoUrl: parsed.data.logoUrl || null,
    },
  });

  revalidatePath('/settings/workspace');
  revalidatePath('/dashboard');
  return { ok: true };
}

const inviteSchema = z.object({
  email: z.string().trim().email('E-mail inválido'),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
});

export async function inviteMemberAction(
  _prev: WorkspaceFormState | undefined,
  formData: FormData,
): Promise<WorkspaceFormState> {
  const { workspace, role } = await requireSession();
  if (!canManageWorkspace(role)) {
    return { error: 'Apenas admins podem convidar membros.' };
  }

  const parsed = inviteSchema.safeParse({
    email: String(formData.get('email') ?? '').trim(),
    role: String(formData.get('role') ?? 'MEMBER').trim(),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' };
  }

  // Verifica se já é membro
  const existingMember = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: workspace.id,
      user: { email: parsed.data.email },
    },
  });
  if (existingMember) {
    return { error: 'Este usuário já faz parte do workspace.' };
  }

  // Verifica se já tem convite pendente
  const existingInvite = await prisma.invitation.findFirst({
    where: {
      workspaceId: workspace.id,
      email: parsed.data.email,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (existingInvite) {
    return { error: 'Já existe um convite pendente para este e-mail.' };
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.invitation.create({
    data: {
      workspaceId: workspace.id,
      email: parsed.data.email,
      role: parsed.data.role,
      token: nanoid(32),
      expiresAt,
    },
  });

  revalidatePath('/settings/team');
  return { ok: true };
}

export async function removeMemberAction(memberId: string) {
  const { workspace, role, user } = await requireSession();
  if (!canManageWorkspace(role)) {
    throw new Error('Apenas admins podem remover membros.');
  }

  const member = await prisma.workspaceMember.findFirst({
    where: { id: memberId, workspaceId: workspace.id },
  });
  if (!member) throw new Error('Membro não encontrado');
  if (member.role === 'OWNER') throw new Error('Não é possível remover o owner.');
  if (member.userId === user.id) throw new Error('Use Sair do workspace.');

  await prisma.workspaceMember.delete({ where: { id: memberId } });
  revalidatePath('/settings/team');
}

export async function revokeInvitationAction(invitationId: string) {
  const { workspace, role } = await requireSession();
  if (!canManageWorkspace(role)) {
    throw new Error('Apenas admins podem revogar convites.');
  }
  await prisma.invitation.delete({
    where: { id: invitationId, workspaceId: workspace.id } as any,
  });
  revalidatePath('/settings/team');
}
