import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Copy, PenSquare, Trash2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { formatBRL } from '@/lib/utils';

interface PageProps {
  params: { id: string };
}

export const metadata = { title: 'Template' };

export default async function TemplateDetailPage({ params }: PageProps) {
  const { workspace } = await requireSession();
  const tpl = await prisma.proposalTemplate.findFirst({
    where: { id: params.id, workspaceId: workspace.id },
  });
  if (!tpl) notFound();

  let items: { description: string; quantity: number; unitPrice: number }[] = [];
  try {
    const arr = JSON.parse(tpl.defaultItems ?? '[]');
    if (Array.isArray(arr)) items = arr;
  } catch {}

  const total = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Link
          href="/templates"
          className="inline-flex items-center gap-1 text-sm text-ink-mute hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Templates
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          {tpl.category && (
            <p className="text-sm uppercase tracking-[0.14em] text-ink-mute">{tpl.category}</p>
          )}
          <h1 className="text-3xl font-semibold tracking-tight">{tpl.name}</h1>
          {tpl.description && (
            <p className="mt-2 max-w-prose text-ink-soft">{tpl.description}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/propostas/nova?template=${tpl.id}`}>
              <Copy />
              Criar proposta com este template
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/templates/${tpl.id}/editar`}>
              <PenSquare />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {tpl.titleTemplate && (
            <section>
              <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-ink-mute">
                Título padrão
              </h2>
              <p className="text-lg text-ink">{tpl.titleTemplate}</p>
            </section>
          )}

          {tpl.bodyTemplate && (
            <section>
              <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-ink-mute">
                Corpo
              </h2>
              <pre className="whitespace-pre-wrap rounded-md border border-ink-line bg-white p-4 text-sm text-ink-soft font-sans">
                {tpl.bodyTemplate}
              </pre>
            </section>
          )}

          {tpl.notesTemplate && (
            <section>
              <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-ink-mute">
                Observações
              </h2>
              <p className="whitespace-pre-line text-ink-soft italic">{tpl.notesTemplate}</p>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-ink-mute">
              Itens padrão
            </h2>
            {items.length === 0 ? (
              <p className="text-sm text-ink-mute">Nenhum item padrão configurado.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-ink-line bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-bg-alt/40 text-xs uppercase tracking-wider text-ink-mute">
                    <tr>
                      <th className="px-5 py-2 text-left font-medium">Descrição</th>
                      <th className="px-5 py-2 text-right font-medium">Qtd</th>
                      <th className="px-5 py-2 text-right font-medium">Unit.</th>
                      <th className="px-5 py-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-line">
                    {items.map((it, i) => (
                      <tr key={i}>
                        <td className="px-5 py-3 text-ink">{it.description}</td>
                        <td className="px-5 py-3 text-right text-ink-soft">{it.quantity}</td>
                        <td className="px-5 py-3 text-right font-mono text-ink-soft">
                          {formatBRL(it.unitPrice)}
                        </td>
                        <td className="px-5 py-3 text-right font-mono">
                          {formatBRL(it.quantity * it.unitPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-bg-alt/30">
                    <tr>
                      <td colSpan={3} className="px-5 py-3 text-right font-medium text-ink-soft">
                        Total estimado
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-base font-semibold">
                        {formatBRL(total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-ink-line bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold tracking-tight">Estatísticas</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-mute">Usos</dt>
                <dd className="font-mono text-ink">{tpl.useCount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-mute">Itens</dt>
                <dd className="font-mono text-ink">{items.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-mute">Valor estimado</dt>
                <dd className="font-mono text-ink">{formatBRL(total)}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
