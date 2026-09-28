import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, ChevronsUpDown, ClipboardList, FilterX, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar, Button, Card, EmptyState, ErrorState, PillSelect, ProgressBar, SearchPill, Skeleton } from '@/components/ui';
import { JoursRestants } from '@/components/taches/JoursRestants';
import { PrioriteBadge, RisqueBadge, StatusBadge } from '@/components/taches/TacheBadges';
import { useTacheEditor } from '@/components/taches/useTacheEditor';
import { ViewSwitch } from '@/components/taches/ViewSwitch';
import { useMembres, useSprints, useTaches } from '@/hooks/useData';
import { combine } from '@/hooks/useResource';
import { cn } from '@/lib/utils/cn';
import { fmtDate, joursRestants } from '@/lib/utils/dates';
import {
  PRIORITE_LABELS,
  PRIORITE_ORDER,
  RISQUE_LABELS,
  RISQUE_ORDER,
  STATUS_LABELS,
  STATUS_ORDER,
} from '@/lib/utils/labels';
import type { Membre, Tache } from '@/types/database';

type SortKey = 'titre' | 'membre' | 'date_debut' | 'deadline' | 'priorite' | 'status' | 'risque' | 'jours' | 'avancement';

const ALL = 'all';

export default function Weekly() {
  const membresR = useMembres();
  const tachesR = useTaches();
  const sprintsR = useSprints();
  const state = combine(membresR, tachesR, sprintsR);
  const membres = membresR.data ?? [];
  const sprints = sprintsR.data ?? [];
  const taches = tachesR.data;
  const editor = useTacheEditor(membres, sprints);

  const [params, setParams] = useSearchParams();
  const search = params.get('q') ?? '';
  const setSearch = (v: string) => setParams(v ? { q: v } : {}, { replace: true });

  const [fMembre, setFMembre] = useState(ALL);
  const [fStatus, setFStatus] = useState(ALL);
  const [fPrio, setFPrio] = useState(ALL);
  const [fRisque, setFRisque] = useState(ALL);
  const [fSprint, setFSprint] = useState(ALL);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'deadline', dir: 1 });

  const membreById = useMemo(() => new Map(membres.map((m) => [m.id, m])), [membres]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = (taches ?? []).filter((t) => {
      if (fMembre !== ALL && (fMembre === 'none' ? t.membre_id : t.membre_id !== fMembre)) return false;
      if (fStatus !== ALL && t.status !== fStatus) return false;
      if (fPrio !== ALL && t.priorite !== fPrio) return false;
      if (fRisque !== ALL && t.risque !== fRisque) return false;
      if (fSprint !== ALL && (fSprint === 'none' ? t.sprint_id : t.sprint_id !== fSprint)) return false;
      if (q) {
        const m = t.membre_id ? membreById.get(t.membre_id)?.nom_complet ?? '' : '';
        const hay = `${t.titre} ${t.description ?? ''} ${t.commentaires ?? ''} ${m}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const value = (t: Tache): string | number => {
      switch (sort.key) {
        case 'membre':
          return (t.membre_id && membreById.get(t.membre_id)?.nom_complet) || '~';
        case 'priorite':
          return PRIORITE_ORDER.indexOf(t.priorite);
        case 'status':
          return STATUS_ORDER.indexOf(t.status);
        case 'risque':
          return RISQUE_ORDER.indexOf(t.risque);
        case 'jours':
          return joursRestants(t.deadline) ?? Number.MAX_SAFE_INTEGER;
        case 'avancement':
          return t.avancement;
        case 'titre':
          return t.titre.toLowerCase();
        default:
          return t[sort.key] ?? '9999';
      }
    };
    return [...list].sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      return (typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'fr')) * sort.dir;
    });
  }, [taches, search, fMembre, fStatus, fPrio, fRisque, fSprint, sort, membreById]);

  const filtersActive = [fMembre, fStatus, fPrio, fRisque, fSprint].some((f) => f !== ALL) || !!search;
  const resetFilters = () => {
    setFMembre(ALL);
    setFStatus(ALL);
    setFPrio(ALL);
    setFRisque(ALL);
    setFSprint(ALL);
    setSearch('');
  };

  const toggleSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));

  const Th = ({ k, children, className }: { k?: SortKey; children: string; className?: string }) => (
    <th scope="col" className={cn('whitespace-nowrap px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-ink-muted', className)}>
      {k ? (
        <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 uppercase transition hover:text-indigo-800">
          {children}
          {sort.key === k ? (
            sort.dir === 1 ? <ArrowUp className="h-3 w-3 text-indigo-800" /> : <ArrowDown className="h-3 w-3 text-indigo-800" />
          ) : (
            <ChevronsUpDown className="h-3 w-3 opacity-50" />
          )}
        </button>
      ) : (
        children
      )}
    </th>
  );

  const all = [{ value: ALL, label: 'Tous' }];

  return (
    <>
      <PageHeader
        title="Suivi hebdomadaire"
        subtitle="Toutes les tâches de l'équipe"
        actions={
          <>
            <ViewSwitch current="table" />
            <Button icon={<Plus className="h-4 w-4" />} onClick={() => editor.create()} disabled={state.loading}>
              Nouvelle tâche
            </Button>
          </>
        }
      />

      {/* Filtres */}
      <div className="mb-5 flex flex-col gap-3 animate-fade-up lg:flex-row lg:items-center">
        <SearchPill value={search} onChange={setSearch} placeholder="Rechercher une tâche, un membre, un commentaire…" className="lg:w-80" />
        <div className="flex flex-wrap items-center gap-2 rounded-card bg-white/60 p-2">
          <FilterLabel>Membre</FilterLabel>
          <PillSelect
            aria-label="Filtrer par membre"
            value={fMembre}
            onChange={setFMembre}
            options={[...all, { value: 'none', label: 'Non assignée' }, ...membres.map((m: Membre) => ({ value: m.id, label: m.nom_complet }))]}
          />
          <FilterLabel>Status</FilterLabel>
          <PillSelect aria-label="Filtrer par status" value={fStatus} onChange={setFStatus} options={[...all, ...STATUS_ORDER.map((s) => ({ value: s, label: STATUS_LABELS[s] }))]} />
          <FilterLabel>Priorité</FilterLabel>
          <PillSelect aria-label="Filtrer par priorité" value={fPrio} onChange={setFPrio} options={[...all, ...PRIORITE_ORDER.map((p) => ({ value: p, label: PRIORITE_LABELS[p] }))]} />
          <FilterLabel>Risque</FilterLabel>
          <PillSelect aria-label="Filtrer par risque" value={fRisque} onChange={setFRisque} options={[...all, ...RISQUE_ORDER.map((r) => ({ value: r, label: RISQUE_LABELS[r] }))]} />
          <FilterLabel>Sprint</FilterLabel>
          <PillSelect
            aria-label="Filtrer par sprint"
            value={fSprint}
            onChange={setFSprint}
            options={[...all, { value: 'none', label: 'Sans sprint' }, ...sprints.map((s) => ({ value: s.id, label: s.nom }))]}
          />
          {filtersActive && (
            <Button variant="ghost" size="sm" icon={<FilterX className="h-3.5 w-3.5" />} onClick={resetFilters}>
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      <Card hoverable={false} className="!p-0" bodyClassName="flex flex-col">
        {state.error ? (
          <ErrorState message={state.error} onRetry={state.reload} />
        ) : state.loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-6 w-6" />}
            title={taches?.length ? 'Aucune tâche ne correspond aux filtres' : 'Aucune tâche pour le moment'}
            description={taches?.length ? 'Modifiez ou réinitialisez les filtres.' : 'Ajoutez la première tâche de l’équipe.'}
            action={
              taches?.length ? (
                <Button variant="soft" size="sm" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              ) : (
                <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => editor.create()}>
                  Nouvelle tâche
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[1180px] border-collapse text-sm">
                <thead className="border-b border-ink-line">
                  <tr>
                    <Th k="titre" className="pl-6">
                      Tâche
                    </Th>
                    <Th k="membre">Membre</Th>
                    <Th k="date_debut">Date début</Th>
                    <Th k="deadline">Deadline</Th>
                    <Th k="priorite">Priorité</Th>
                    <Th k="status">Status</Th>
                    <Th>Commentaires</Th>
                    <Th k="risque">Risque</Th>
                    <Th k="jours">Jours restants</Th>
                    <Th k="avancement">Avancement</Th>
                    <th className="w-20 pr-6" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => {
                    const m = t.membre_id ? membreById.get(t.membre_id) : undefined;
                    return (
                      <tr
                        key={t.id}
                        onClick={() => editor.edit(t)}
                        className="group cursor-pointer border-b border-ink-line/70 transition-colors last:border-0 hover:bg-lavender-soft"
                      >
                        <td className="max-w-[240px] py-3 pl-6 pr-3">
                          <p className="truncate font-bold text-ink" title={t.titre}>
                            {t.titre}
                          </p>
                          {t.description && <p className="truncate text-xs text-ink-muted">{t.description}</p>}
                        </td>
                        <td className="px-3 py-3">
                          {m ? (
                            <div className="flex items-center gap-2">
                              <Avatar name={m.nom_complet} src={m.avatar_url} size={28} />
                              <span className="whitespace-nowrap text-ink-soft">{m.nom_complet}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-ink-muted">Non assignée</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-ink-soft">{fmtDate(t.date_debut, 'dd/MM/yyyy')}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-ink-soft">{fmtDate(t.deadline, 'dd/MM/yyyy')}</td>
                        <td className="px-3 py-3">
                          <PrioriteBadge value={t.priorite} />
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge value={t.status} />
                        </td>
                        <td className="max-w-[200px] px-3 py-3">
                          <p className="line-clamp-2 text-xs text-ink-soft" title={t.commentaires ?? undefined}>
                            {t.commentaires || <span className="text-ink-muted">—</span>}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <RisqueBadge value={t.risque} />
                        </td>
                        <td className="px-3 py-3">
                          <JoursRestants deadline={t.deadline} status={t.status} />
                        </td>
                        <td className="w-40 px-3 py-3">
                          <ProgressBar value={t.avancement} tone="auto" showLabel />
                        </td>
                        <td className="pr-6">
                          <div className="flex justify-end gap-1 opacity-60 transition group-hover:opacity-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                editor.edit(t);
                              }}
                              aria-label={`Modifier ${t.titre}`}
                              className="rounded-full p-2 text-ink-muted hover:bg-indigo-50 hover:text-indigo-800"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                editor.remove(t);
                              }}
                              aria-label={`Supprimer ${t.titre}`}
                              className="rounded-full p-2 text-ink-muted hover:bg-coral-50 hover:text-coral-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="border-t border-ink-line px-6 py-3 text-xs text-ink-muted">
              {rows.length} tâche{rows.length > 1 ? 's' : ''}
              {filtersActive && taches ? ` sur ${taches.length}` : ''}
            </p>
          </>
        )}
      </Card>

      {editor.ui}
    </>
  );
}

function FilterLabel({ children }: { children: string }) {
  return <span className="hidden pl-1 text-[11px] font-bold text-ink-muted xl:inline">{children}</span>;
}
