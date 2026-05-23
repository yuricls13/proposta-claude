'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  Copy,
  ExternalLink,
  PenSquare,
  Send,
  Trash2,
} from 'lucide-react';
import {
  deleteProposalAction,
  sendProposalAction,
} from '@/app/actions/proposals';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { ProposalStatus } from '@/lib/types';
import { isEditable } from '@/lib/status-machine';

interface ProposalActionsProps {
  proposalId: string;
  slug: string;
  status: ProposalStatus;
}

export function ProposalActions({ proposalId, slug, status }: ProposalActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const editable = isEditable(status);
  const canSend = status === 'DRAFT';

  const publicUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/p/${slug}`
      : `/p/${slug}`;

  function copyLink() {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleSend() {
    startTransition(async () => {
      await sendProposalAction(proposalId);
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteProposalAction(proposalId);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {canSend && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={pending}>
              <Send />
              {pending ? 'Enviando...' : 'Enviar proposta'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Enviar esta proposta?</AlertDialogTitle>
              <AlertDialogDescription>
                Ao enviar, o link público fica acessível ao cliente e a proposta sai do
                modo rascunho. Você ainda poderá acompanhar visualizações e aceite.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleSend}>
                Enviar agora
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {editable && (
        <Button
          variant="outline"
          onClick={() => router.push(`/propostas/${proposalId}/editar`)}
        >
          <PenSquare />
          Editar
        </Button>
      )}

      {!canSend && (
        <>
          <Button variant="outline" onClick={copyLink}>
            {copied ? <Check className="text-ok" /> : <Copy />}
            {copied ? 'Link copiado' : 'Copiar link'}
          </Button>
          <Button asChild variant="outline">
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink />
              Abrir página pública
            </a>
          </Button>
        </>
      )}

      {editable && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" disabled={pending}>
              <Trash2 className="text-destructive" />
              <span className="text-destructive">Excluir</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir esta proposta?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Como a proposta ainda está em rascunho
                (e nunca foi enviada), você pode excluí-la com segurança.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Manter</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Excluir definitivamente
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
