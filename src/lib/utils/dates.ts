import {
  differenceInCalendarDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Tache } from '@/types/database';

export type Periode = 'week' | 'month' | 'all';

export const PERIODE_OPTIONS: { value: Periode; label: string }[] = [
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'all', label: 'Tout' },
];

export interface Range {
  start: Date;
  end: Date;
}

export function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = parseISO(value);
  return isValid(d) ? d : null;
}

/** Jours restants avant la deadline (négatif = en retard), calculé côté frontend. */
export function joursRestants(deadline?: string | null, now = new Date()): number | null {
  const d = toDate(deadline);
  return d ? differenceInCalendarDays(d, now) : null;
}

/** Rouge si en retard ou deadline ≤ 2 jours. */
export const isUrgent = (jours: number | null) => jours !== null && jours <= 2;

export function isEnRetard(t: Pick<Tache, 'status' | 'deadline'>, now = new Date()) {
  const j = joursRestants(t.deadline, now);
  return t.status !== 'done' && j !== null && j < 0;
}

export function joursLabel(jours: number | null): string {
  if (jours === null) return '—';
  if (jours === 0) return "Aujourd'hui";
  if (jours < 0) return `${Math.abs(jours)} j de retard`;
  return `${jours} j`;
}

export function fmtDate(value?: string | null, pattern = 'dd MMM yyyy'): string {
  const d = toDate(value);
  return d ? format(d, pattern, { locale: fr }) : '—';
}

/** Valeur pour <input type="date"> */
export const toInputDate = (value?: string | null) => (value ? value.slice(0, 10) : '');

export function periodRange(p: Periode, now = new Date()): Range | null {
  if (p === 'week') return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
  if (p === 'month') return { start: startOfMonth(now), end: endOfMonth(now) };
  return null;
}

export function previousRange(p: Periode, now = new Date()): Range | null {
  if (p === 'week') return periodRange('week', subWeeks(now, 1));
  if (p === 'month') return periodRange('month', subMonths(now, 1));
  return null;
}

export const inRange = (d: Date | null, r: Range) => !!d && d >= r.start && d <= r.end;

/**
 * Une tâche appartient à la période si sa fenêtre [début, deadline] chevauche la période,
 * ou si elle a été modifiée pendant la période.
 */
export function tacheInRange(t: Tache, r: Range | null): boolean {
  if (!r) return true;
  const start = toDate(t.date_debut) ?? toDate(t.created_at);
  const end = toDate(t.deadline) ?? start;
  const overlaps = !!start && !!end && startOfDay(start) <= r.end && endOfDay(end) >= r.start;
  return overlaps || inRange(toDate(t.updated_at), r);
}

export const PERIODE_SUFFIX: Record<Periode, string> = {
  week: 'cette semaine',
  month: 'ce mois-ci',
  all: 'au total',
};
