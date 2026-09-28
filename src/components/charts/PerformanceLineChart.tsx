import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART } from '@/lib/utils/labels';
import type { SeriesPoint } from '@/lib/utils/stats';
import { axisProps } from './axis';
import { ChartTooltip } from './ChartTooltip';
import { ChartLegend } from './Legend';

export interface Series {
  key: string;
  name: string;
  color: string;
}

interface Props {
  data: SeriesPoint[];
  series: Series[];
  valueSuffix?: string;
  height?: number;
  /** Aire dégradée sous la première série (comme la maquette) */
  area?: boolean;
  allowDecimals?: boolean;
}

/** Courbes lissées (monotone) multi-séries avec points cerclés. */
export function PerformanceLineChart({ data, series, valueSuffix = '', height = 240, area = true, allowDecimals = false }: Props) {
  const showDots = data.length <= 16;
  const gradientId = `area-${series[0]?.key ?? 'x'}`;

  return (
    <div className="flex flex-col">
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={series[0]?.color ?? CHART.indigo} stopOpacity={0.28} />
                <stop offset="100%" stopColor={series[0]?.color ?? CHART.indigo} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={CHART.grid} />
            <XAxis dataKey="label" {...axisProps} minTickGap={24} interval="preserveStartEnd" />
            <YAxis {...axisProps} allowDecimals={allowDecimals} />
            <Tooltip
              cursor={{ stroke: CHART.indigoLight, strokeWidth: 1, strokeDasharray: '4 4' }}
              content={<ChartTooltip valueSuffix={valueSuffix} />}
            />
            {area && series[0] && (
              <Area
                type="monotone"
                dataKey={series[0].key}
                stroke="none"
                fill={`url(#${gradientId})`}
                tooltipType="none"
                isAnimationActive
                activeDot={false}
              />
            )}
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={2.5}
                dot={showDots ? { r: 4, fill: '#fff', stroke: s.color, strokeWidth: 2 } : false}
                activeDot={{ r: 6, fill: '#fff', stroke: s.color, strokeWidth: 2.5 }}
                connectNulls
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {series.length > 1 && (
        <ChartLegend className="mt-3" items={series.map((s) => ({ label: s.name, color: s.color, shape: 'line' }))} />
      )}
    </div>
  );
}
