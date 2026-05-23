import type { ProposalStatus } from './types';

const transitions: Record<ProposalStatus, ProposalStatus[]> = {
  DRAFT: ['SENT'],
  SENT: ['VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
  VIEWED: ['ACCEPTED', 'REJECTED', 'EXPIRED'],
  ACCEPTED: [],
  REJECTED: [],
  EXPIRED: [],
};

export function canTransition(from: ProposalStatus, to: ProposalStatus): boolean {
  return transitions[from]?.includes(to) ?? false;
}

export function assertTransition(from: ProposalStatus, to: ProposalStatus) {
  if (!canTransition(from, to)) {
    throw new Error(
      `Transição de status inválida: ${from} → ${to}. Esta proposta não pode ir para este estado.`,
    );
  }
}

export function isTerminal(status: ProposalStatus): boolean {
  return ['ACCEPTED', 'REJECTED', 'EXPIRED'].includes(status);
}

export function isEditable(status: ProposalStatus): boolean {
  return status === 'DRAFT';
}

export function isPublic(status: ProposalStatus): boolean {
  return status !== 'DRAFT';
}
