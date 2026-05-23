import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function KpiCard({ label, value, hint, icon, className }: KpiCardProps) {
  return (
    <div className={cn('card-elevated p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.14em] text-ink-mute">{label}</p>
        {icon && <div className="text-ink-mute">{icon}</div>}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-ink tabular-nums">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-mute">{hint}</p>}
    </div>
  );
}
