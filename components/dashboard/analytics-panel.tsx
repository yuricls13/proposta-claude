import { BarChart3, Clock, Eye, Users } from 'lucide-react';
import { prisma } from '@/lib/prisma';

interface AnalyticsPanelProps {
  proposalId: string;
  viewCount: number;
  firstViewedAt: Date | null;
}

const SECTION_LABELS: Record<string, string> = {
  hero: 'Topo (cliente + título)',
  description: 'Descrição & contexto',
  items: 'Escopo & investimento',
  notes: 'Observações',
  cta: 'Botão de aceite',
};

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return rem === 0 ? `${minutes}min` : `${minutes}min ${rem}s`;
}

export async function AnalyticsPanel({
  proposalId,
  viewCount,
  firstViewedAt,
}: AnalyticsPanelProps) {
  // Agrega tempo por seção e maior scroll depth
  const sectionAgg = await prisma.proposalSectionView.groupBy({
    by: ['section'],
    where: { proposalId },
    _sum: { timeSpent: true },
    _avg: { scrollDepth: true },
    _max: { scrollDepth: true },
    _count: { _all: true },
  });

  // Sessões únicas
  const sessions = await prisma.proposalSectionView.findMany({
    where: { proposalId },
    select: { sessionId: true },
    distinct: ['sessionId'],
  });

  const totalTime = sectionAgg.reduce((sum, s) => sum + (s._sum.timeSpent ?? 0), 0);
  const maxScrollOverall = sectionAgg.reduce(
    (max, s) => Math.max(max, s._max.scrollDepth ?? 0),
    0,
  );

  const orderedSections = ['hero', 'description', 'items', 'notes', 'cta'];
  const sectionMap = new Map(sectionAgg.map((s) => [s.section, s]));

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute">
          Analytics
        </h2>
        {totalTime === 0 && viewCount > 0 && (
          <span className="text-xs text-ink-mute">
            Dados granulares aparecem após primeira visita pós-deploy
          </span>
        )}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <AnalyticsTile
          icon={<Eye className="h-4 w-4" />}
          label="Visualizações"
          value={String(viewCount)}
        />
        <AnalyticsTile
          icon={<Users className="h-4 w-4" />}
          label="Visitantes únicos"
          value={String(sessions.length)}
          hint={sessions.length > 0 ? 'sessões distintas' : '—'}
        />
        <AnalyticsTile
          icon={<Clock className="h-4 w-4" />}
          label="Tempo total na página"
          value={totalTime > 0 ? formatDuration(totalTime) : '—'}
        />
        <AnalyticsTile
          icon={<BarChart3 className="h-4 w-4" />}
          label="Scroll máximo"
          value={maxScrollOverall > 0 ? `${maxScrollOverall}%` : '—'}
        />
      </div>

      {totalTime > 0 ? (
        <div className="overflow-hidden rounded-lg border border-ink-line bg-white">
          <table className="w-full text-sm">
            <thead className="bg-bg-alt/40 text-xs uppercase tracking-wider text-ink-mute">
              <tr>
                <th className="px-5 py-2 text-left font-medium">Seção</th>
                <th className="px-5 py-2 text-right font-medium">Tempo total</th>
                <th className="px-5 py-2 text-right font-medium">Atenção</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-line">
              {orderedSections.map((sec) => {
                const data = sectionMap.get(sec);
                if (!data) return null;
                const time = data._sum.timeSpent ?? 0;
                const pct = totalTime > 0 ? (time / totalTime) * 100 : 0;
                return (
                  <tr key={sec}>
                    <td className="px-5 py-3 text-ink">
                      {SECTION_LABELS[sec] ?? sec}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-ink-soft">
                      {formatDuration(time)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-bg-alt">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-10 text-right font-mono text-xs text-ink-mute">
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-ink-line p-6 text-center text-sm text-ink-mute">
          {viewCount === 0
            ? 'Sem visualizações ainda. Envie o link para o cliente para começar a coletar dados.'
            : 'Aguardando primeira sessão registrada com tracking ativo.'}
        </div>
      )}

      {firstViewedAt && (
        <p className="mt-3 text-xs text-ink-mute">
          Tracking ativo desde {firstViewedAt.toLocaleString('pt-BR')}
        </p>
      )}
    </section>
  );
}

function AnalyticsTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-ink-line bg-white p-4">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.12em] text-ink-mute">{label}</span>
        <span className="text-ink-mute">{icon}</span>
      </div>
      <p className="font-mono text-lg font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-mute">{hint}</p>}
    </div>
  );
}
