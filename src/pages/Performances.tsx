import { useMemo, useState } from 'react';
import { AlarmClock, Camera, FileDown, FileSpreadsheet, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar, Button, Card, CardSkeleton, EmptyState, ErrorState, PillSelect, ProgressBar } from '@/components/ui';
import { PerformanceLineChart } from '@/components/charts/PerformanceLineChart';
import { takeSnapshot, useMembres, usePerformance, useTaches } from '@/hooks/useData';
import { combine } from '@/hooks/useResource';
import { useToast } from '@/hooks/useToast';
import { errorMessage } from '@/lib/api/errors';
import { cn } from '@/lib/utils/cn';
import { fmtDate } from '@/lib/utils/dates';
import { exportCsv, exportPdf, type PerfRow } from '@/lib/utils/export';
import { memberColor } from '@/lib/utils/labels';
import { cumulativeDone, firstName, snapshotDates, snapshotSeries, statsFor } from '@/lib/utils/stats';

export default function Performances() {
  const toast = useToast();
  const membresR = useMembres();
  const tachesR = useTaches();
  const perfR = usePerformance();
  const state = combine(membresR, tachesR, perfR);
  const membres = useMemo(() => membresR.data ?? [], [membresR.data]);
  const taches = useMemo(() => tachesR.data ?? [], [tachesR.data]);
  const perf = perfR.data ?? [];

  const [selected, setSelected] = useState('all');
  const [snapBusy, setSnapBusy] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  const visible = selected === 'all' ? membres : membres.filter((m) => m.id === selected);
  const scope = selected === 'all' ? 'Tous les membres' : visible[0]?.nom_complet ?? '';

  const rows: PerfRow[] = useMemo(
    () => visible.map((m) => ({ membre: m, stats: statsFor(taches.filter((t) => t.membre_id === m.id)) })),
    [visible, taches],
  );

  const series = visible.map((m) => ({ key: m.id, name: firstName(m), color: memberColor(membres.indexOf(m)) }));
  const cumul = useMemo(() => cumulativeDone(taches, membres, null), [taches, membres]);
  const snapPoints = snapshotSeries(perf, membres, null);
  const lastSnapshot = perf.length ? perf[perf.length - 1].date_snapshot : null;

  async function snapshot() {
    setSnapBusy(true);
    try {
      const { inserted, source } = await takeSnapshot(membres, taches);
      if (inserted === 0) toast.info("Un snapshot existe déjà aujourd'hui pour chaque membre.");
      else toast.success(`Snapshot enregistré pour ${inserted} membre${inserted > 1 ? 's' : ''}${source === 'sql' ? ' (fonction SQL)' : ''}.`);
    } catch (err) {
      toast.error(`Snapshot impossible : ${errorMessage(err)}`);
    } finally {
      setSnapBusy(false);
    }
  }

  async function pdf() {
    setPdfBusy(true);
    try {
      await exportPdf(rows, taches, scope);
    } catch (err) {
      toast.error(`Export PDF impossible : ${errorMessage(err)}`);
    } finally {
      setPdfBusy(false);
    }
  }

  const disabled = state.loading || membres.length === 0;

  return (
    <>
      <PageHeader
        title="Performances"
        subtitle="Progression et indicateurs par membre"
        actions={
          <>
            <PillSelect
              aria-label="Membre"
              value={selected}
              onChange={setSelected}
              className="[&_select]:h-10 [&_select]:bg-white [&_select]:shadow-card"
              options={[{ value: 'all', label: 'Tous les membres' }, ...membres.map((m) => ({ value: m.id, label: m.nom_complet }))]}
            />
            <Button variant="soft" icon={<FileSpreadsheet className="h-4 w-4" />} disabled={disabled} onClick={() => exportCsv(rows, taches, scope)}>
              CSV
            </Button>
            <Button variant="soft" icon={<FileDown className="h-4 w-4" />} disabled={disabled} loading={pdfBusy} onClick={pdf}>
              PDF
            </Button>
            <Button icon={<Camera className="h-4 w-4" />} disabled={disabled} loading={snapBusy} onClick={snapshot}>
              Enregistrer un snapshot maintenant
            </Button>
          </>
        }
      />

      {state.error ? (
        <Card hoverable={false}>
          <ErrorState message={state.error} onRetry={state.reload} />
        </Card>
      ) : state.loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <CardSkeleton className="md:col-span-2 xl:col-span-3" />
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} lines={4} />
          ))}
        </div>
      ) : membres.length === 0 ? (
        <Card hoverable={false}>
          <EmptyState title="Aucun membre" description="Ajoutez les membres de l'équipe dans la table membres de Supabase." />
        </Card>
      ) : (
        <div className="space-y-5">
          <Card
            title="Tâches terminées cumulées"
            subtitle="Calculé depuis les tâches passées à « done » (date de mise à jour)"
            hoverable={false}
          >
            {cumul.length === 0 ? (
              <EmptyState
                icon={<TrendingUp className="h-6 w-6" />}
                title="Aucune tâche terminée pour l'instant"
                description="La courbe de progression apparaîtra dès la première tâche terminée."
              />
            ) : (
              <PerformanceLineChart data={cumul} series={series} height={300} area={series.length === 1} />
            )}
          </Card>

          {/* Cartes récapitulatives */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rows.map(({ membre: m, stats: s }, i) => (
              <Card key={m.id} delay={i * 60}>
                <div className="mb-5 flex items-center gap-3">
                  <Avatar name={m.nom_complet} src={m.avatar_url} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold text-ink">{m.nom_complet}</p>
                    <p className="truncate text-xs text-ink-muted">{[m.tache_dev, m.role_management].filter(Boolean).join(' · ') || m.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold leading-none text-ink">{s.score.toFixed(0)}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Score</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Metric label="Taux de complétion" value={s.taux} detail={`${s.terminees}/${s.totales} tâches`} tone="indigo" />
                  <Metric label="Avancement moyen" value={s.avancementMoyen} tone="coral" />
                </div>
                <div
                  className={cn(
                    'mt-4 flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold',
                    s.enRetard ? 'bg-coral-50 text-[#C4552A]' : 'bg-lavender-soft text-ink-muted',
                  )}
                >
                  <AlarmClock className="h-4 w-4" />
                  {s.enRetard ? `${s.enRetard} tâche${s.enRetard > 1 ? 's' : ''} en retard` : 'Aucune tâche en retard'}
                </div>
              </Card>
            ))}
          </div>

          {/* Historique des snapshots */}
          <Card
            title="Score de performance (snapshots)"
            subtitle={
              lastSnapshot
                ? `Dernier snapshot : ${fmtDate(lastSnapshot)} · score = 0,6 × complétion + 0,4 × avancement`
                : 'Aucun snapshot enregistré : cliquez sur « Enregistrer un snapshot maintenant »'
            }
            hoverable={false}
          >
            {snapshotDates(perf) < 2 ? (
              <EmptyState
                icon={<Camera className="h-6 w-6" />}
                title={perf.length ? 'Un seul snapshot pour le moment' : 'Pas encore d’historique'}
                description="Il faut au moins deux dates de snapshot pour tracer l'évolution du score. Le snapshot hebdomadaire automatique (pg_cron) s'en chargera."
              />
            ) : (
              <PerformanceLineChart data={snapPoints} series={series} height={260} area={series.length === 1} allowDecimals />
            )}
          </Card>
        </div>
      )}
    </>
  );
}

function Metric({ label, value, detail, tone }: { label: string; value: number; detail?: string; tone: 'indigo' | 'coral' }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="text-ink-muted">
          {label}
          {detail && <span className="ml-1 text-ink-muted/80">· {detail}</span>}
        </span>
        <span className="font-bold text-ink">{Math.round(value)} %</span>
      </div>
      <ProgressBar value={value} tone={tone} />
    </div>
  );
}
