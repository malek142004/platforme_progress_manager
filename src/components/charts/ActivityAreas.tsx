import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { CHART } from '@/lib/utils/labels';
import { axisProps } from './axis';
import { ChartTooltip } from './ChartTooltip';

export interface ActivityPoint {
  label: string;
  creees: number;
  terminees: number;
}

function MiniArea({ data, dataKey, name, color, light }: { data: ActivityPoint[]; dataKey: keyof ActivityPoint; name: string; color: string; light: string }) {
  const id = `act-${String(dataKey)}`;
  return (
    <div className="h-[68px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 2, left: 2, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.9} />
              <stop offset="100%" stopColor={light} stopOpacity={0.15} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" {...axisProps} tick={{ ...axisProps.tick, fontSize: 9 }} interval="preserveStartEnd" minTickGap={10} height={16} />
          <Tooltip cursor={{ stroke: CHART.indigoLight, strokeDasharray: '4 4' }} content={<ChartTooltip />} />
          <Area type="monotone" dataKey={dataKey} name={name} stroke={color} strokeWidth={2} fill={`url(#${id})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Deux aires dégradées superposées (maquette : « Commodo ») : créées (indigo) / terminées (corail). */
export function ActivityAreas({ data }: { data: ActivityPoint[] }) {
  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-[11px] font-bold text-ink-soft"><span className="h-2 w-2 rounded-full bg-indigo-600" />Tâches créées</p>
      <MiniArea data={data} dataKey="creees" name="Créées" color={CHART.indigo} light={CHART.indigoLight} />
      <p className="flex items-center gap-1.5 pt-1 text-[11px] font-bold text-ink-soft"><span className="h-2 w-2 rounded-full bg-coral-600" />Tâches terminées</p>
      <MiniArea data={data} dataKey="terminees" name="Terminées" color={CHART.coral} light={CHART.coralLight} />
    </div>
  );
}
