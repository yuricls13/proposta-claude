import Link from 'next/link';
import { Plus, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { formatBRL } from '@/lib/utils';

export const metadata = { title: 'Templates' };

const categoryLabel: Record<string, string> = {
  consultoria: 'Consultoria',
  desenvolvimento: 'Desenvolvimento',
  design: 'Design',
  marketing: 'Marketing',
};

export default async function TemplatesPage() {
  const { workspace } = await requireSession();
  const templates = await prisma.proposalTemplate.findMany({
    where: { workspaceId: workspace.id },
    orderBy: [{ useCount: 'desc' }, { updatedAt: 'desc' }],
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-mute">Modelos reutilizáveis</p>
          <h1 className="text-3xl font-semibold tracking-tight">Templates</h1>
          <p className="mt-2 max-w-prose text-ink-soft">
            Crie templates com variáveis dinâmicas e use-os para gerar propostas em segundos.
          </p>
        </div>
        <Button asChild>
          <Link href="/templates/novo">
            <Plus />
            Novo template
          </Link>
        </Button>
      </div>

      {templates.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => {
            const items = (() => {
              try {
                const arr = JSON.parse(tpl.defaultItems ?? '[]');
                if (!Array.isArray(arr)) return [];
                return arr as { quantity: number; unitPrice: number }[];
              } catch {
                return [];
              }
            })();
            const total = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);

            return (
              <Link
                key={tpl.id}
                href={`/templates/${tpl.id}`}
                className="group rounded-lg border border-ink-line bg-white p-5 shadow-soft transition-all duration-150 ease-spring hover:-translate-y-0.5 hover:border-ink-mute"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent-soft text-accent">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  {tpl.category && (
                    <span className="rounded-full border border-ink-line bg-bg-alt px-2 py-0.5 text-xs text-ink-mute">
                      {categoryLabel[tpl.category] ?? tpl.category}
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-ink group-hover:underline">{tpl.name}</h3>
                {tpl.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{tpl.description}</p>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-ink-line pt-3 text-xs text-ink-mute">
                  <span>
                    {items.length} {items.length === 1 ? 'item' : 'itens'}
                  </span>
                  <span className="font-mono">{formatBRL(total)}</span>
                </div>
                {tpl.useCount > 0 && (
                  <p className="mt-2 text-xs text-ink-mute">
                    Usado {tpl.useCount}× para gerar propostas
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-ink-line bg-white p-12 text-center shadow-soft">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-bg-alt text-ink-mute">
        <Sparkles className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold tracking-tight">Sem templates ainda</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
        Crie um template com variáveis dinâmicas (
        <code className="font-mono text-xs">{'{{cliente.nome}}'}</code>) e use-o para
        gerar propostas em segundos.
      </p>
      <Button asChild className="mt-5">
        <Link href="/templates/novo">
          <Plus />
          Criar primeiro template
        </Link>
      </Button>
    </div>
  );
}
