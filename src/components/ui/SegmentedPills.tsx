import { cn } from '@/lib/utils/cn';
import type { Option } from './PillSelect';

interface SegmentedPillsProps<T extends string> {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  className?: string;
}

/** Groupe de pilules exclusives (ex. Semaine / Mois / Tout, Tableau / Taskboard). */
export function SegmentedPills<T extends string>({ value, options, onChange, className }: SegmentedPillsProps<T>) {
  return (
    <div role="tablist" className={cn('inline-flex rounded-full bg-white p-1 shadow-card', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-bold transition',
              active ? 'bg-indigo-800 text-white shadow-pill' : 'text-ink-muted hover:text-indigo-800',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
