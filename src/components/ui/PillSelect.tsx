import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface Option<T extends string = string> {
  value: T;
  label: string;
}

interface PillSelectProps<T extends string> {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  className?: string;
  'aria-label'?: string;
}

/** Sélecteur déroulant pilule (« Week », « All time », « Month » de la maquette). */
export function PillSelect<T extends string>({ value, options, onChange, className, ...rest }: PillSelectProps<T>) {
  return (
    <div className={cn('relative inline-flex', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label={rest['aria-label']}
        className={cn(
          'h-7 cursor-pointer appearance-none rounded-full border border-ink-line bg-white pl-3.5 pr-8',
          'text-xs font-semibold text-ink-muted outline-none transition',
          'hover:border-indigo-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100',
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
    </div>
  );
}
