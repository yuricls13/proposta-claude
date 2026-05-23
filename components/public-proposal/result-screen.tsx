import { CheckCircle2, TimerOff, XCircle } from 'lucide-react';
import { formatDateTimeBR } from '@/lib/utils';
import type { ProposalStatus } from '@/lib/types';

interface ResultScreenProps {
  status: ProposalStatus;
  acceptance: { name: string; acceptedAt: Date } | null;
  rejection: { rejectedAt: Date; reason: string | null } | null;
}

export function ResultScreen({ status, acceptance, rejection }: ResultScreenProps) {
  if (status === 'ACCEPTED' && acceptance) {
    return (
      <section className="border-b border-emerald-200 bg-emerald-50">
        <div className="mx-auto flex max-w-editorial items-start gap-4 px-6 py-6">
          <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" />
          <div>
            <p className="font-serif text-lg text-emerald-900">
              Proposta aceita
            </p>
            <p className="mt-0.5 text-sm text-emerald-800">
              Confirmada por <strong>{acceptance.name}</strong> em{' '}
              {formatDateTimeBR(acceptance.acceptedAt)}.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (status === 'REJECTED' && rejection) {
    return (
      <section className="border-b border-red-200 bg-red-50">
        <div className="mx-auto flex max-w-editorial items-start gap-4 px-6 py-6">
          <XCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
          <div>
            <p className="font-serif text-lg text-red-900">Proposta recusada</p>
            <p className="mt-0.5 text-sm text-red-800">
              Em {formatDateTimeBR(rejection.rejectedAt)}.
            </p>
            {rejection.reason && (
              <p className="mt-2 text-sm italic text-red-800/80">
                &ldquo;{rejection.reason}&rdquo;
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (status === 'EXPIRED') {
    return (
      <section className="border-b border-zinc-200 bg-zinc-100/60">
        <div className="mx-auto flex max-w-editorial items-start gap-4 px-6 py-6">
          <TimerOff className="mt-0.5 h-6 w-6 flex-shrink-0 text-zinc-600" />
          <div>
            <p className="font-serif text-lg text-zinc-900">
              Proposta expirada
            </p>
            <p className="mt-0.5 text-sm text-zinc-700">
              A data de validade desta proposta passou. Entre em contato com quem a enviou
              para renová-la.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return null;
}
