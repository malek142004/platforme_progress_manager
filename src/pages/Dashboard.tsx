import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  eachDayOfInterval,
  endOfDay,
  endOfWeek,
  format,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowDown, ArrowUp, BarChart3, CalendarClock, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Avatar,
  Button,
  Card,
  CardSkeleton,
  EmptyState,
  ErrorState,
  PillSelect,
  ProgressBar,
  SearchPill,
  SegmentedPills,
} from '@/components/ui';
import { ActivityAreas, type ActivityPoint } from '@/components/charts/ActivityAreas';
import { AvancementMembreChart } from '@/components/charts/AvancementMembreChart';
import { MiniCalendar } from '@/components/charts/MiniCalendar';
import { PerformanceLineChart } from '@/components/charts/PerformanceLineChart';
import { RadialGauge } from '@/components/charts/RadialGauge';
import { SegmentBar } from '@/components/charts/SegmentBar';
import { StackedMembreBars, type StackMode } from '@/components/charts/StackedMembreBars';
import { StatusDonut } from '@/components/charts/StatusDonut';
import { JoursRestants } from '@/components/taches/JoursRestants';
import { RisqueBadge } from '@/components/taches/TacheBadges';
import { useMembres, usePerformance, useSprints, useTaches } from '@/hooks/useData';
import { combine } from '@/hooks/useResource';
import {
  inRange,
  isEnRetard,
  joursRestants,
  PERIODE_OPTIONS,
  PERIODE_SUFFIX,
  periodRange,
  previousRange,
  tacheInRange,
  toDate,
  type Periode,
  type Range,
} from '@/lib/utils/dates';
import { memberColor, RISQUE_COLORS, RISQUE_LABELS, RISQUE_ORDER } from '@/lib/utils/labels';
import { avancementGlobal, cumulativeDone, firstName, snapshotDates, snapshotSeries, statsFor } from '@/lib/utils/stats';
import type { Tache } from '@/types/database';

function countDone(taches: Tache[], range: Range | null) {
  return taches.filter((t) => t.status === 'done' && (!range || inRange(toDate(t.updated_at), range))).length;
}

function activity(taches: Tache[], periode: Periode, range: Range | null): ActivityPoint[] {
  const now = new Date();
  const buckets: { label: string; start: Date; end: Date }[] =
    periode === 'all' || !range
      ? Array.from({ length: 12 }, (_, i) => {
          const start = startOfWeek(subWeeks(now, 11 - i), { weekStartsOn: 1 });
          return { label: format(start, 'dd/MM'), start, end: endOfWeek(start, { weekStartsOn: 1 }) };
        })
      : eachDayOfInterval(range).map((d) => ({
          label: format(d, periode === 'week' ? 'EEE' : 'd', { locale: fr }),
          start: d,
          end: endOfDay(d),
        }));
  return buckets.map((b) => ({
    label: b.label,
    creees: taches.filter((t) => inRange(toDate(t.created_at), b)).length,
    terminees: taches.filter((t) => t.status === 'done' && inRange(toDate(t.updated_at), b)).length,
  }));
}

export default function Dashboard() {
  const navigate = useNavigate();
  const membresR = useMembres();
  const tachesR = useTaches();
  const sprintsR = useSprints();
  const perfR = usePerformance();
  const state = combine(membresR, tachesR, sprintsR, perfR);

  const [periode, setPeriode] = useState<Periode>('month');
  const [stackMode, setStackMode] = useState<StackMode>('priorite');
  const [perfMembre, setPerfMembre] = useState<string>('all');
  const [search, setSearch] = useState('');

  const membres = useMemo(() => membresR.data ?? [], [membresR.data]);
  const taches = useMemo(() => tachesR.data ?? [], [tachesR.data]);
  const sprints = sprintsR.data ?? [];
  const perf = perfR.data ?? [];

  const range = periodRange(periode);
  const filtered = useMemo(() => taches.filter((t) => tacheInRange(t, range)), [taches, periode]); // eslint-disable-line react-hooks/exhaustive-deps

  const header = (
    <PageHeader
      title="Tableau de bord"
      subtitle={`${format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })} · vue d'ensemble de l'équipe`}
      actions={<SegmentedPills value={periode} options={PERIODE_OPTIONS} onChange={setPeriode} />}
    />
  );

  if (state.error) {
    return (
      <>
        {header}
        <Card hoverable={false}>
          <ErrorState message={state.error} onRetry={state.reload} />
        </Card>
      </>
    );
  }

  if (state.loading) {
    return (
      <>
        {header}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} className={i === 4 ? 'xl:col-span-2' : undefined} lines={i % 3 === 0 ? 4 : 0} />
          ))}
        </div>
      </>
    );
  }

  // --- KPI ---
  const doneNow = countDone(taches, range);
  const prev = previousRange(periode);
  const donePrev = prev ? countDone(taches, prev) : null;
  const delta = donePrev === null ? null : doneNow - donePrev;
  const enRetard = filtered.filter((t) => isEnRetard(t)).length;
  const globalPct = avancementGlobal(filtered);
  const doneFiltered = filtered.filter((t) => t.status === 'done').length;

  // --- Sprints ---
  const sprintRows = sprints.slice(0, 4).map((s) => {
    const own = taches.filter((t) => t.sprint_id === s.id);
    return { sprint: s, pct: avancementGlobal(own), count: own.length };
  });

  // --- Performance dans le temps ---
  const visibleMembres = perfMembre === 'all' ? membres : membres.filter((m) => m.id === perfMembre);
  const snapPoints = snapshotDates(perf) >= 2 ? snapshotSeries(perf, membres, range) : [];
  const useSnapshots = snapPoints.length >= 2;
  const perfData = useSnapshots ? snapPoints : cumulativeDone(taches, membres, range);
  const perfSeries = visibleMembres.map((m) => ({
    key: m.id,
    name: firstName(m),
    color: memberColor(membres.indexOf(m)),
  }));

  // --- Avancement par membre ---
  const avancementData = membres.map((m) => {
    const st = statsFor(filtered.filter((t) => t.membre_id === m.id));
    return { name: firstName(m), avancement: st.avancementMoyen, completion: st.taux };
  });

  // --- Tâches à risque / deadlines proches ---
  const aRisque = filtered
    .filter((t) => {
      if (t.status === 'done') return false;
      const j = joursRestants(t.deadline);
      return t.risque === 'moyen' || t.risque === 'eleve' || (j !== null && j <= 3);
    })
    .sort((a, b) => (joursRestants(a.deadline) ?? 9999) - (joursRestants(b.deadline) ?? 9999))
    .slice(0, 6);

  const membreById = new Map(membres.map((m) => [m.id, m]));
  const emptyPeriod = filtered.length === 0;
  const emptyMsg = taches.length === 0 ? 'Aucune tâche pour le moment.' : 'Aucune tâche sur cette période.';

  return (
    <>
      {header}

      <div className="grid grid-flow-row-dense grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {/* KPI terminées vs en retard */}
        <Card title="Tâches" subtitle={`Période : ${PERIODE_SUFFIX[periode]}`} delay={0}>
          <div className="flex items-center gap-2">
            <ArrowUp className="h-7 w-7 text-indigo-600" strokeWidth={2.6} />
            <span className="text-[40px] font-medium leading-none text-ink">{doneNow}</span>
          </div>
          <p className="mt-2 pl-9 text-xs leading-relaxed text-ink-muted">
            Terminées {PERIODE_SUFFIX[periode]}
            {delta !== null && (
              <>
                <br />
                <span className="font-bold text-ink-soft">
                  {delta >= 0 ? '+' : ''}
                  {delta}
                </span>{' '}
                vs {periode === 'week' ? 'semaine' : 'mois'} précédent{periode === 'week' ? 'e' : ''}
              </>
            )}
          </p>
          <hr className="my-5 border-ink-line" />
          <div className="flex items-center gap-2">
            <ArrowDown className="h-7 w-7 text-coral-600" strokeWidth={2.6} />
            <span className="text-[40px] font-medium leading-none text-ink">{enRetard}</span>
          </div>
          <p className="mt-2 pl-9 text-xs text-ink-muted">En retard (deadline dépassée)</p>
        </Card>

        {/* Calendrier */}
        <Card delay={60}>
          <MiniCalendar taches={taches} />
        </Card>

        {/* Progression des sprints */}
        <Card title="Sprints" subtitle="Avancement moyen des tâches" delay={120}>
          {sprintRows.length === 0 ? (
            <EmptyState className="!py-4" title="Aucun sprint" description="Créez un sprint dans Sprint Backlog." />
          ) : (
            <ul className="space-y-4">
              {sprintRows.map(({ sprint, pct, count }, i) => (
                <li key={sprint.id}>
                  <ProgressBar value={pct} tone={i % 2 === 1 ? 'coral' : 'indigo'} />
                  <div className="mt-1.5 flex justify-between text-xs">
                    <span className="truncate text-ink-muted">{sprint.nom}</span>
                    <span className="shrink-0 font-bold text-ink-soft">
                      {Math.round(pct)}% · {count} tâche{count > 1 ? 's' : ''}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recherche + activité */}
        <div className="flex flex-col gap-5">
          <SearchPill
            value={search}
            onChange={setSearch}
            placeholder="Rechercher une tâche…"
            onSubmit={() => navigate(`/weekly${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`)}
            className="animate-fade-up"
          />
          <Card title="Activité" subtitle="Tâches créées et terminées" delay={180} className="flex-1">
            {taches.length === 0 ? (
              <EmptyState className="!py-4" title="Aucune activité" description="Les tâches créées et terminées apparaîtront ici." />
            ) : (
              <ActivityAreas data={activity(taches, periode, range)} />
            )}
          </Card>
        </div>

        {/* Courbe de performance */}
        <Card
          title="Évolution de la performance"
          subtitle={useSnapshots ? 'Score de performance (snapshots)' : 'Tâches terminées cumulées (calculé depuis les tâches)'}
          className="md:col-span-2"
          delay={240}
          action={
            <PillSelect
              aria-label="Membre"
              value={perfMembre}
              onChange={setPerfMembre}
              options={[{ value: 'all', label: 'Tous' }, ...membres.map((m) => ({ value: m.id, label: firstName(m) }))]}
            />
          }
        >
          {perfData.length === 0 || perfSeries.length === 0 ? (
            <EmptyState
              icon={<BarChart3 className="h-6 w-6" />}
              title="Pas encore de données"
              description="La courbe apparaîtra dès que des tâches seront terminées."
            />
          ) : (
            <PerformanceLineChart data={perfData} series={perfSeries} area={perfSeries.length <= 2} allowDecimals={useSnapshots} />
          )}
        </Card>

        {/* Jauge avancement global */}
        <Card title="Avancement global" subtitle="Moyenne de l'avancement des tâches" delay={300} bodyClassName="flex flex-col items-center">
          <div className="my-3">
            <RadialGauge value={globalPct} />
          </div>
          <p className="mb-5 mt-2 text-center text-xs leading-relaxed text-ink-muted">
            {emptyPeriod ? emptyMsg : `${doneFiltered} tâche${doneFiltered > 1 ? 's' : ''} terminée${doneFiltered > 1 ? 's' : ''} sur ${filtered.length}`}
          </p>
          <Button size="lg" className="mt-auto w-full max-w-[200px]" onClick={() => navigate('/weekly')}>
            Voir le suivi
          </Button>
        </Card>

        {/* Colonne droite : risques + donut */}
        <div className="flex flex-col gap-5 xl:row-span-2">
          <Card title="Répartition des risques" delay={360}>
            {emptyPeriod ? (
              <p className="text-xs text-ink-muted">{emptyMsg}</p>
            ) : (
              <SegmentBar
                segments={RISQUE_ORDER.map((r) => ({
                  key: r,
                  label: RISQUE_LABELS[r],
                  value: filtered.filter((t) => t.risque === r).length,
                  color: RISQUE_COLORS[r],
                }))}
              />
            )}
          </Card>
          <Card title="Tâches par status" subtitle={PERIODE_SUFFIX[periode]} delay={420} className="flex-1">
            {emptyPeriod ? <EmptyState title="Rien à afficher" description={emptyMsg} /> : <StatusDonut taches={filtered} />}
          </Card>
        </div>

        {/* Barres empilées priorité / risque */}
        <Card
          title={stackMode === 'priorite' ? 'Priorités par membre' : 'Risques par membre'}
          delay={480}
          action={
            <PillSelect
              aria-label="Répartition"
              value={stackMode}
              onChange={setStackMode}
              options={[
                { value: 'priorite', label: 'Priorité' },
                { value: 'risque', label: 'Risque' },
              ]}
            />
          }
        >
          {membres.length === 0 || emptyPeriod ? (
            <EmptyState title="Rien à afficher" description={membres.length ? emptyMsg : 'Aucun membre dans la base.'} />
          ) : (
            <StackedMembreBars taches={filtered} membres={membres} mode={stackMode} />
          )}
        </Card>

        {/* Histogramme avancement par membre */}
        <Card title="Avancement par membre" subtitle="En %" className="md:col-span-2" delay={540}>
          {membres.length === 0 ? (
            <EmptyState title="Aucun membre" description="Ajoutez des membres dans Supabase." />
          ) : (
            <AvancementMembreChart data={avancementData} />
          )}
        </Card>

        {/* Tâches à risque / deadlines proches */}
        <Card
          title="Tâches à risque & deadlines proches"
          subtitle="Risque moyen/élevé ou deadline dans 3 jours ou moins"
          className="md:col-span-2 xl:col-span-4"
          delay={600}
          action={
            <Button variant="soft" size="sm" onClick={() => navigate('/weekly')}>
              Tout voir
            </Button>
          }
        >
          {aRisque.length === 0 ? (
            <EmptyState
              icon={<ShieldAlert className="h-6 w-6" />}
              title="Rien d'urgent"
              description="Aucune tâche à risque ni deadline proche sur cette période."
            />
          ) : (
            <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {aRisque.map((t) => {
                const m = t.membre_id ? membreById.get(t.membre_id) : undefined;
                return (
                  <li
                    key={t.id}
                    onClick={() => navigate(`/weekly?q=${encodeURIComponent(t.titre)}`)}
                    className="cursor-pointer rounded-2xl bg-lavender-soft p-4 transition hover:bg-indigo-50"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar name={m?.nom_complet} src={m?.avatar_url} size={34} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-ink">{t.titre}</p>
                        <p className="truncate text-xs text-ink-muted">{m?.nom_complet ?? 'Non assignée'}</p>
                      </div>
                      <RisqueBadge value={t.risque} />
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <CalendarClock className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                      <JoursRestants deadline={t.deadline} status={t.status} />
                      <ProgressBar value={t.avancement} tone="auto" size="xs" className="flex-1" showLabel />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

