'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { AlertCircle, XCircle } from 'lucide-react';
import {
  rejectProposalAction,
  type AcceptanceState,
} from '@/app/actions/acceptance';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RejectionFormProps {
  slug: string;
}

export function RejectionForm({ slug }: RejectionFormProps) {
  const action = rejectProposalAction.bind(null, slug);
  const [state, formAction] = useFormState<AcceptanceState | undefined, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="reason">
          Motivo <span className="font-normal text-ink-mute">(opcional)</span>
        </Label>
        <Textarea
          id="reason"
          name="reason"
          rows={5}
          placeholder="Conte rapidamente o que pesou nessa decisão. Sua resposta ajuda quem enviou."
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button asChild variant="ghost">
          <Link href={`/p/${slug}`}>Voltar</Link>
        </Button>
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      <XCircle />
      {pending ? 'Enviando...' : 'Recusar proposta'}
    </Button>
  );
}
