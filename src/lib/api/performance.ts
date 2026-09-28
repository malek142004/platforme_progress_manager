import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { Membre, PerformanceHistorique, PerformanceInsert, Tache } from '@/types/database';
import { round2, scorePerformance } from '@/lib/utils/performance';
import { toError } from './errors';

export async function listPerformance(): Promise<PerformanceHistorique[]> {
  const { data, error } = await supabase
    .from('performance_historique')
    .select('*')
    .order('date_snapshot', { ascending: true });
  if (error) throw toError(error);
  return (data ?? []) as PerformanceHistorique[];
}

export interface SnapshotResult {
  inserted: number;
  source: 'sql' | 'frontend';
}

/**
 * Enregistre un snapshot (une ligne par membre, une seule par jour).
 * Utilise public.snapshot_performance() si elle existe (supabase/snapshot_cron.sql),
 * sinon calcule côté frontend avec exactement la même formule.
 */
export async function snapshotNow(membres: Membre[], taches: Tache[]): Promise<SnapshotResult> {
  const rpc = await supabase.rpc('snapshot_performance');
  if (!rpc.error) return { inserted: Number(rpc.data ?? 0), source: 'sql' };
  if (rpc.error.code !== 'PGRST202' && rpc.error.code !== '42883') throw toError(rpc.error);

  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: existing, error: exErr } = await supabase
    .from('performance_historique')
    .select('membre_id, date_snapshot')
    .gte('date_snapshot', today);
  if (exErr) throw toError(exErr);
  const already = new Set(
    (existing ?? []).filter((r) => String(r.date_snapshot).slice(0, 10) === today).map((r) => r.membre_id as string),
  );

  const rows: PerformanceInsert[] = membres
    .filter((m) => !already.has(m.id))
    .map((m) => {
      const own = taches.filter((t) => t.membre_id === m.id);
      const terminees = own.filter((t) => t.status === 'done').length;
      const totales = own.length;
      const avancementMoyen = totales ? round2(own.reduce((s, t) => s + (t.avancement ?? 0), 0) / totales) : 0;
      return {
        membre_id: m.id,
        date_snapshot: today,
        taches_terminees: terminees,
        taches_totales: totales,
        avancement_moyen: avancementMoyen,
        score_performance: scorePerformance(terminees, totales, avancementMoyen),
      };
    });

  if (rows.length === 0) return { inserted: 0, source: 'frontend' };
  const { error } = await supabase.from('performance_historique').insert(rows);
  if (error) throw toError(error);
  return { inserted: rows.length, source: 'frontend' };
}
