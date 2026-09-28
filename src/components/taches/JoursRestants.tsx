import { cn } from '@/lib/utils/cn';
import { isUrgent, joursLabel, joursRestants } from '@/lib/utils/dates';
import type { StatusTache } from '@/types/database';

/** Jours restants (deadline − aujourd'hui), en rouge si négatif ou ≤ 2. */
export function JoursRestants({ deadline, status, className }: { deadline: string | null; status?: StatusTache; className?: string }) {
  if (status === 'done') return <span className={cn('text-xs font-semibold text-ink-muted', className)}>Terminée</span>;
  const j = joursRestants(deadline);
  return (
    <span
      className={cn(
        'whitespace-nowrap text-xs font-bold tabular-nums',
        j === null ? 'text-ink-muted' : isUrgent(j) ? 'text-[#D9412E]' : 'text-ink-soft',
        className,
      )}
    >
      {joursLabel(j)}
    </span>
  );
}
