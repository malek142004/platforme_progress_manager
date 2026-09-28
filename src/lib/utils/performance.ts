// Formule du score de performance.
// DOIT rester identique à public.snapshot_performance() (supabase/snapshot_cron.sql).
//   taux_completion   = terminees / totales * 100 (0 si aucune tâche)
//   score_performance = 0.6 * taux_completion + 0.4 * avancement_moyen

export const round2 = (n: number) => Math.round(n * 100) / 100;

export function tauxCompletion(terminees: number, totales: number): number {
  return totales > 0 ? (terminees / totales) * 100 : 0;
}

export function scorePerformance(terminees: number, totales: number, avancementMoyen: number): number {
  return round2(0.6 * tauxCompletion(terminees, totales) + 0.4 * avancementMoyen);
}
