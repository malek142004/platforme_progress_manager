# Progress & Performance Manager

Plateforme de suivi des tâches et des performances d'une équipe de 6 membres (un seul compte admin).
Stack : React + Vite + TypeScript, Tailwind, Recharts, Supabase, @hello-pangea/dnd, date-fns, lucide-react.

## Démarrer

```bash
cp .env.example .env.local   # puis renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
npm install
npm run dev                  # http://localhost:5173
npm run build                # vérification des types + build de production
```

## Structure

```
src/
  components/ui        Card, Badge, Button, PillSelect, SearchPill, ProgressBar, Modal…
  components/layout    Sidebar, AppLayout, ProtectedRoute
  components/charts    Donut, courbes, barres, jauge, calendrier (Recharts / SVG)
  components/taches    Modale tâche, badges, jours restants, bascule Tableau/Taskboard
  components/sprints   Modale sprint, accordéon tâche + sous-tâches
  hooks                useAuth, useToast, useData (cache partagé + mutations optimistes)
  lib/api              Accès Supabase (une fonction par opération)
  lib/utils            Dates, statistiques, formule de score, exports CSV/PDF
  pages                Login, Dashboard, Weekly, Taskboard, SprintBacklog, Remarques, Performances
supabase/
  functions/send-remark  Edge Function d'envoi d'email (Resend)
  snapshot_cron.sql      Fonction snapshot_performance() + planification pg_cron (à exécuter soi-même)
  seed.sql               Données de démonstration optionnelles
```

## Score de performance

`score = 0,6 × taux de complétion (%) + 0,4 × avancement moyen (%)`, arrondi à 2 décimales.
Identique dans `supabase/snapshot_cron.sql` et `src/lib/utils/performance.ts`.

## Edge Function `send-remark`

```bash
npm install -g supabase          # ou : brew install supabase/tap/supabase
supabase login
supabase link --project-ref <ref-du-projet>
supabase secrets set RESEND_API_KEY=re_xxxxxxxx
supabase secrets set RESEND_FROM="Progress & Performance <onboarding@resend.dev>"   # optionnel
supabase functions deploy send-remark --no-verify-jwt
```

`--no-verify-jwt` est nécessaire avec les clés `sb_publishable_…` : la fonction vérifie elle-même la session de l'admin.
