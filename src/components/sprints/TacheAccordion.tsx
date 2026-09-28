import { useState } from 'react';
import { Calculator, Check, ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react';
import { Avatar, Badge, Button, ProgressBar } from '@/components/ui';
import { StatusBadge } from '@/components/taches/TacheBadges';
import { JoursRestants } from '@/components/taches/JoursRestants';
import { addSousTache, editSousTache, editTache, removeSousTache } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import { errorMessage } from '@/lib/api/errors';
import { cn } from '@/lib/utils/cn';
import { fmtDate } from '@/lib/utils/dates';
import { SOUS_STATUS_LABELS } from '@/lib/utils/labels';
import type { Membre, SousTache, Tache } from '@/types/database';
import { SousTacheForm, type SousTacheValues } from './SousTacheForm';

interface Props {
  tache: Tache;
  membre?: Membre;
  sousTaches: SousTache[];
  defaultOpen?: boolean;
  onEditTache: (t: Tache) => void;
}

export const moyenneSousTaches = (list: SousTache[]) =>
  list.length ? Math.round(list.reduce((s, x) => s + (x.avancement ?? 0), 0) / list.length) : null;

export function TacheAccordion({ tache, membre, sousTaches, defaultOpen, onEditTache }: Props) {
  const toast = useToast();
  const [open, setOpen] = useState(!!defaultOpen);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recalcBusy, setRecalcBusy] = useState(false);

  const done = sousTaches.filter((s) => s.status === 'done').length;
  const moyenne = moyenneSousTaches(sousTaches);
  const ecart = moyenne !== null && moyenne !== tache.avancement;

  const run = async (fn: () => Promise<unknown>, success?: string) => {
    try {
      await fn();
      if (success) toast.success(success);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const create = (v: SousTacheValues) =>
    run(async () => {
      await addSousTache({ ...v, tache_id: tache.id });
      setAdding(false);
    }, 'Sous-tâche ajoutée.');

  const update = (id: string, v: SousTacheValues) =>
    run(async () => {
      await editSousTache(id, v);
      setEditingId(null);
    }, 'Sous-tâche mise à jour.');

  const toggle = (s: SousTache) =>
    run(() => editSousTache(s.id, s.status === 'done' ? { status: 'to_do', avancement: 0 } : { status: 'done' }));

  const recalc = async () => {
    if (moyenne === null) return;
    setRecalcBusy(true);
    await run(() => editTache(tache.id, { avancement: moyenne }), `Avancement de la tâche recalculé : ${moyenne} %.`);
    setRecalcBusy(false);
  };

  return (
    <li className="overflow-hidden rounded-[20px] bg-white shadow-card transition-shadow hover:shadow-card-hover">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 text-left"
      >
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-ink-muted transition-transform', open && 'rotate-180')} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-ink">{tache.titre}</p>
          <p className="text-xs text-ink-muted">
            {membre?.nom_complet ?? 'Non assignée'} · deadline {fmtDate(tache.deadline, 'dd MMM')}
          </p>
        </div>
        <Avatar name={membre?.nom_complet ?? '?'} src={membre?.avatar_url} size={28} className="hidden sm:inline-flex" />
        <StatusBadge value={tache.status} />
        <Badge tone="lilac">
          {done}/{sousTaches.length} sous-tâche{sousTaches.length > 1 ? 's' : ''}
        </Badge>
        <ProgressBar value={tache.avancement} tone="auto" size="xs" showLabel className="w-full sm:w-36" />
      </button>

      {open && (
        <div className="border-t border-ink-line px-5 pb-5 pt-4 animate-fade-up">
          {ecart && (
            <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-coral-50 px-4 py-3 sm:flex-row sm:items-center">
              <Calculator className="hidden h-4 w-4 shrink-0 text-coral-600 sm:block" />
              <p className="flex-1 text-xs text-ink-soft">
                Moyenne des sous-tâches : <b className="text-ink">{moyenne} %</b> — avancement actuel de la tâche :{' '}
                <b className="text-ink">{tache.avancement} %</b>.
              </p>
              <Button size="sm" variant="coral" loading={recalcBusy} onClick={recalc}>
                Recalculer l’avancement
              </Button>
            </div>
          )}

          {sousTaches.length === 0 && !adding && <p className="mb-3 text-xs text-ink-muted">Aucune sous-tâche pour cette tâche.</p>}

          <ul className="space-y-2">
            {sousTaches.map((s) =>
              editingId === s.id ? (
                <li key={s.id}>
                  <SousTacheForm initial={s} onSubmit={(v) => update(s.id, v)} onCancel={() => setEditingId(null)} />
                </li>
              ) : (
                <li key={s.id} className="group flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl px-3 py-2.5 transition hover:bg-lavender-soft">
                  <button
                    type="button"
                    onClick={() => toggle(s)}
                    aria-label={s.status === 'done' ? 'Décocher' : 'Cocher comme terminée'}
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition',
                      s.status === 'done' ? 'border-indigo-800 bg-indigo-800 text-white' : 'border-indigo-200 hover:border-indigo-600',
                    )}
                  >
                    {s.status === 'done' && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </button>
                  <span className={cn('min-w-0 flex-1 truncate text-sm', s.status === 'done' ? 'text-ink-muted line-through' : 'text-ink')}>{s.titre}</span>
                  <Badge tone={s.status === 'done' ? 'indigo' : s.status === 'in_progress' ? 'indigoSoft' : 'neutral'}>{SOUS_STATUS_LABELS[s.status]}</Badge>
                  <span className="hidden text-xs text-ink-muted md:inline">
                    {fmtDate(s.date_debut, 'dd/MM')} → {fmtDate(s.deadline, 'dd/MM')}
                  </span>
                  <JoursRestants deadline={s.deadline} status={s.status === 'done' ? 'done' : undefined} className="hidden md:inline" />
                  <ProgressBar value={s.avancement} size="xs" showLabel className="w-28" />
                  <div className="flex gap-1 opacity-60 transition group-hover:opacity-100">
                    <button onClick={() => setEditingId(s.id)} aria-label="Modifier la sous-tâche" className="rounded-full p-1.5 text-ink-muted hover:bg-indigo-50 hover:text-indigo-800">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Supprimer la sous-tâche « ${s.titre} » ?`)) void run(() => removeSousTache(s.id), 'Sous-tâche supprimée.');
                      }}
                      aria-label="Supprimer la sous-tâche"
                      className="rounded-full p-1.5 text-ink-muted hover:bg-coral-50 hover:text-coral-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ),
            )}
          </ul>

          <div className="mt-3">
            {adding ? (
              <SousTacheForm onSubmit={create} onCancel={() => setAdding(false)} />
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button variant="soft" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setAdding(true)}>
                  Ajouter une sous-tâche
                </Button>
                <Button variant="ghost" size="sm" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => onEditTache(tache)}>
                  Modifier la tâche
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
