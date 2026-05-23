import {
  CheckCircle2,
  Eye,
  FileEdit,
  FilePlus,
  Send,
  TimerOff,
  XCircle,
} from 'lucide-react';
import { formatDateTimeBR, relativeTime } from '@/lib/utils';
import { EVENT_LABEL, type EventType } from '@/lib/types';

interface EventTimelineProps {
  events: { id: string; type: string; createdAt: Date | string; metadata: string | null }[];
}

const iconByType: Record<EventType, React.ComponentType<{ className?: string }>> = {
  CREATED: FilePlus,
  UPDATED: FileEdit,
  SENT: Send,
  VIEWED: Eye,
  ACCEPTED: CheckCircle2,
  REJECTED: XCircle,
  EXPIRED: TimerOff,
};

const colorByType: Record<EventType, string> = {
  CREATED: 'text-ink-mute bg-bg-alt',
  UPDATED: 'text-ink-mute bg-bg-alt',
  SENT: 'text-accent-hover bg-accent-soft',
  VIEWED: 'text-amber-700 bg-amber-50',
  ACCEPTED: 'text-emerald-700 bg-emerald-50',
  REJECTED: 'text-red-700 bg-red-50',
  EXPIRED: 'text-zinc-600 bg-zinc-100',
};

export function EventTimeline({ events }: EventTimelineProps) {
  if (events.length === 0) {
    return (
      <section className="card-elevated p-6">
        <h2 className="mb-3 font-serif text-lg">Histórico</h2>
        <p className="text-sm text-ink-mute">Sem eventos ainda.</p>
      </section>
    );
  }

  // Mais recente no topo
  const sorted = [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <section className="card-elevated p-6">
      <h2 className="mb-4 font-serif text-lg">Histórico</h2>
      <ol className="relative space-y-4 border-l border-ink-line pl-6">
        {sorted.map((event) => {
          const type = event.type as EventType;
          const Icon = iconByType[type] ?? FilePlus;
          const colors = colorByType[type] ?? colorByType.CREATED;
          return (
            <li key={event.id} className="relative">
              <span
                className={`absolute -left-[34px] grid h-7 w-7 place-items-center rounded-full ${colors}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <p className="text-sm font-medium text-ink">{EVENT_LABEL[type] ?? type}</p>
              <p className="mt-0.5 text-xs text-ink-mute">
                {formatDateTimeBR(event.createdAt)} · {relativeTime(event.createdAt)}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
