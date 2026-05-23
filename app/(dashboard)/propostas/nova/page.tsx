import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { ProposalForm } from '@/components/proposal-editor/proposal-form';
import type { ItemDraft } from '@/components/proposal-editor/items-editor';

export const metadata = { title: 'Nova proposta' };

interface PageProps {
  searchParams: { template?: string };
}

export default async function NovaPropostaPage({ searchParams }: PageProps) {
  const { workspace } = await requireSession();

  let initial: any = undefined;
  let templateName: string | null = null;

  if (searchParams.template) {
    const tpl = await prisma.proposalTemplate.findFirst({
      where: { id: searchParams.template, workspaceId: workspace.id },
    });
    if (tpl) {
      templateName = tpl.name;
      let items: ItemDraft[] = [];
      try {
        const arr = JSON.parse(tpl.defaultItems ?? '[]');
        if (Array.isArray(arr)) items = arr as ItemDraft[];
      } catch {}

      initial = {
        title: tpl.titleTemplate ?? '',
        description: tpl.bodyTemplate ?? '',
        clientName: '',
        clientEmail: '',
        clientCompany: '',
        validUntil: '',
        notes: tpl.notesTemplate ?? '',
        items: items.length > 0 ? items : [{ description: '', quantity: 1, unitPrice: 0 }],
      };
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Link
          href="/propostas"
          className="inline-flex items-center gap-1 text-sm text-ink-mute hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Propostas
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Nova proposta</h1>
        <p className="mt-1 text-ink-soft">
          Preencha os campos abaixo. Você pode salvar como rascunho e enviar quando quiser.
        </p>
        {templateName && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1.5 text-xs text-accent-hover">
            <Sparkles className="h-3.5 w-3.5" />
            Usando template: <strong>{templateName}</strong>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-ink-line bg-white p-8 shadow-soft">
        {searchParams.template && (
          <input type="hidden" name="templateId" value={searchParams.template} />
        )}
        <ProposalForm initial={initial} templateId={searchParams.template} />
      </div>
    </div>
  );
}
