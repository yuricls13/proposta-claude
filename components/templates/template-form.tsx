'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Check, Save, Variable } from 'lucide-react';
import {
  createTemplateAction,
  updateTemplateAction,
  type TemplateFormState,
} from '@/app/actions/templates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ItemsEditor, type ItemDraft } from '@/components/proposal-editor/items-editor';
import { AVAILABLE_VARIABLES } from '@/lib/variables';

interface TemplateFormProps {
  templateId?: string;
  initial?: {
    name: string;
    description: string;
    category: string;
    titleTemplate: string;
    bodyTemplate: string;
    notesTemplate: string;
    items: ItemDraft[];
  };
}

const blankInitial = {
  name: '',
  description: '',
  category: '',
  titleTemplate: '',
  bodyTemplate: '',
  notesTemplate: '',
  items: [] as ItemDraft[],
};

const categories = [
  { value: '', label: 'Sem categoria' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'desenvolvimento', label: 'Desenvolvimento' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
];

export function TemplateForm({ templateId, initial }: TemplateFormProps) {
  const data = initial ?? blankInitial;
  const [items, setItems] = useState<ItemDraft[]>(data.items);

  const action = templateId
    ? updateTemplateAction.bind(null, templateId)
    : createTemplateAction;

  const [state, formAction] = useFormState<TemplateFormState | undefined, FormData>(
    action,
    undefined,
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <form action={formAction} className="space-y-8">
        {state?.ok && (
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
            <Check className="h-4 w-4" />
            <AlertDescription>Template salvo com sucesso.</AlertDescription>
          </Alert>
        )}
        {state?.error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-900">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Identificação</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={data.name}
                required
                placeholder="Ex.: Site institucional"
              />
              {state?.fieldErrors?.name && (
                <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                name="category"
                defaultValue={data.category}
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              name="description"
              defaultValue={data.description}
              placeholder="Para quando usar este template..."
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Conteúdo padrão</h2>

          <div className="space-y-1.5">
            <Label htmlFor="titleTemplate">Título da proposta</Label>
            <Input
              id="titleTemplate"
              name="titleTemplate"
              defaultValue={data.titleTemplate}
              placeholder="Ex.: Site institucional para {{cliente.empresa}}"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bodyTemplate">Corpo da proposta</Label>
            <Textarea
              id="bodyTemplate"
              name="bodyTemplate"
              defaultValue={data.bodyTemplate}
              rows={8}
              placeholder="Olá {{cliente.nome}}, esta é nossa proposta para a {{cliente.empresa}}..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notesTemplate">Observações padrão</Label>
            <Textarea
              id="notesTemplate"
              name="notesTemplate"
              defaultValue={data.notesTemplate}
              rows={3}
              placeholder="Condições de pagamento, prazos, etc."
            />
          </div>
        </section>

        <section>
          <ItemsEditor items={items} onChange={setItems} />
          <input type="hidden" name="items" value={JSON.stringify(items)} />
        </section>

        <div className="flex items-center justify-end gap-2 border-t border-ink-line pt-6">
          <Button asChild variant="ghost">
            <Link href={templateId ? `/templates/${templateId}` : '/templates'}>
              Cancelar
            </Link>
          </Button>
          <SubmitButton isEdit={!!templateId} />
        </div>
      </form>

      {/* Sidebar de variáveis */}
      <aside className="space-y-4 lg:sticky lg:top-10 lg:self-start">
        <div className="rounded-lg border border-ink-line bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <Variable className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold tracking-tight">Variáveis disponíveis</h3>
          </div>
          <p className="mb-4 text-xs text-ink-soft">
            Clique para copiar. Cole no título, corpo ou observações.
          </p>
          <div className="space-y-1.5">
            {AVAILABLE_VARIABLES.map((v) => (
              <button
                key={v.token}
                type="button"
                onClick={() => navigator.clipboard?.writeText(v.token)}
                className="group flex w-full items-center justify-between gap-2 rounded-md border border-ink-line bg-bg-alt/30 px-2.5 py-1.5 text-left text-xs transition-colors hover:border-ink-mute hover:bg-bg-alt"
                title="Clique para copiar"
              >
                <code className="font-mono text-[11px] text-accent-hover">{v.token}</code>
                <span className="truncate text-ink-mute group-hover:text-ink">
                  {v.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Save />
      {pending ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar template'}
    </Button>
  );
}
