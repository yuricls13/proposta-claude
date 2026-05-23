'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Save } from 'lucide-react';
import {
  createProposalAction,
  updateProposalAction,
  type ProposalFormState,
} from '@/app/actions/proposals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ItemsEditor, type ItemDraft } from './items-editor';

interface ProposalFormProps {
  proposalId?: string;
  templateId?: string;
  initial?: {
    title: string;
    description: string;
    clientName: string;
    clientEmail: string;
    clientCompany: string;
    validUntil: string;
    notes: string;
    items: ItemDraft[];
  };
}

const blankInitial = {
  title: '',
  description: '',
  clientName: '',
  clientEmail: '',
  clientCompany: '',
  validUntil: '',
  notes: '',
  items: [{ description: '', quantity: 1, unitPrice: 0 }] as ItemDraft[],
};

export function ProposalForm({ proposalId, templateId, initial }: ProposalFormProps) {
  const data = initial ?? blankInitial;
  const [items, setItems] = useState<ItemDraft[]>(data.items);

  const action = proposalId
    ? updateProposalAction.bind(null, proposalId)
    : createProposalAction;

  const [state, formAction] = useFormState<ProposalFormState | undefined, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-10">
      {templateId && <input type="hidden" name="templateId" value={templateId} />}
      {state?.error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          Informações da proposta
        </h2>
        <Field
          label="Título"
          name="title"
          defaultValue={data.title}
          placeholder="Ex.: Desenvolvimento de site institucional"
          error={state?.fieldErrors?.title}
          required
        />
        <div className="space-y-1.5">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={data.description}
            placeholder="Descreva o escopo da proposta, o que está incluso, condições..."
            rows={5}
          />
          {state?.fieldErrors?.description && (
            <p className="text-xs text-destructive">{state.fieldErrors.description}</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Cliente</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Nome"
            name="clientName"
            defaultValue={data.clientName}
            placeholder="Nome do contato"
            error={state?.fieldErrors?.clientName}
            required
          />
          <Field
            label="Empresa"
            name="clientCompany"
            defaultValue={data.clientCompany}
            placeholder="Nome da empresa (opcional)"
            error={state?.fieldErrors?.clientCompany}
          />
        </div>
        <Field
          label="E-mail"
          name="clientEmail"
          type="email"
          defaultValue={data.clientEmail}
          placeholder="cliente@empresa.com"
          error={state?.fieldErrors?.clientEmail}
        />
      </section>

      <section>
        <ItemsEditor items={items} onChange={setItems} errors={state?.fieldErrors} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Detalhes</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Validade"
            name="validUntil"
            type="date"
            defaultValue={data.validUntil}
            error={state?.fieldErrors?.validUntil}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={data.notes}
            placeholder="Termos, condições especiais, prazos de execução..."
            rows={4}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-ink-line pt-6">
        <Button asChild variant="ghost">
          <Link href={proposalId ? `/propostas/${proposalId}` : '/propostas'}>
            Cancelar
          </Link>
        </Button>
        <SubmitButton isEdit={!!proposalId} />
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  placeholder,
  error,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Save />
      {pending ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar proposta'}
    </Button>
  );
}
