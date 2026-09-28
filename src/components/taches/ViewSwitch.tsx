import { useNavigate } from 'react-router-dom';
import { KanbanSquare, Table2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/** Bascule bien visible Tableau ⇄ Taskboard (mêmes données). */
export function ViewSwitch({ current }: { current: 'table' | 'board' }) {
  const navigate = useNavigate();
  const items = [
    { key: 'table' as const, label: 'Tableau', icon: Table2, to: '/weekly' },
    { key: 'board' as const, label: 'Taskboard', icon: KanbanSquare, to: '/taskboard' },
  ];
  return (
    <div role="tablist" className="inline-flex rounded-full bg-white p-1 shadow-card">
      {items.map(({ key, label, icon: Icon, to }) => {
        const active = key === current;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={active}
            onClick={() => !active && navigate(to)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition',
              active ? 'bg-indigo-800 text-white shadow-pill' : 'text-ink-muted hover:text-indigo-800',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
