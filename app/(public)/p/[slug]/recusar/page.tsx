import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getProposalBySlug } from '@/lib/proposal-service';
import { RejectionForm } from '@/components/public-proposal/rejection-form';
import type { ProposalStatus } from '@/lib/types';

interface PageProps {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Recusar proposta' };

export default async function RecusarPage({ params }: PageProps) {
  const proposal = await getProposalBySlug(params.slug);
  if (!proposal || proposal.status === 'DRAFT') notFound();

  const status = proposal.status as ProposalStatus;
  if (status !== 'SENT' && status !== 'VIEWED') {
    redirect(`/p/${params.slug}`);
  }

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
            Recusar proposta
          </p>
          <h1 className="mt-2 font-serif text-display-lg text-balance">
            Outro momento, talvez?
          </h1>
          <p className="mt-2 text-ink-soft">
            Sem problemas. Se quiser, deixe um motivo rápido — isso ajuda quem te enviou
            a melhorar.
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-ink-line bg-white p-6 shadow-soft">
          <RejectionForm slug={params.slug} />
        </div>
      </div>
    </div>
  );
}
