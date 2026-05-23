import { cn } from '@/lib/utils';
import { STATUS_LABEL, type ProposalStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: ProposalStatus | string;
  className?: string;
  pulse?: boolean;
}

const statusClasses: Record<ProposalStatus, string> = {
  DRAFT: 'badge-draft',
  SENT: 'badge-sent',
  VIEWED: 'badge-viewed',
  ACCEPTED: 'badge-accepted',
  REJECTED: 'badge-rejected',
  EXPIRED: 'badge-expired',
};

const pulseStatuses: ProposalStatus[] = ['SENT', 'VIEWED'];

export function StatusBadge({ status, className, pulse }: StatusBadgeProps) {
  const safeStatus = (status as ProposalStatus) in statusClasses
    ? (status as ProposalStatus)
    : 'DRAFT';
  const shouldPulse = pulse ?? pulseStatuses.includes(safeStatus);
  return (
    <span className={cn('badge-status', statusClasses[safeStatus], className)}>
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full bg-current',
          shouldPulse ? 'animate-breathe' : 'opacity-70',
        )}
      />
      {STATUS_LABEL[safeStatus]}
    </span>
  );
}
