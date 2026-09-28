import { cn } from '@/lib/utils/cn';

export interface LegendItem {
  label: string;
  color: string;
  shape?: 'dot' | 'square' | 'line';
  value?: string;
}

export function ChartLegend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5', className)}>
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted">
          <span
            className={cn(
              'shrink-0',
              it.shape === 'line' ? 'h-[3px] w-5 rounded-full' : it.shape === 'square' ? 'h-2.5 w-2.5 rounded-[3px]' : 'h-2.5 w-2.5 rounded-full',
            )}
            style={{ background: it.color }}
          />
          <span>{it.label}</span>
          {it.value && <span className="font-bold text-ink">{it.value}</span>}
        </li>
      ))}
    </ul>
  );
}
