import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import type { Tone } from '@/lib/utils/labels';

const TONES: Record<Tone, string> = {
  indigo: 'bg-indigo-800 text-white',
  indigoSoft: 'bg-indigo-100 text-indigo-800',
  lilac: 'bg-indigo-50 text-indigo-600',
  coral: 'bg-coral-600 text-white',
  coralSoft: 'bg-coral-50 text-coral-600',
  neutral: 'bg-lavender text-ink-soft',
  danger: 'bg-coral-600/15 text-[#D9612E] ring-1 ring-inset ring-coral-600/30',
};

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}

export function Badge({ tone = 'neutral', children, dot, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold',
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}
