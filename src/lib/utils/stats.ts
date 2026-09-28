import {
  addDays,
  addWeeks,
  differenceInCalendarDays,
  endOfDay,
  endOfWeek,
  format,
  min as minDate,
  startOfDay,
  startOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Membre, PerformanceHistorique, Tache } from '@/types/database';
import { isEnRetard, toDate, type Range } from './dates';
import { round2, scorePerformance, tauxCompletion } from './performance';

export interface MembreStats {
  totales: number;
  terminees: number;
  taux: number;
  avancementMoyen: number;
  score: number;
  enRetard: number;
}

export function statsFor(taches: Tache[]): MembreStats {
  const totales = taches.length;
  const terminees = taches.filter((t) => t.status === 'done').length;
  const avancementMoyen = totales ? round2(taches.reduce((s, t) => s + (t.avancement ?? 0), 0) / totales) : 0;
  return {
    totales,
    terminees,
    taux: round2(tauxCompletion(terminees, totales)),
    avancementMoyen,
    score: scorePerformance(terminees, totales, avancementMoyen),
    enRetard: taches.filter((t) => isEnRetard(t)).length,
  };
}

export const avancementGlobal = (taches: Tache[]) => (taches.length ? statsFor(taches).avancementMoyen : 0);

export const firstName = (m?: Pick<Membre, 'nom_complet'> | null) => m?.nom_complet?.split(/\s+/)[0] ?? '—';

export interface SeriesPoint {
  date: string;
  label: string;
  [membreId: string]: number | string;
}

/**
 * Courbe croissante : nombre cumulé de tâches passées à « done » (via updated_at) par membre.
 * Pas quotidien si la fenêtre fait ≤ 62 jours, hebdomadaire sinon.
 */
export function cumulativeDone(taches: Tache[], membres: Membre[], range: Range | null, now = new Date()): SeriesPoint[] {
  const done = taches
    .filter((t) => t.status === 'done' && t.membre_id)
    .map((t) => ({ membre: t.membre_id as string, at: toDate(t.updated_at) }))
    .filter((d): d is { membre: string; at: Date } => !!d.at);
  if (done.length === 0) return [];

  const first = minDate(done.map((d) => d.at));
  const start = startOfDay(range ? range.start : first);
  const end = endOfDay(range ? minDate([range.end, now]) : now);
  const days = differenceInCalendarDays(end, start);
  const weekly = days > 62;

  const buckets: Date[] = [];
  if (weekly) {
    for (let d = startOfWeek(start, { weekStartsOn: 1 }); d <= end; d = addWeeks(d, 1)) {
      buckets.push(minDate([endOfWeek(d, { weekStartsOn: 1 }), end]));
    }
  } else {
    for (let d = start; d <= end; d = addDays(d, 1)) buckets.push(endOfDay(d));
  }

  return buckets.map((bucketEnd) => {
    const point: SeriesPoint = {
      date: format(bucketEnd, 'yyyy-MM-dd'),
      label: format(bucketEnd, weekly ? "'S'II · dd MMM" : 'dd MMM', { locale: fr }),
    };
    for (const m of membres) point[m.id] = done.filter((d) => d.membre === m.id && d.at <= bucketEnd).length;
    return point;
  });
}

/** Série du score de performance issue des snapshots (performance_historique). */
export function snapshotSeries(rows: PerformanceHistorique[], membres: Membre[], range: Range | null): SeriesPoint[] {
  const byDate = new Map<string, SeriesPoint>();
  for (const r of rows) {
    const d = toDate(r.date_snapshot);
    if (!d || (range && (d < range.start || d > range.end))) continue;
    const key = r.date_snapshot.slice(0, 10);
    const point = byDate.get(key) ?? { date: key, label: format(d, 'dd MMM', { locale: fr }) };
    point[r.membre_id] = Number(r.score_performance);
    byDate.set(key, point);
  }
  const ids = new Set(membres.map((m) => m.id));
  return [...byDate.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((p) => Object.keys(p).some((k) => ids.has(k)));
}

/** Nombre de dates de snapshot distinctes : il en faut ≥ 2 pour tracer une courbe. */
export const snapshotDates = (rows: PerformanceHistorique[]) => new Set(rows.map((r) => r.date_snapshot.slice(0, 10))).size;
