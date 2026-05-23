import { prisma } from './prisma';
import { recordEvent } from './event-service';
import type { ProposalStatus } from './types';

const publicProposalInclude = {
  items: { orderBy: { order: 'asc' } },
  workspace: {
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      accentColor: true,
      fontPair: true,
    },
  },
  acceptance: true,
  rejection: true,
} as const;

export async function getPublicProposalWithTracking(slug: string) {
  const proposal = await prisma.proposal.findUnique({
    where: { slug },
    include: publicProposalInclude,
  });

  if (!proposal) return null;
  if (proposal.status === 'DRAFT') return null;

  const status = proposal.status as ProposalStatus;
  const now = new Date();

  // Expiração automática
  if (
    proposal.validUntil &&
    proposal.validUntil < now &&
    (status === 'SENT' || status === 'VIEWED')
  ) {
    const updated = await prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: 'EXPIRED' },
      include: publicProposalInclude,
    });
    await recordEvent(proposal.id, 'EXPIRED');
    return updated;
  }

  // Tracking visualização
  if (status === 'SENT' || status === 'VIEWED') {
    const isFirst = !proposal.firstViewedAt;
    const nextStatus: ProposalStatus = 'VIEWED';

    const updated = await prisma.proposal.update({
      where: { id: proposal.id },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: now,
        firstViewedAt: isFirst ? now : undefined,
        status: status === 'SENT' ? nextStatus : undefined,
      },
      include: publicProposalInclude,
    });

    await recordEvent(proposal.id, 'VIEWED', { viewNumber: updated.viewCount });
    return updated;
  }

  return proposal;
}

export async function getProposalBySlug(slug: string) {
  return prisma.proposal.findUnique({
    where: { slug },
    include: publicProposalInclude,
  });
}
