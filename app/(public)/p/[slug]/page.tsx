import { notFound } from 'next/navigation';
import { getPublicProposalWithTracking } from '@/lib/proposal-service';
import { PublicProposalView } from '@/components/public-proposal/proposal-view';

interface PageProps {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps) {
  const proposal = await getPublicProposalWithTracking(params.slug);
  if (!proposal) return { title: 'Proposta não encontrada' };
  return {
    title: proposal.title,
    description:
      proposal.description?.slice(0, 160) ||
      `Proposta para ${proposal.clientName}`,
  };
}

export default async function PublicProposalPage({ params }: PageProps) {
  const proposal = await getPublicProposalWithTracking(params.slug);
  if (!proposal) notFound();

  return <PublicProposalView proposal={proposal} />;
}
