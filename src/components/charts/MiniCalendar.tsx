import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Tache } from '@/types/database';
import { cn } from '@/lib/utils/cn';
import { isUrgent, joursRestants, toDate } from '@/lib/utils/dates';

const WEEKDAYS = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

/** Mini-calendrier mensuel : deadlines cerclées (corail = en retard ou ≤ 2 j, indigo = à venir). */
export function MiniCalendar({ taches }: { taches: Tache[] }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<Date | null>(null);
  const today = new Date();

  const byDay = useMemo(() => {
    const map = new Map<string, Tache[]>();
    for (const t of taches) {
      const d = toDate(t.deadline);
      if (!d) continue;
      const key = format(d, 'yyyy-MM-dd');
      map.set(key, [...(map.get(key) ?? []), t]);
    }
    return map;
  }, [taches]);

  const days = eachDayOfInterval({
    start: startOfWeek(month, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });

  const selectedTasks = selected ? byDay.get(format(selected, 'yyyy-MM-dd')) ?? [] : [];

  return (
    <div>
      <div className="mb-3 flex items-center justify-center gap-4">
        <button
          onClick={() => setMonth((m) => addMonths(m, -1))}
          aria-label="Mois précédent"
          className="rounded-full p-1 text-coral-600 transition hover:bg-coral-50"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
        </button>
        <span className="min-w-[120px] text-center text-sm font-bold capitalize text-ink">
          {format(month, 'LLLL yyyy', { locale: fr })}
        </span>
        <button
          onClick={() => setMonth((m) => addMonths(m, 1))}
          aria-label="Mois suivant"
          className="rounded-full p-1 text-coral-600 transition hover:bg-coral-50"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((d) => (
          <span key={d} className="pb-1 text-[11px] font-semibold text-ink-muted">
            {d}
          </span>
        ))}
        {days.map((day) => {
          const inMonth = isSameMonth(day, month);
          const tasks = byDay.get(format(day, 'yyyy-MM-dd')) ?? [];
          const open = tasks.filter((t) => t.status !== 'done');
          const hot = open.some((t) => isUrgent(joursRestants(t.deadline, today)));
          const isToday = isSameDay(day, today);
          const isSel = selected && isSameDay(day, selected);
          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={!inMonth}
              onClick={() => setSelected(isSel ? null : day)}
              title={tasks.length ? tasks.map((t) => `• ${t.titre}`).join('\n') : undefined}
              className={cn(
                'mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold transition',
                !inMonth && 'invisible',
                isToday ? 'bg-indigo-800 text-white' : 'text-ink-soft hover:bg-lavender',
                tasks.length > 0 && !isToday && (hot ? 'ring-[1.5px] ring-coral-600' : open.length ? 'ring-[1.5px] ring-indigo-600' : 'ring-1 ring-indigo-200'),
                isSel && 'bg-indigo-50',
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-3 rounded-2xl bg-lavender-soft p-3 animate-fade-up">
          <p className="mb-1.5 text-[11px] font-bold text-ink-soft">{format(selected, 'EEEE d MMMM', { locale: fr })}</p>
          {selectedTasks.length === 0 ? (
            <p className="text-xs text-ink-muted">Aucune deadline ce jour.</p>
          ) : (
            <ul className="space-y-1">
              {selectedTasks.slice(0, 4).map((t) => (
                <li key={t.id} className="truncate text-xs text-ink">
                  • {t.titre}
                </li>
              ))}
              {selectedTasks.length > 4 && <li className="text-xs text-ink-muted">+ {selectedTasks.length - 4} autre(s)</li>}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
