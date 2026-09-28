import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART } from '@/lib/utils/labels';
import { axisProps } from './axis';
import { ChartTooltip } from './ChartTooltip';
import { ChartLegend } from './Legend';

export interface AvancementRow {
  name: string;
  avancement: number;
  completion: number;
}

/** Histogramme groupé : avancement moyen vs taux de complétion par membre. */
export function AvancementMembreChart({ data }: { data: AvancementRow[] }) {
  return (
    <div className="flex h-full flex-col">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={3} barCategoryGap="28%" margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={CHART.grid} />
            <XAxis dataKey="name" {...axisProps} interval={0} />
            <YAxis {...axisProps} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
            <Tooltip cursor={{ fill: '#F3F4FD', radius: 8 }} content={<ChartTooltip valueSuffix=" %" />} />
            <Bar dataKey="avancement" name="Avancement moyen" fill={CHART.indigo} radius={[4, 4, 0, 0]} maxBarSize={14} />
            <Bar dataKey="completion" name="Taux de complétion" fill={CHART.coral} radius={[4, 4, 0, 0]} maxBarSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend
        className="mt-3"
        items={[
          { label: 'Avancement moyen', color: CHART.indigo, shape: 'square' },
          { label: 'Taux de complétion', color: CHART.coral, shape: 'square' },
        ]}
      />
    </div>
  );
}
