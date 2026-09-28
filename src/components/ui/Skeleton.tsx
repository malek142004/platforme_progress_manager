import { cn } from '@/lib/utils/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-xl bg-[length:800px_100%]',
        'bg-[linear-gradient(90deg,#EFEFFD_0%,#F7F7FE_40%,#EFEFFD_80%)]',
        className,
      )}
    />
  );
}

/** Squelette d'une carte complète (titre + zone de contenu). */
export function CardSkeleton({ className, lines = 0 }: { className?: string; lines?: number }) {
  return (
    <div className={cn('rounded-card bg-white p-6 shadow-card', className)}>
      <Skeleton className="mb-2 h-4 w-32" />
      <Skeleton className="mb-5 h-3 w-20" />
      {lines > 0 ? (
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} className="h-3" />
          ))}
        </div>
      ) : (
        <Skeleton className="h-40 w-full rounded-2xl" />
      )}
    </div>
  );
}
