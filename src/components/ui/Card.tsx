import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Élément en haut à droite (ex. PillSelect « Week ») */
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Décalage d'animation d'apparition, en ms */
  delay?: number;
  hoverable?: boolean;
}

export function Card({ title, subtitle, action, children, className, bodyClassName, delay = 0, hoverable = true }: CardProps) {
  const style: CSSProperties = { animationDelay: `${delay}ms` };
  return (
    <section
      style={style}
      className={cn(
        'flex min-w-0 flex-col rounded-card bg-white p-5 shadow-card animate-fade-up sm:p-6',
        'transition-[box-shadow,transform] duration-300',
        hoverable && 'hover:-translate-y-0.5 hover:shadow-card-hover',
        className,
      )}
    >
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="card-title truncate">{title}</h2>}
            {subtitle && <p className="card-subtitle mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={cn('min-h-0 flex-1', bodyClassName)}>{children}</div>
    </section>
  );
}
