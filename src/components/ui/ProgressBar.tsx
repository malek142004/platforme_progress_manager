import { cn } from '@/lib/utils/cn';

interface ProgressBarProps {
  value: number;
  tone?: 'indigo' | 'coral' | 'lilac' | 'auto';
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

const FILL = {
  indigo: 'bg-gradient-to-r from-indigo-600 to-indigo-400',
  coral: 'bg-gradient-to-r from-coral-600 to-coral-400',
  lilac: 'bg-indigo-400',
};

const HEIGHT = { xs: 'h-1.5', sm: 'h-2', md: 'h-2.5' };

/** Barre de progression fine et arrondie. tone="auto" : corail < 40 %, indigo sinon. */
export function ProgressBar({ value, tone = 'indigo', size = 'sm', showLabel, className }: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, Math.round(value || 0)));
  const resolved = tone === 'auto' ? (v < 40 ? 'coral' : 'indigo') : tone;
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn('relative flex-1 overflow-hidden rounded-full bg-indigo-50', HEIGHT[size])}
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-700 ease-out', FILL[resolved])}
          style={{ width: `${v}%` }}
        />
      </div>
      {showLabel && <span className="w-9 shrink-0 text-right text-xs font-bold text-ink-soft">{v}%</span>}
    </div>
  );
}
