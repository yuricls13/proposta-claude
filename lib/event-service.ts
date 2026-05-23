import { prisma } from './prisma';
import type { EventType } from './types';

export async function recordEvent(
  proposalId: string,
  type: EventType,
  metadata?: Record<string, unknown>,
) {
  return prisma.proposalEvent.create({
    data: {
      proposalId,
      type,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}
