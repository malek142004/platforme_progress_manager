-- =============================================================================
-- Données de démonstration (OPTIONNEL)
-- -----------------------------------------------------------------------------
-- À exécuter manuellement dans Supabase > SQL Editor, uniquement si vous voulez
-- des données de test pour les graphiques. Ne crée ni ne modifie aucune table.
--
-- • Les dates sont relatives à current_date : les graphiques restent pertinents.
-- • Les emails sont fictifs (@example.com). Pour tester l'envoi Resend en mode
--   test (expéditeur onboarding@resend.dev), remplacez l'email d'UN membre par
--   l'adresse de votre compte Resend.
-- • updated_at est renseigné explicitement pour dater le passage à « done »
--   (courbes cumulées). Si un trigger BEFORE INSERT l'écrase, les courbes
--   seront concentrées sur la date d'exécution.
--
-- Pour tout supprimer ensuite, voir le bloc NETTOYAGE en fin de fichier.
-- =============================================================================

begin;

-- Membres ----------------------------------------------------------------------
insert into public.membres (nom_complet, email, tache_dev, role_management) values
  ('Amira Ben Salah', 'amira.bensalah@example.com', 'Frontend React', 'Scrum Master'),
  ('Youssef Trabelsi', 'youssef.trabelsi@example.com', 'Backend Node.js', 'Tech Lead'),
  ('Sarra Jlassi', 'sarra.jlassi@example.com', 'UI/UX Design', 'Product Owner'),
  ('Karim Haddad', 'karim.haddad@example.com', 'DevOps', 'Responsable qualité'),
  ('Ines Mansour', 'ines.mansour@example.com', 'Data / BI', 'Responsable reporting'),
  ('Mehdi Gharbi', 'mehdi.gharbi@example.com', 'Mobile Flutter', 'Responsable communication');

-- Sprints ----------------------------------------------------------------------
insert into public.sprints (nom, date_debut, date_fin, objectif) values
  ('Sprint 1 – Cadrage', current_date - 42, current_date - 29, 'Cadrer le projet, maquettes et architecture.'),
  ('Sprint 2 – Fondations', current_date - 28, current_date - 15, 'Authentification, base de données et premiers écrans.'),
  ('Sprint 3 – Fonctionnalités clés', current_date - 14, current_date + 0, 'Tableau de bord, suivi hebdomadaire et taskboard.'),
  ('Sprint 4 – Finitions', current_date + 1, current_date + 14, 'Exports, notifications email et recette.');

-- Tâches -----------------------------------------------------------------------
insert into public.taches
  (titre, membre_id, sprint_id, date_debut, deadline, priorite, status, risque, avancement, commentaires, created_at, updated_at)
values
  ('Rédiger le cahier des charges', (select id from public.membres where email = 'amira.bensalah@example.com'), (select id from public.sprints where nom = 'Sprint 1 – Cadrage'), current_date - 40, current_date - 36, 'basse', 'done', 'moyen', 100, 'RAS', (current_date - 40)::timestamptz, (current_date - 36 + time '17:00')),
  ('Maquettes basse fidélité', (select id from public.membres where email = 'youssef.trabelsi@example.com'), (select id from public.sprints where nom = 'Sprint 1 – Cadrage'), current_date - 38, current_date - 35, 'moyenne', 'in_review', 'moyen', 80, null, (current_date - 38)::timestamptz, (current_date + 0 + time '17:00')),
  ('Choix de la stack technique', (select id from public.membres where email = 'sarra.jlassi@example.com'), (select id from public.sprints where nom = 'Sprint 1 – Cadrage'), current_date - 38, current_date - 35, 'moyenne', 'done', 'eleve', 100, 'Bloqué par une dépendance', (current_date - 38)::timestamptz, (current_date - 35 + time '17:00')),
  ('Plan de tests initial', (select id from public.membres where email = 'karim.haddad@example.com'), (select id from public.sprints where nom = 'Sprint 1 – Cadrage'), current_date - 41, current_date - 36, 'moyenne', 'done', 'faible', 100, 'Bon avancement', (current_date - 41)::timestamptz, (current_date - 38 + time '17:00')),
  ('Atelier de lancement', (select id from public.membres where email = 'ines.mansour@example.com'), (select id from public.sprints where nom = 'Sprint 1 – Cadrage'), current_date - 41, current_date - 38, 'haute', 'done', 'aucun', 100, 'Revue prévue vendredi', (current_date - 41)::timestamptz, (current_date - 40 + time '17:00')),
  ('Cartographie des risques', (select id from public.membres where email = 'mehdi.gharbi@example.com'), (select id from public.sprints where nom = 'Sprint 1 – Cadrage'), current_date - 42, current_date - 35, 'moyenne', 'done', 'faible', 100, 'Bon avancement', (current_date - 42)::timestamptz, (current_date - 36 + time '17:00')),
  ('Benchmark des outils', (select id from public.membres where email = 'amira.bensalah@example.com'), (select id from public.sprints where nom = 'Sprint 1 – Cadrage'), current_date - 40, current_date - 34, 'moyenne', 'done', 'aucun', 100, 'Revue prévue vendredi', (current_date - 40)::timestamptz, (current_date - 34 + time '17:00')),
  ('Mise en place de Supabase', (select id from public.membres where email = 'sarra.jlassi@example.com'), (select id from public.sprints where nom = 'Sprint 2 – Fondations'), current_date - 27, current_date - 24, 'moyenne', 'done', 'moyen', 100, 'En attente de validation', (current_date - 27)::timestamptz, (current_date - 26 + time '17:00')),
  ('Authentification admin', (select id from public.membres where email = 'karim.haddad@example.com'), (select id from public.sprints where nom = 'Sprint 2 – Fondations'), current_date - 26, current_date - 19, 'haute', 'in_review', 'moyen', 90, 'Bon avancement', (current_date - 26)::timestamptz, (current_date + 0 + time '17:00')),
  ('Modèle de données tâches', (select id from public.membres where email = 'ines.mansour@example.com'), (select id from public.sprints where nom = 'Sprint 2 – Fondations'), current_date - 24, current_date - 17, 'haute', 'done', 'aucun', 100, 'Bloqué par une dépendance', (current_date - 24)::timestamptz, (current_date - 18 + time '17:00')),
  ('Écran de connexion', (select id from public.membres where email = 'mehdi.gharbi@example.com'), (select id from public.sprints where nom = 'Sprint 2 – Fondations'), current_date - 25, current_date - 18, 'basse', 'done', 'aucun', 100, 'En attente de validation', (current_date - 25)::timestamptz, (current_date - 19 + time '17:00')),
  ('Pipeline CI', (select id from public.membres where email = 'amira.bensalah@example.com'), (select id from public.sprints where nom = 'Sprint 2 – Fondations'), current_date - 28, current_date - 25, 'moyenne', 'done', 'faible', 100, 'Bon avancement', (current_date - 28)::timestamptz, (current_date - 27 + time '17:00')),
  ('Design system Tailwind', (select id from public.membres where email = 'youssef.trabelsi@example.com'), (select id from public.sprints where nom = 'Sprint 2 – Fondations'), current_date - 25, current_date - 20, 'haute', 'done', 'aucun', 100, 'RAS', (current_date - 25)::timestamptz, (current_date - 21 + time '17:00')),
  ('Documentation API', (select id from public.membres where email = 'sarra.jlassi@example.com'), (select id from public.sprints where nom = 'Sprint 2 – Fondations'), current_date - 27, current_date - 20, 'basse', 'done', 'moyen', 100, 'Revue prévue vendredi', (current_date - 27)::timestamptz, (current_date - 20 + time '17:00')),
  ('Dashboard KPI', (select id from public.membres where email = 'ines.mansour@example.com'), (select id from public.sprints where nom = 'Sprint 3 – Fonctionnalités clés'), current_date - 13, current_date - 7, 'moyenne', 'in_progress', 'faible', 30, 'Bon avancement', (current_date - 13)::timestamptz, (current_date - 3 + time '17:00')),
  ('Graphique de performance', (select id from public.membres where email = 'mehdi.gharbi@example.com'), (select id from public.sprints where nom = 'Sprint 3 – Fonctionnalités clés'), current_date - 10, current_date - 5, 'haute', 'to_do', 'moyen', 10, null, (current_date - 10)::timestamptz, (current_date - 1 + time '17:00')),
  ('Tableau hebdomadaire', (select id from public.membres where email = 'amira.bensalah@example.com'), (select id from public.sprints where nom = 'Sprint 3 – Fonctionnalités clés'), current_date - 13, current_date - 10, 'moyenne', 'in_progress', 'eleve', 45, 'Revue prévue vendredi', (current_date - 13)::timestamptz, (current_date - 1 + time '17:00')),
  ('Kanban drag & drop', (select id from public.membres where email = 'youssef.trabelsi@example.com'), (select id from public.sprints where nom = 'Sprint 3 – Fonctionnalités clés'), current_date - 10, current_date - 3, 'haute', 'to_do', 'moyen', 0, 'En attente de validation', (current_date - 10)::timestamptz, (current_date - 3 + time '17:00')),
  ('Filtres et recherche', (select id from public.membres where email = 'sarra.jlassi@example.com'), (select id from public.sprints where nom = 'Sprint 3 – Fonctionnalités clés'), current_date - 11, current_date - 5, 'moyenne', 'done', 'faible', 100, null, (current_date - 11)::timestamptz, (current_date - 9 + time '17:00')),
  ('Calendrier des deadlines', (select id from public.membres where email = 'karim.haddad@example.com'), (select id from public.sprints where nom = 'Sprint 3 – Fonctionnalités clés'), current_date - 11, current_date - 7, 'moyenne', 'done', 'aucun', 100, null, (current_date - 11)::timestamptz, (current_date - 1 + time '17:00')),
  ('Tests d''intégration', (select id from public.membres where email = 'ines.mansour@example.com'), (select id from public.sprints where nom = 'Sprint 3 – Fonctionnalités clés'), current_date - 10, current_date - 7, 'haute', 'in_review', 'eleve', 90, 'Bloqué par une dépendance', (current_date - 10)::timestamptz, (current_date - 2 + time '17:00')),
  ('Optimisation des requêtes', (select id from public.membres where email = 'mehdi.gharbi@example.com'), (select id from public.sprints where nom = 'Sprint 3 – Fonctionnalités clés'), current_date - 12, current_date - 6, 'basse', 'done', 'faible', 100, 'En attente de validation', (current_date - 12)::timestamptz, (current_date - 3 + time '17:00')),
  ('Export PDF', (select id from public.membres where email = 'amira.bensalah@example.com'), (select id from public.sprints where nom = 'Sprint 4 – Finitions'), current_date + 3, current_date + 6, 'moyenne', 'to_do', 'moyen', 10, 'Bloqué par une dépendance', (current_date + 3)::timestamptz, (current_date - 1 + time '17:00')),
  ('Export CSV', (select id from public.membres where email = 'youssef.trabelsi@example.com'), (select id from public.sprints where nom = 'Sprint 4 – Finitions'), current_date + 1, current_date + 5, 'moyenne', 'in_progress', 'aucun', 45, 'Revue prévue vendredi', (current_date + 1)::timestamptz, (current_date - 2 + time '17:00')),
  ('Edge Function email', (select id from public.membres where email = 'sarra.jlassi@example.com'), (select id from public.sprints where nom = 'Sprint 4 – Finitions'), current_date + 1, current_date + 9, 'moyenne', 'to_do', 'aucun', 0, 'Revue prévue vendredi', (current_date + 1)::timestamptz, (current_date - 2 + time '17:00')),
  ('Page remarques', (select id from public.membres where email = 'karim.haddad@example.com'), (select id from public.sprints where nom = 'Sprint 4 – Finitions'), current_date + 2, current_date + 9, 'haute', 'to_do', 'aucun', 10, 'RAS', (current_date + 2)::timestamptz, (current_date - 3 + time '17:00')),
  ('Recette utilisateur', (select id from public.membres where email = 'ines.mansour@example.com'), (select id from public.sprints where nom = 'Sprint 4 – Finitions'), current_date + 1, current_date + 4, 'haute', 'to_do', 'eleve', 0, 'Bon avancement', (current_date + 1)::timestamptz, (current_date - 3 + time '17:00')),
  ('Responsive mobile', (select id from public.membres where email = 'mehdi.gharbi@example.com'), (select id from public.sprints where nom = 'Sprint 4 – Finitions'), current_date + 3, current_date + 8, 'moyenne', 'to_do', 'aucun', 0, 'Bloqué par une dépendance', (current_date + 3)::timestamptz, (current_date - 3 + time '17:00')),
  ('Snapshot hebdomadaire', (select id from public.membres where email = 'amira.bensalah@example.com'), (select id from public.sprints where nom = 'Sprint 4 – Finitions'), current_date + 5, current_date + 14, 'basse', 'to_do', 'faible', 10, 'Bon avancement', (current_date + 5)::timestamptz, (current_date - 3 + time '17:00'));

-- Sous-tâches (sprints 3 et 4) ---------------------------------------------------
insert into public.sous_taches (tache_id, titre, status, date_debut, deadline, avancement) values
  ((select id from public.taches where titre = 'Dashboard KPI' limit 1), 'Analyse – dashboard kpi', 'done', current_date - 13, current_date - 12, 100),
  ((select id from public.taches where titre = 'Dashboard KPI' limit 1), 'Développement – dashboard kpi', 'in_progress', current_date - 13, current_date - 11, 50),
  ((select id from public.taches where titre = 'Dashboard KPI' limit 1), 'Tests – dashboard kpi', 'done', current_date - 13, current_date - 10, 100),
  ((select id from public.taches where titre = 'Dashboard KPI' limit 1), 'Revue de code – dashboard kpi', 'in_progress', current_date - 13, current_date - 9, 50),
  ((select id from public.taches where titre = 'Graphique de performance' limit 1), 'Analyse – graphique de performance', 'to_do', current_date - 10, current_date - 9, 0),
  ((select id from public.taches where titre = 'Graphique de performance' limit 1), 'Développement – graphique de performance', 'to_do', current_date - 10, current_date - 8, 0),
  ((select id from public.taches where titre = 'Graphique de performance' limit 1), 'Tests – graphique de performance', 'to_do', current_date - 10, current_date - 7, 0),
  ((select id from public.taches where titre = 'Graphique de performance' limit 1), 'Revue de code – graphique de performance', 'to_do', current_date - 10, current_date - 6, 0),
  ((select id from public.taches where titre = 'Tableau hebdomadaire' limit 1), 'Analyse – tableau hebdomadaire', 'done', current_date - 13, current_date - 12, 100),
  ((select id from public.taches where titre = 'Tableau hebdomadaire' limit 1), 'Développement – tableau hebdomadaire', 'to_do', current_date - 13, current_date - 11, 0),
  ((select id from public.taches where titre = 'Tableau hebdomadaire' limit 1), 'Tests – tableau hebdomadaire', 'in_progress', current_date - 13, current_date - 10, 50),
  ((select id from public.taches where titre = 'Kanban drag & drop' limit 1), 'Analyse – kanban drag & drop', 'to_do', current_date - 10, current_date - 9, 0),
  ((select id from public.taches where titre = 'Kanban drag & drop' limit 1), 'Développement – kanban drag & drop', 'to_do', current_date - 10, current_date - 8, 0),
  ((select id from public.taches where titre = 'Kanban drag & drop' limit 1), 'Tests – kanban drag & drop', 'to_do', current_date - 10, current_date - 7, 0),
  ((select id from public.taches where titre = 'Filtres et recherche' limit 1), 'Analyse – filtres et recherche', 'done', current_date - 11, current_date - 10, 100),
  ((select id from public.taches where titre = 'Filtres et recherche' limit 1), 'Développement – filtres et recherche', 'done', current_date - 11, current_date - 9, 100),
  ((select id from public.taches where titre = 'Filtres et recherche' limit 1), 'Tests – filtres et recherche', 'done', current_date - 11, current_date - 8, 100),
  ((select id from public.taches where titre = 'Calendrier des deadlines' limit 1), 'Analyse – calendrier des deadlines', 'done', current_date - 11, current_date - 10, 100),
  ((select id from public.taches where titre = 'Calendrier des deadlines' limit 1), 'Développement – calendrier des deadlines', 'done', current_date - 11, current_date - 9, 100),
  ((select id from public.taches where titre = 'Calendrier des deadlines' limit 1), 'Tests – calendrier des deadlines', 'done', current_date - 11, current_date - 8, 100),
  ((select id from public.taches where titre = 'Calendrier des deadlines' limit 1), 'Revue de code – calendrier des deadlines', 'done', current_date - 11, current_date - 7, 100),
  ((select id from public.taches where titre = 'Tests d''intégration' limit 1), 'Analyse – tests d''intégration', 'to_do', current_date - 10, current_date - 9, 0),
  ((select id from public.taches where titre = 'Tests d''intégration' limit 1), 'Développement – tests d''intégration', 'done', current_date - 10, current_date - 8, 100),
  ((select id from public.taches where titre = 'Optimisation des requêtes' limit 1), 'Analyse – optimisation des requêtes', 'done', current_date - 12, current_date - 11, 100),
  ((select id from public.taches where titre = 'Optimisation des requêtes' limit 1), 'Développement – optimisation des requêtes', 'done', current_date - 12, current_date - 10, 100),
  ((select id from public.taches where titre = 'Export PDF' limit 1), 'Analyse – export pdf', 'to_do', current_date + 3, current_date + 4, 0),
  ((select id from public.taches where titre = 'Export PDF' limit 1), 'Développement – export pdf', 'to_do', current_date + 3, current_date + 5, 0),
  ((select id from public.taches where titre = 'Export CSV' limit 1), 'Analyse – export csv', 'done', current_date + 1, current_date + 2, 100),
  ((select id from public.taches where titre = 'Export CSV' limit 1), 'Développement – export csv', 'to_do', current_date + 1, current_date + 3, 0),
  ((select id from public.taches where titre = 'Edge Function email' limit 1), 'Analyse – edge function email', 'to_do', current_date + 1, current_date + 2, 0),
  ((select id from public.taches where titre = 'Edge Function email' limit 1), 'Développement – edge function email', 'to_do', current_date + 1, current_date + 3, 0),
  ((select id from public.taches where titre = 'Edge Function email' limit 1), 'Tests – edge function email', 'to_do', current_date + 1, current_date + 4, 0),
  ((select id from public.taches where titre = 'Page remarques' limit 1), 'Analyse – page remarques', 'to_do', current_date + 2, current_date + 3, 0),
  ((select id from public.taches where titre = 'Page remarques' limit 1), 'Développement – page remarques', 'to_do', current_date + 2, current_date + 4, 0),
  ((select id from public.taches where titre = 'Page remarques' limit 1), 'Tests – page remarques', 'to_do', current_date + 2, current_date + 5, 0),
  ((select id from public.taches where titre = 'Page remarques' limit 1), 'Revue de code – page remarques', 'to_do', current_date + 2, current_date + 6, 0),
  ((select id from public.taches where titre = 'Recette utilisateur' limit 1), 'Analyse – recette utilisateur', 'to_do', current_date + 1, current_date + 2, 0),
  ((select id from public.taches where titre = 'Recette utilisateur' limit 1), 'Développement – recette utilisateur', 'to_do', current_date + 1, current_date + 3, 0),
  ((select id from public.taches where titre = 'Responsive mobile' limit 1), 'Analyse – responsive mobile', 'to_do', current_date + 3, current_date + 4, 0),
  ((select id from public.taches where titre = 'Responsive mobile' limit 1), 'Développement – responsive mobile', 'to_do', current_date + 3, current_date + 5, 0),
  ((select id from public.taches where titre = 'Responsive mobile' limit 1), 'Tests – responsive mobile', 'to_do', current_date + 3, current_date + 6, 0),
  ((select id from public.taches where titre = 'Responsive mobile' limit 1), 'Revue de code – responsive mobile', 'to_do', current_date + 3, current_date + 7, 0),
  ((select id from public.taches where titre = 'Snapshot hebdomadaire' limit 1), 'Analyse – snapshot hebdomadaire', 'to_do', current_date + 5, current_date + 6, 0),
  ((select id from public.taches where titre = 'Snapshot hebdomadaire' limit 1), 'Développement – snapshot hebdomadaire', 'to_do', current_date + 5, current_date + 7, 0),
  ((select id from public.taches where titre = 'Snapshot hebdomadaire' limit 1), 'Tests – snapshot hebdomadaire', 'to_do', current_date + 5, current_date + 8, 0),
  ((select id from public.taches where titre = 'Snapshot hebdomadaire' limit 1), 'Revue de code – snapshot hebdomadaire', 'to_do', current_date + 5, current_date + 9, 0);

-- Historique de performance (4 snapshots hebdomadaires) -----------------------
-- score_performance = 0.6 × taux de complétion (%) + 0.4 × avancement moyen
insert into public.performance_historique (membre_id, date_snapshot, taches_terminees, taches_totales, avancement_moyen, score_performance) values
  ((select id from public.membres where email = 'amira.bensalah@example.com'), current_date - 28, 2, 6, 43.33, 37.33),
  ((select id from public.membres where email = 'amira.bensalah@example.com'), current_date - 21, 3, 6, 60.0, 54.0),
  ((select id from public.membres where email = 'amira.bensalah@example.com'), current_date - 14, 3, 6, 60.83, 54.33),
  ((select id from public.membres where email = 'amira.bensalah@example.com'), current_date - 7, 3, 6, 60.83, 54.33),
  ((select id from public.membres where email = 'youssef.trabelsi@example.com'), current_date - 28, 0, 4, 15.0, 6.0),
  ((select id from public.membres where email = 'youssef.trabelsi@example.com'), current_date - 21, 1, 4, 45.0, 33.0),
  ((select id from public.membres where email = 'youssef.trabelsi@example.com'), current_date - 14, 1, 4, 51.25, 35.5),
  ((select id from public.membres where email = 'youssef.trabelsi@example.com'), current_date - 7, 1, 4, 56.25, 37.5),
  ((select id from public.membres where email = 'sarra.jlassi@example.com'), current_date - 28, 1, 5, 32.0, 24.8),
  ((select id from public.membres where email = 'sarra.jlassi@example.com'), current_date - 21, 2, 5, 56.0, 46.4),
  ((select id from public.membres where email = 'sarra.jlassi@example.com'), current_date - 14, 3, 5, 72.0, 64.8),
  ((select id from public.membres where email = 'sarra.jlassi@example.com'), current_date - 7, 4, 5, 80.0, 80.0),
  ((select id from public.membres where email = 'karim.haddad@example.com'), current_date - 28, 1, 4, 37.5, 30.0),
  ((select id from public.membres where email = 'karim.haddad@example.com'), current_date - 21, 1, 4, 47.5, 34.0),
  ((select id from public.membres where email = 'karim.haddad@example.com'), current_date - 14, 1, 4, 57.5, 38.0),
  ((select id from public.membres where email = 'karim.haddad@example.com'), current_date - 7, 1, 4, 67.5, 42.0),
  ((select id from public.membres where email = 'ines.mansour@example.com'), current_date - 28, 1, 5, 32.0, 24.8),
  ((select id from public.membres where email = 'ines.mansour@example.com'), current_date - 21, 1, 5, 42.0, 28.8),
  ((select id from public.membres where email = 'ines.mansour@example.com'), current_date - 14, 2, 5, 58.0, 47.2),
  ((select id from public.membres where email = 'ines.mansour@example.com'), current_date - 7, 2, 5, 62.0, 48.8),
  ((select id from public.membres where email = 'mehdi.gharbi@example.com'), current_date - 28, 1, 5, 30.0, 24.0),
  ((select id from public.membres where email = 'mehdi.gharbi@example.com'), current_date - 21, 1, 5, 38.0, 27.2),
  ((select id from public.membres where email = 'mehdi.gharbi@example.com'), current_date - 14, 2, 5, 54.0, 45.6),
  ((select id from public.membres where email = 'mehdi.gharbi@example.com'), current_date - 7, 2, 5, 58.0, 47.2);

-- Remarques --------------------------------------------------------------------
insert into public.remarques (destinataire_id, message, date_envoi, envoye_email) values
  ((select id from public.membres where email = 'amira.bensalah@example.com'), 'Merci pour l''animation des cérémonies cette semaine, le rythme est excellent.', now() - interval '6 days', true),
  ((select id from public.membres where email = 'youssef.trabelsi@example.com'), 'Peux-tu prioriser l''optimisation des requêtes avant la démo de vendredi ?', now() - interval '3 days', true),
  ((select id from public.membres where email = 'karim.haddad@example.com'), 'Pense à mettre à jour l''avancement de tes tâches dans le suivi hebdomadaire.', now() - interval '1 day', false);

commit;

-- NETTOYAGE (à exécuter seulement pour retirer les données de démo) -------------
-- begin;
-- delete from public.remarques              where destinataire_id in (select id from public.membres where email like '%@example.com');
-- delete from public.performance_historique where membre_id       in (select id from public.membres where email like '%@example.com');
-- delete from public.sous_taches            where tache_id        in (select id from public.taches where membre_id in (select id from public.membres where email like '%@example.com'));
-- delete from public.taches                 where membre_id       in (select id from public.membres where email like '%@example.com');
-- delete from public.sprints                where nom like 'Sprint _ – %';
-- delete from public.membres                where email like '%@example.com';
-- commit;
