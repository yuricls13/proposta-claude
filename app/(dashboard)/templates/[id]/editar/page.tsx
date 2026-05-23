import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { TemplateForm } from '@/components/templates/template-form';
import type { ItemDraft } from '@/components/proposal-editor/items-editor';

interface PageProps {
  params: { id: string };
}

export const metadata = { title: 'Editar template' };

export default async function EditTemplatePage({ params }: PageProps) {
  const { workspace } = await requireSession();
  const tpl = await prisma.proposalTemplate.findFirst({
    where: { id: params.id, workspaceId: workspace.id },
  });
  if (!tpl) notFound();

  let items: ItemDraft[] = [];
  try {
    const arr = JSON.parse(tpl.defaultItems ?? '[]');
    if (Array.isArray(arr)) items = arr as ItemDraft[];
  } catch {}

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Link
          href={`/templates/${tpl.id}`}
          className="inline-flex items-center gap-1 text-sm text-ink-mute hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Editar template</h1>
      </div>

      <TemplateForm
        templateId={tpl.id}
        initial={{
          name: tpl.name,
          description: tpl.description ?? '',
          category: tpl.category ?? '',
          titleTemplate: tpl.titleTemplate ?? '',
          bodyTemplate: tpl.bodyTemplate ?? '',
          notesTemplate: tpl.notesTemplate ?? '',
          items,
        }}
      />
    </div>
  );
}
