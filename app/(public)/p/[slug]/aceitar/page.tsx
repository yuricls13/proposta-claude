import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { getProposalBySlug } from '@/lib/proposal-service';
import { AcceptanceForm } from '@/components/public-proposal/acceptance-form';
import { formatBRL } from '@/lib/utils';
import { calcItemsTotal } from '@/lib/utils';
import type { ProposalStatus } from '@/lib/types';

interface PageProps {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Aceitar proposta' };

export default async function AceitarPage({ params }: PageProps) {
  const proposal = await getProposalBySlug(params.slug);
  if (!proposal || proposal.status === 'DRAFT') notFound();

  const status = proposal.status as ProposalStatus;
  if (status !== 'SENT' && status !== 'VIEWED') {
    redirect(`/p/${params.slug}`);
  }

  const total = calcItemsTotal(proposal.items);

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-xl px-6 py-10">
        <Link
          href={`/p/${params.slug}`}
          className="inline-flex items-center gap-1 text-sm text-ink-mute hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para a proposta
        </Link>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-mute">
            Confirmação de aceite
          </p>
          <h1 className="mt-2 font-serif text-display-lg text-balance">
            Vamos fechar negócio.
          </h1>
          <p className="mt-2 text-ink-soft">
            Você está prestes a aceitar a proposta{' '}
            <strong className="text-ink">&ldquo;{proposal.title}&rdquo;</strong> no valor de{' '}
            <strong className="text-ink">{formatBRL(total)}</strong>.
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-ink-line bg-white p-6 shadow-soft">
          <AcceptanceForm slug={params.slug} />
        </div>

        <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-ink-mute">
          <ShieldCheck className="h-3.5 w-3.5" />
          Enviaremos um código por e-mail para confirmar o aceite. Tudo registrado com data, horário e IP.
        </p>
      </div>
    </div>
  );
}
