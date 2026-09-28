import { useEffect, useMemo, useState } from 'react';
import { CalendarRange, Flag, ListChecks, Pencil, Plus, Target } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, EmptyState, ErrorState, ProgressBar, Skeleton } from '@/components/ui';
import { SprintFormModal } from '@/components/sprints/SprintFormModal';
import { TacheAccordion } from '@/components/sprints/TacheAccordion';
import { useTacheEditor } from '@/components/taches/useTacheEditor';
import { useMembres, useSousTaches, useSprints, useTaches } from '@/hooks/useData';
import { combine } from '@/hooks/useResource';
import { cn } from '@/lib/utils/cn';
import { fmtDate, joursRestants, toDate } from '@/lib/utils/dates';
import { avancementGlobal } from '@/lib/utils/stats';
import type { Sprint } from '@/types/database';

const NO_SPRINT = '__none__';

function sprintEtat(s: Sprint) {
  const now = new Date();
  const debut = toDate(s.date_debut);
  const fin = toDate(s.date_fin);
  if (fin && joursRestants(s.date_fin, now)! < 0) return { label: 'Terminé', cls: 'bg-lavender text-ink-muted' };
  if (debut && debut > now) return { label: 'À venir', cls: 'bg-indigo-50 text-indigo-600' };
  return { label: 'En cours', cls: 'bg-coral-50 text-coral-600' };
}

export default function SprintBacklog() {
  const sprintsR = useSprints();
  const tachesR = useTaches();
  const membresR = useMembres();
  const sousR = useSousTaches();
  const state = combine(sprintsR, tachesR, membresR, sousR);
  const sprints = sprintsR.data ?? [];
  const membres = membresR.data ?? [];
  const editor = useTacheEditor(membres, sprints);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sprintModal, setSprintModal] = useState<{ sprint: Sprint | null } | null>(null);

  // Sélection par défaut : le sprint en cours, sinon le plus récent.
  useEffect(() => {
    if (selectedId || sprints.length === 0) return;
    const current = sprints.find((s) => sprintEtat(s).label === 'En cours');
    setSelectedId((current ?? sprints[0]).id);
  }, [sprints, selectedId]);

  const selected = sprints.find((s) => s.id === selectedId) ?? null;
  const taches = useMemo(
    () => (tachesR.data ?? []).filter((t) => (selectedId === NO_SPRINT ? !t.sprint_id : t.sprint_id === selectedId)),
    [tachesR.data, selectedId],
  );
  const sousByTache = useMemo(() => {
    const map = new Map<string, typeof sousR.data>();
    for (const s of sousR.data ?? []) map.set(s.tache_id, [...(map.get(s.tache_id) ?? []), s]);
    return map;
  }, [sousR.data]);
  const membreById = new Map(membres.map((m) => [m.id, m]));

  const pct = avancementGlobal(taches);
  const allSous = taches.flatMap((t) => sousByTache.get(t.id) ?? []);
  const sousDone = allSous.filter((s) => s.status === 'done').length;
  const tachesDone = taches.filter((t) => t.status === 'done').length;
  const sansSprint = (tachesR.data ?? []).filter((t) => !t.sprint_id).length;

  return (
    <>
      <PageHeader
        title="Sprint Backlog"
        subtitle="Sprints, tâches et sous-tâches"
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setSprintModal({ sprint: null })}>
            Nouveau sprint
          </Button>
        }
      />

      {state.error ? (
        <Card hoverable={false}>
          <ErrorState message={state.error} onRetry={state.reload} />
        </Card>
      ) : state.loading ? (
        <div className="space-y-5">
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-44 rounded-card" />
            ))}
          </div>
          <Skeleton className="h-40 rounded-card" />
          <Skeleton className="h-20 rounded-card" />
          <Skeleton className="h-20 rounded-card" />
        </div>
      ) : sprints.length === 0 && sansSprint === 0 ? (
        <Card hoverable={false}>
          <EmptyState
            icon={<Flag className="h-6 w-6" />}
            title="Aucun sprint pour le moment"
            description="Créez un premier sprint, puis rattachez-y des tâches depuis le suivi hebdomadaire ou ici."
            action={
              <Button icon={<Plus className="h-4 w-4" />} onClick={() => setSprintModal({ sprint: null })}>
                Créer un sprint
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          {/* Sélecteur de sprint */}
          <div className="scrollbar-thin -mx-4 mb-5 flex gap-3 overflow-x-auto px-4 pb-2 animate-fade-up sm:mx-0 sm:px-0">
            {sprints.map((s) => {
              const etat = sprintEtat(s);
              const active = s.id === selectedId;
              const own = (tachesR.data ?? []).filter((t) => t.sprint_id === s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={cn(
                    'min-w-[190px] shrink-0 rounded-[20px] px-4 py-3 text-left transition',
                    active ? 'bg-indigo-800 text-white shadow-pill' : 'bg-white text-ink shadow-card hover:-translate-y-0.5 hover:shadow-card-hover',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-extrabold">{s.nom}</span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', active ? 'bg-white/20 text-white' : etat.cls)}>{etat.label}</span>
                  </div>
                  <p className={cn('mt-0.5 text-[11px]', active ? 'text-white/70' : 'text-ink-muted')}>
                    {fmtDate(s.date_debut, 'dd MMM')} → {fmtDate(s.date_fin, 'dd MMM')} · {own.length} tâche{own.length > 1 ? 's' : ''}
                  </p>
                </button>
              );
            })}
            {sansSprint > 0 && (
              <button
                onClick={() => setSelectedId(NO_SPRINT)}
                className={cn(
                  'min-w-[160px] shrink-0 rounded-[20px] border-2 border-dashed px-4 py-3 text-left transition',
                  selectedId === NO_SPRINT ? 'border-indigo-800 bg-indigo-50 text-indigo-800' : 'border-indigo-100 text-ink-soft hover:border-indigo-200',
                )}
              >
                <span className="text-sm font-extrabold">Sans sprint</span>
                <p className="mt-0.5 text-[11px] text-ink-muted">{sansSprint} tâche{sansSprint > 1 ? 's' : ''}</p>
              </button>
            )}
          </div>

          {/* Résumé du sprint */}
          {selectedId && (
            <Card
              hoverable={false}
              className="mb-5"
              title={selected ? selected.nom : 'Tâches sans sprint'}
              subtitle={
                selected ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarRange className="h-3.5 w-3.5" />
                    {fmtDate(selected.date_debut)} → {fmtDate(selected.date_fin)}
                  </span>
                ) : (
                  'Tâches non rattachées à un sprint'
                )
              }
              action={
                selected && (
                  <Button variant="soft" size="sm" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => setSprintModal({ sprint: selected })}>
                    Modifier
                  </Button>
                )
              }
            >
              {selected?.objectif && (
                <p className="mb-4 flex items-start gap-2 rounded-2xl bg-lavender-soft px-4 py-3 text-sm text-ink-soft">
                  <Target className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                  {selected.objectif}
                </p>
              )}
              <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="font-bold text-ink-soft">Progression du sprint</span>
                    <span className="font-extrabold text-ink">{Math.round(pct)} %</span>
                  </div>
                  <ProgressBar value={pct} size="md" />
                </div>
                <div className="flex gap-6 text-center">
                  <Stat label="Tâches terminées" value={`${tachesDone}/${taches.length}`} />
                  <Stat label="Sous-tâches terminées" value={`${sousDone}/${allSous.length}`} />
                </div>
              </div>
            </Card>
          )}

          {/* Tâches du sprint */}
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-ink">Tâches ({taches.length})</h2>
            <Button
              variant="soft"
              size="sm"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => editor.create(selected ? { sprint_id: selected.id, date_debut: selected.date_debut, deadline: selected.date_fin } : undefined)}
            >
              Ajouter une tâche
            </Button>
          </div>
          {taches.length === 0 ? (
            <Card hoverable={false}>
              <EmptyState
                icon={<ListChecks className="h-6 w-6" />}
                title="Aucune tâche dans ce sprint"
                description="Ajoutez une tâche, ou rattachez une tâche existante via le suivi hebdomadaire."
              />
            </Card>
          ) : (
            <ul className="space-y-3">
              {taches.map((t, i) => (
                <TacheAccordion
                  key={t.id}
                  tache={t}
                  membre={t.membre_id ? membreById.get(t.membre_id) : undefined}
                  sousTaches={sousByTache.get(t.id) ?? []}
                  defaultOpen={i === 0}
                  onEditTache={editor.edit}
                />
              ))}
            </ul>
          )}
        </>
      )}

      <SprintFormModal
        open={!!sprintModal}
        sprint={sprintModal?.sprint}
        onClose={() => setSprintModal(null)}
        onSaved={(s) => setSelectedId(s.id)}
      />
      {editor.ui}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xl font-extrabold text-ink">{value}</p>
      <p className="text-[11px] text-ink-muted">{label}</p>
    </div>
  );
}
