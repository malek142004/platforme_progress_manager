import { useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { CalendarDays, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar, Button, Card, ErrorState, PillSelect, ProgressBar, Skeleton } from '@/components/ui';
import { JoursRestants } from '@/components/taches/JoursRestants';
import { PrioriteBadge } from '@/components/taches/TacheBadges';
import { useTacheEditor } from '@/components/taches/useTacheEditor';
import { ViewSwitch } from '@/components/taches/ViewSwitch';
import { editTache, useMembres, useSprints, useTaches } from '@/hooks/useData';
import { combine } from '@/hooks/useResource';
import { useToast } from '@/hooks/useToast';
import { errorMessage } from '@/lib/api/errors';
import { cn } from '@/lib/utils/cn';
import { fmtDate, joursRestants } from '@/lib/utils/dates';
import { STATUS_COLORS, STATUS_LABELS, STATUS_ORDER } from '@/lib/utils/labels';
import type { StatusTache, Tache } from '@/types/database';

const COLUMN_TITLES: Record<StatusTache, string> = {
  to_do: 'To do',
  in_progress: 'In progress',
  in_review: 'In review',
  done: 'Done',
};

const byDeadline = (a: Tache, b: Tache) => (joursRestants(a.deadline) ?? 99999) - (joursRestants(b.deadline) ?? 99999);

export default function Taskboard() {
  const toast = useToast();
  const membresR = useMembres();
  const tachesR = useTaches();
  const sprintsR = useSprints();
  const state = combine(membresR, tachesR, sprintsR);
  const membres = membresR.data ?? [];
  const editor = useTacheEditor(membres, sprintsR.data ?? []);
  const [fMembre, setFMembre] = useState('all');

  const membreById = useMemo(() => new Map(membres.map((m) => [m.id, m])), [membres]);

  const columns = useMemo(() => {
    const visible = (tachesR.data ?? []).filter((t) => fMembre === 'all' || (fMembre === 'none' ? !t.membre_id : t.membre_id === fMembre));
    return Object.fromEntries(STATUS_ORDER.map((s) => [s, visible.filter((t) => t.status === s).sort(byDeadline)])) as Record<StatusTache, Tache[]>;
  }, [tachesR.data, fMembre]);

  async function onDragEnd({ source, destination, draggableId }: DropResult) {
    if (!destination || destination.droppableId === source.droppableId) return;
    const status = destination.droppableId as StatusTache;
    const tache = tachesR.data?.find((t) => t.id === draggableId);
    try {
      // Mise à jour optimiste (cache modifié immédiatement, rollback si erreur).
      // Passage à « done » ⇒ avancement = 100 (règle appliquée dans editTache).
      await editTache(draggableId, { status });
      if (status === 'done') toast.success(`« ${tache?.titre ?? 'Tâche'} » terminée.`);
    } catch (err) {
      toast.error(`Déplacement annulé : ${errorMessage(err)}`);
    }
  }

  return (
    <>
      <PageHeader
        title="Taskboard"
        subtitle="Glissez les cartes d'une colonne à l'autre pour changer leur status"
        actions={
          <>
            <ViewSwitch current="board" />
            <PillSelect
              aria-label="Filtrer par membre"
              value={fMembre}
              onChange={setFMembre}
              className="[&_select]:h-10 [&_select]:bg-white [&_select]:shadow-card"
              options={[
                { value: 'all', label: 'Tous les membres' },
                { value: 'none', label: 'Non assignées' },
                ...membres.map((m) => ({ value: m.id, label: m.nom_complet })),
              ]}
            />
            <Button icon={<Plus className="h-4 w-4" />} onClick={() => editor.create()} disabled={state.loading}>
              Nouvelle tâche
            </Button>
          </>
        }
      />

      {state.error ? (
        <Card hoverable={false}>
          <ErrorState message={state.error} onRetry={state.reload} />
        </Card>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="scrollbar-thin -mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 xl:grid xl:grid-cols-4 xl:overflow-visible">
            {STATUS_ORDER.map((status, ci) => {
              const items = columns[status] ?? [];
              return (
                <section
                  key={status}
                  style={{ animationDelay: `${ci * 70}ms` }}
                  className="flex w-[82vw] max-w-[320px] shrink-0 snap-start flex-col rounded-card bg-white/55 p-3 animate-fade-up sm:w-[300px] xl:w-auto xl:max-w-none"
                >
                  <header className="mb-3 flex items-center gap-2 px-2 pt-1">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[status] }} />
                    <h2 className="text-sm font-extrabold text-ink">{COLUMN_TITLES[status]}</h2>
                    <span className="text-xs text-ink-muted">{STATUS_LABELS[status]}</span>
                    <span className="ml-auto rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-ink-soft shadow-card">
                      {state.loading ? '·' : items.length}
                    </span>
                  </header>

                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          'flex min-h-[160px] flex-1 flex-col gap-3 rounded-2xl p-1 transition-colors',
                          snapshot.isDraggingOver && 'bg-indigo-50/80 ring-2 ring-indigo-200',
                        )}
                      >
                        {state.loading ? (
                          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-card" />)
                        ) : items.length === 0 && !snapshot.isDraggingOver ? (
                          <p className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-indigo-100 px-4 py-8 text-center text-xs text-ink-muted">
                            Déposez une tâche ici
                          </p>
                        ) : (
                          items.map((t, index) => {
                            const m = t.membre_id ? membreById.get(t.membre_id) : undefined;
                            return (
                              <Draggable key={t.id} draggableId={t.id} index={index}>
                                {(drag, dragSnap) => (
                                  <article
                                    ref={drag.innerRef}
                                    {...drag.draggableProps}
                                    {...drag.dragHandleProps}
                                    onClick={() => editor.edit(t)}
                                    className={cn(
                                      'cursor-grab rounded-[20px] bg-white p-4 shadow-card transition-shadow active:cursor-grabbing',
                                      'hover:shadow-card-hover',
                                      dragSnap.isDragging && 'rotate-[1.5deg] shadow-card-hover ring-2 ring-indigo-200',
                                    )}
                                  >
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink">{t.titre}</h3>
                                      <PrioriteBadge value={t.priorite} />
                                    </div>
                                    <div className="mb-3 flex items-center gap-2 text-xs text-ink-muted">
                                      <CalendarDays className="h-3.5 w-3.5" />
                                      <span>{fmtDate(t.deadline, 'dd MMM')}</span>
                                      <span className="text-ink-line">•</span>
                                      <JoursRestants deadline={t.deadline} status={t.status} />
                                    </div>
                                    <ProgressBar value={t.avancement} tone={t.status === 'done' ? 'indigo' : 'auto'} size="xs" showLabel />
                                    <div className="mt-3 flex items-center gap-2">
                                      <Avatar name={m?.nom_complet ?? '?'} src={m?.avatar_url} size={26} />
                                      <span className="truncate text-xs font-semibold text-ink-soft">{m?.nom_complet ?? 'Non assignée'}</span>
                                    </div>
                                  </article>
                                )}
                              </Draggable>
                            );
                          })
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </section>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {editor.ui}
    </>
  );
}
