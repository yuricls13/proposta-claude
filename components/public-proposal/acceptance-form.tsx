'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, Check, MailCheck } from 'lucide-react';
import {
  requestAcceptanceCodeAction,
  verifyAcceptanceCodeAction,
  type AcceptanceState,
} from '@/app/actions/acceptance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AcceptanceFormProps {
  slug: string;
}

export function AcceptanceForm({ slug }: AcceptanceFormProps) {
  const requestAction = requestAcceptanceCodeAction.bind(null, slug);
  const [requestState, requestFormAction] = useFormState<
    AcceptanceState | undefined,
    FormData
  >(requestAction, undefined);

  const [doc, setDoc] = useState('');

  if (requestState?.step === 'verify' && requestState.pendingEmail) {
    return (
      <VerifyStep
        slug={slug}
        email={requestState.pendingEmail}
      />
    );
  }

  return (
    <form action={requestFormAction} className="space-y-5">
      {requestState?.error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{requestState.error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">
          Nome completo<span className="ml-0.5 text-destructive">*</span>
        </Label>
        <Input id="name" name="name" required placeholder="Como você assinaria um contrato" />
        {requestState?.fieldErrors?.name && (
          <p className="text-xs text-destructive">{requestState.fieldErrors.name}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">
          E-mail<span className="ml-0.5 text-destructive">*</span>
        </Label>
        <Input id="email" name="email" type="email" required placeholder="seu@email.com" />
        {requestState?.fieldErrors?.email && (
          <p className="text-xs text-destructive">{requestState.fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="document">
          CPF ou CNPJ <span className="font-normal text-ink-mute">(opcional)</span>
        </Label>
        <Input
          id="document"
          name="document"
          inputMode="numeric"
          value={doc}
          onChange={(e) => setDoc(e.target.value.replace(/[^0-9./-]/g, ''))}
          placeholder="000.000.000-00 ou 00.000.000/0000-00"
        />
        {requestState?.fieldErrors?.document && (
          <p className="text-xs text-destructive">{requestState.fieldErrors.document}</p>
        )}
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-ink-line bg-bg-alt/40 p-3 text-sm">
        <input
          type="checkbox"
          name="confirmed"
          required
          className="mt-0.5 h-4 w-4 rounded border-ink-line text-accent focus:ring-accent"
        />
        <span className="text-ink-soft">
          Confirmo que li e aceito os termos desta proposta. Estou ciente que esta
          confirmação será registrada com data, horário e IP.
        </span>
      </label>

      <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
        <Button asChild variant="ghost">
          <Link href={`/p/${slug}`}>Cancelar</Link>
        </Button>
        <RequestButton />
      </div>
    </form>
  );
}

function RequestButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <MailCheck />
      {pending ? 'Enviando código...' : 'Continuar'}
      {!pending && <ArrowRight />}
    </Button>
  );
}

function VerifyStep({ slug, email }: { slug: string; email: string }) {
  const verifyAction = verifyAcceptanceCodeAction.bind(null, slug);
  const [verifyState, verifyFormAction] = useFormState<
    AcceptanceState | undefined,
    FormData
  >(verifyAction, undefined);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        <MailCheck className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div>
          <p className="font-medium">Código enviado para {email}</p>
          <p className="mt-0.5 text-xs text-emerald-800/80">
            Confira sua caixa de entrada (e a pasta de spam) e cole o código de 6 dígitos
            abaixo. Em ambiente de dev, o código aparece no terminal do servidor.
          </p>
        </div>
      </div>

      <form action={verifyFormAction} className="space-y-5">
        <input type="hidden" name="email" value={email} />

        {verifyState?.error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-900">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{verifyState.error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="code">Código de 6 dígitos</Label>
          <Input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="\d{6}"
            required
            placeholder="000000"
            className="text-center font-mono text-2xl tracking-[0.5em] h-14"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
          <Button asChild variant="ghost">
            <Link href={`/p/${slug}`}>Cancelar</Link>
          </Button>
          <VerifyButton />
        </div>
      </form>
    </div>
  );
}

function VerifyButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Check />
      {pending ? 'Confirmando...' : 'Confirmar aceite'}
    </Button>
  );
}
