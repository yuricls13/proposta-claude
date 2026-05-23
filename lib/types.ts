// Status & Event types — strings literais (SQLite não suporta enums nativos).

export const PROPOSAL_STATUS = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  VIEWED: 'VIEWED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
} as const;

export type ProposalStatus = (typeof PROPOSAL_STATUS)[keyof typeof PROPOSAL_STATUS];

export const PROPOSAL_STATUSES: ProposalStatus[] = [
  'DRAFT',
  'SENT',
  'VIEWED',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
];

export const EVENT_TYPE = {
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  SENT: 'SENT',
  VIEWED: 'VIEWED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
} as const;

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];

export function isProposalStatus(value: string): value is ProposalStatus {
  return PROPOSAL_STATUSES.includes(value as ProposalStatus);
}

export const STATUS_LABEL: Record<ProposalStatus, string> = {
  DRAFT: 'Rascunho',
  SENT: 'Enviada',
  VIEWED: 'Visualizada',
  ACCEPTED: 'Aceita',
  REJECTED: 'Recusada',
  EXPIRED: 'Expirada',
};

export const EVENT_LABEL: Record<EventType, string> = {
  CREATED: 'Proposta criada',
  UPDATED: 'Proposta editada',
  SENT: 'Proposta enviada',
  VIEWED: 'Proposta visualizada',
  ACCEPTED: 'Proposta aceita',
  REJECTED: 'Proposta recusada',
  EXPIRED: 'Proposta expirada',
};
