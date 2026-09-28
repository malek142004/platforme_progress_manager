import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Membre, Tache } from '@/types/database';
import {
  PRIORITE_COLORS,
  PRIORITE_LABELS,
  PRIORITE_ORDER,
  RISQUE_COLORS,
  RISQUE_LABELS,
  RISQUE_ORDER,
} from '@/lib/utils/labels';
import { firstName } from '@/lib/utils/stats';
import { axisProps } from './axis';
import { ChartTooltip } from './ChartTooltip';
import { ChartLegend } from './Legend';

export type StackMode = 'priorite' | 'risque';

/** Barres horizontales empilées : répartition par priorité ou par risque, par membre. */
export function StackedMembreBars({ taches, membres, mode }: { taches: Tache[]; membres: Membre[]; mode: StackMode }) {
  const keys = mode === 'priorite' ? PRIORITE_ORDER : RISQUE_ORDER;
  const labels: Record<string, string> = mode === 'priorite' ? PRIORITE_LABELS : RISQUE_LABELS;
  const colors: Record<string, string> = mode === 'priorite' ? PRIORITE_COLORS : RISQUE_COLORS;

  const data = membres.map((m) => {
    const own = taches.filter((t) => t.membre_id === m.id);
    const row: Record<string, string | number> = { name: firstName(m) };
    for (const k of keys) row[k] = own.filter((t) => (mode === 'priorite' ? t.priorite : t.risque) === k).length;
    return row;
  });

  return (
    <div className="flex h-full flex-col">
      <div style={{ height: Math.max(160, membres.length * 34) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barCategoryGap="30%" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
            <XAxis type="number" hide allowDecimals={false} domain={[0, 'dataMax']} />
            <YAxis type="category" dataKey="name" {...axisProps} width={72} />
            <Tooltip cursor={{ fill: '#F3F4FD' }} content={<ChartTooltip valueSuffix=" tâche(s)" />} />
            {keys.map((k) => (
              <Bar
                key={k}
                dataKey={k}
                name={labels[k]}
                stackId="a"
                fill={colors[k]}
                stroke="#fff"
                strokeWidth={2}
                radius={4}
                maxBarSize={16}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend className="mt-3" items={keys.map((k) => ({ label: labels[k], color: colors[k], shape: 'square' }))} />
    </div>
  );
}
