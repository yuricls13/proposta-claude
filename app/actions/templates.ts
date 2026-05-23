'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';

const templateSchema = z.object({
  name: z.string().trim().min(2, 'Nome muito curto').max(80),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  category: z.string().trim().max(40).optional().or(z.literal('')),
  titleTemplate: z.string().trim().max(160).optional().or(z.literal('')),
  bodyTemplate: z.string().trim().max(8000).optional().or(z.literal('')),
  notesTemplate: z.string().trim().max(2000).optional().or(z.literal('')),
});

export type TemplateFormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function parseItems(raw: string): { description: string; quantity: number; unitPrice: number }[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map((item) => ({
      description: String(item.description || '').trim(),
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
    }));
  } catch {
    return [];
  }
}

export async function createTemplateAction(
  _prev: TemplateFormState | undefined,
  formData: FormData,
): Promise<TemplateFormState> {
  const { workspace } = await requireSession();

  const parsed = templateSchema.safeParse({
    name: String(formData.get('name') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    category: String(formData.get('category') ?? '').trim(),
    titleTemplate: String(formData.get('titleTemplate') ?? '').trim(),
    bodyTemplate: String(formData.get('bodyTemplate') ?? '').trim(),
    notesTemplate: String(formData.get('notesTemplate') ?? '').trim(),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join('.')] = issue.message;
    }
    return { error: 'Verifique os campos destacados', fieldErrors };
  }

  const items = parseItems(String(formData.get('items') ?? '[]'));

  const template = await prisma.proposalTemplate.create({
    data: {
      workspaceId: workspace.id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      category: parsed.data.category || null,
      titleTemplate: parsed.data.titleTemplate || null,
      bodyTemplate: parsed.data.bodyTemplate || null,
      notesTemplate: parsed.data.notesTemplate || null,
      defaultItems: JSON.stringify(items),
    },
  });

  revalidatePath('/templates');
  redirect(`/templates/${template.id}`);
}

export async function updateTemplateAction(
  templateId: string,
  _prev: TemplateFormState | undefined,
  formData: FormData,
): Promise<TemplateFormState> {
  const { workspace } = await requireSession();
  const existing = await prisma.proposalTemplate.findFirst({
    where: { id: templateId, workspaceId: workspace.id },
  });
  if (!existing) return { error: 'Template não encontrado' };

  const parsed = templateSchema.safeParse({
    name: String(formData.get('name') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    category: String(formData.get('category') ?? '').trim(),
    titleTemplate: String(formData.get('titleTemplate') ?? '').trim(),
    bodyTemplate: String(formData.get('bodyTemplate') ?? '').trim(),
    notesTemplate: String(formData.get('notesTemplate') ?? '').trim(),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join('.')] = issue.message;
    }
    return { error: 'Verifique os campos destacados', fieldErrors };
  }

  const items = parseItems(String(formData.get('items') ?? '[]'));

  await prisma.proposalTemplate.update({
    where: { id: templateId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      category: parsed.data.category || null,
      titleTemplate: parsed.data.titleTemplate || null,
      bodyTemplate: parsed.data.bodyTemplate || null,
      notesTemplate: parsed.data.notesTemplate || null,
      defaultItems: JSON.stringify(items),
    },
  });

  revalidatePath(`/templates/${templateId}`);
  revalidatePath('/templates');
  return { ok: true };
}

export async function deleteTemplateAction(templateId: string) {
  const { workspace } = await requireSession();
  await prisma.proposalTemplate.deleteMany({
    where: { id: templateId, workspaceId: workspace.id },
  });
  revalidatePath('/templates');
  redirect('/templates');
}
