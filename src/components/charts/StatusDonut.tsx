import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { Tache } from '@/types/database';
import { STATUS_COLORS, STATUS_LABELS, STATUS_ORDER } from '@/lib/utils/labels';
import { ChartTooltip } from './ChartTooltip';
import { ChartLegend } from './Legend';

/** Donut : répartition des tâches par status, % terminé au centre. */
export function StatusDonut({ taches }: { taches: Tache[] }) {
  const total = taches.length;
  const data = STATUS_ORDER.map((s) => ({
    key: s,
    name: STATUS_LABELS[s],
    value: taches.filter((t) => t.status === s).length,
    fill: STATUS_COLORS[s],
  }));
  const done = data.find((d) => d.key === 'done')?.value ?? 0;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="relative mx-auto aspect-square w-full max-w-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.filter((d) => d.value > 0)}
              dataKey="value"
              nameKey="name"
              innerRadius="64%"
              outerRadius="96%"
              startAngle={90}
              endAngle={-270}
              stroke="#fff"
              strokeWidth={3}
              cornerRadius={4}
              isAnimationActive
            >
              {data
                .filter((d) => d.value > 0)
                .map((d) => (
                  <Cell key={d.key} fill={d.fill} />
                ))}
            </Pie>
            <Tooltip content={<ChartTooltip valueSuffix=" tâche(s)" />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-ink">{pct}%</span>
          <span className="text-[11px] font-semibold text-ink-muted">terminées</span>
        </div>
      </div>
      <ChartLegend
        className="mt-4"
        items={data.map((d) => ({ label: d.name, color: d.fill, shape: 'square', value: String(d.value) }))}
      />
    </div>
  );
}
