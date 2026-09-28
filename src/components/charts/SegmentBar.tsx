import { ChartLegend } from './Legend';

export interface Segment {
  key: string;
  label: string;
  value: number;
  color: string;
}

/** Barre unique empilée (maquette : « Delenit augue »). */
export function SegmentBar({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  return (
    <div>
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full bg-indigo-50">
        {total > 0 &&
          segments
            .filter((s) => s.value > 0)
            .map((s) => (
              <div
                key={s.key}
                title={`${s.label} : ${s.value} (${Math.round((s.value / total) * 100)} %)`}
                className="h-full first:rounded-l-full last:rounded-r-full transition-[width] duration-700"
                style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
              />
            ))}
      </div>
      <ChartLegend
        className="mt-3 !justify-start"
        items={segments.map((s) => ({ label: s.label, color: s.color, shape: 'square', value: String(s.value) }))}
      />
    </div>
  );
}
