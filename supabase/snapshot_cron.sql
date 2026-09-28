-- =============================================================================
-- Snapshot hebdomadaire des performances (performance_historique)
-- -----------------------------------------------------------------------------
-- À exécuter manuellement dans Supabase > SQL Editor.
-- Ce script ne modifie aucune table existante : il crée une fonction et une
-- tâche planifiée pg_cron.
--
-- PRÉREQUIS : activer l'extension pg_cron AVANT d'exécuter ce script
--   Supabase > Database > Extensions > rechercher "pg_cron" > Enable
--
-- Formule du score (identique au bouton « Enregistrer un snapshot maintenant »
-- de la page Performances, voir src/lib/utils/performance.ts) :
--   taux_completion  = taches_terminees / taches_totales * 100   (0 si aucune tâche)
--   score_performance = 0.6 * taux_completion + 0.4 * avancement_moyen
-- Valeurs arrondies à 2 décimales.
-- =============================================================================


-- 1) Fonction de snapshot ------------------------------------------------------
-- Insère une ligne par membre pour la date du jour, sauf si un snapshot existe
-- déjà pour ce membre à cette date. Retourne le nombre de lignes insérées.
create or replace function public.snapshot_performance()
returns integer
language plpgsql
set search_path = public
as $$
declare
  nb_inseres integer;
begin
  insert into public.performance_historique (
    membre_id,
    date_snapshot,
    taches_terminees,
    taches_totales,
    avancement_moyen,
    score_performance
  )
  select
    s.membre_id,
    current_date,
    s.terminees,
    s.totales,
    s.avancement_moyen,
    round(
      0.6 * (case when s.totales > 0 then s.terminees::numeric / s.totales * 100 else 0 end)
      + 0.4 * s.avancement_moyen,
      2
    )
  from (
    select
      m.id as membre_id,
      count(t.id) filter (where t.status = 'done')::int as terminees,
      count(t.id)::int                                  as totales,
      round(coalesce(avg(t.avancement), 0), 2)          as avancement_moyen
    from public.membres m
    left join public.taches t on t.membre_id = m.id
    group by m.id
  ) s
  where not exists (
    select 1
    from public.performance_historique ph
    where ph.membre_id = s.membre_id
      and ph.date_snapshot::date = current_date
  );

  get diagnostics nb_inseres = row_count;
  return nb_inseres;
end;
$$;

-- Seul un utilisateur authentifié (l'admin) peut l'appeler depuis l'application.
-- pg_cron l'exécute en tant que "postgres", non concerné par ces droits.
revoke execute on function public.snapshot_performance() from public, anon;
grant execute on function public.snapshot_performance() to authenticated;


-- 2) Planification pg_cron : chaque dimanche à 23h00 ---------------------------
-- Attention : pg_cron utilise l'heure UTC. Dimanche 23h00 UTC = lundi 00h00 à
-- Paris/Tunis en heure d'hiver (UTC+1). Pour 23h00 heure locale UTC+1,
-- utiliser '0 22 * * 0'.
--
-- Supprime une éventuelle planification précédente du même nom (ré-exécutable).
select cron.unschedule(jobid)
from cron.job
where jobname = 'snapshot-performance-hebdo';

select cron.schedule(
  'snapshot-performance-hebdo',
  '0 23 * * 0',
  $$select public.snapshot_performance();$$
);


-- 3) Commandes utiles (en commentaire) -----------------------------------------
-- Lancer un snapshot immédiatement :
--   select public.snapshot_performance();
--
-- Voir la tâche planifiée et ses dernières exécutions :
--   select * from cron.job where jobname = 'snapshot-performance-hebdo';
--   select * from cron.job_run_details order by start_time desc limit 10;
--
-- DÉSACTIVER le snapshot hebdomadaire :
--   select cron.unschedule('snapshot-performance-hebdo');
