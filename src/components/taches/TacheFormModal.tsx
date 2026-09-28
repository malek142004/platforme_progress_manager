import { useEffect, useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { addTache, editTache } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import { errorMessage } from '@/lib/api/errors';
import { toInputDate } from '@/lib/utils/dates';
import {
  PRIORITE_LABELS,
  PRIORITE_ORDER,
  RISQUE_LABELS,
  RISQUE_ORDER,
  STATUS_LABELS,
  STATUS_ORDER,
} from '@/lib/utils/labels';
import type { Membre, Priorite, Risque, Sprint, StatusTache, Tache, TacheInsert } from '@/types/database';

interface FormState {
  titre: string;
  description: string;
  membre_id: string;
  sprint_id: string;
  date_debut: string;
  deadline: string;
  priorite: Priorite;
  status: StatusTache;
  risque: Risque;
  avancement: number;
  commentaires: string;
}

function initial(t?: Tache | null, defaults?: Partial<TacheInsert>): FormState {
  const src = { ...defaults, ...t };
  return {
    titre: src.titre ?? '',
    description: src.description ?? '',
    membre_id: src.membre_id ?? '',
    sprint_id: src.sprint_id ?? '',
    date_debut: toInputDate(src.date_debut) || toInputDate(new Date().toISOString()),
    deadline: toInputDate(src.deadline),
    priorite: src.priorite ?? 'moyenne',
    status: src.status ?? 'to_do',
    risque: src.risque ?? 'aucun',
    avancement: src.avancement ?? 0,
    commentaires: src.commentaires ?? '',
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
  tache?: Tache | null;
  defaults?: Partial<TacheInsert>;
  membres: Membre[];
  sprints: Sprint[];
  onDelete?: (t: Tache) => void;
}

export function TacheFormModal({ open, onClose, tache, defaults, membres, sprints, onDelete }: Props) {
  const toast = useToast();
  const [form, setForm] = useState<FormState>(() => initial(tache, defaults));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial(tache, defaults));
      setErrors({});
    }
  }, [open, tache]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'status' && value === 'done') next.avancement = 100;
      return next;
    });

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.titre.trim()) e.titre = 'Le titre est obligatoire.';
    if (form.date_debut && form.deadline && form.deadline < form.date_debut) e.deadline = 'La deadline doit être après la date de début.';
    if (form.avancement < 0 || form.avancement > 100) e.avancement = "L'avancement doit être entre 0 et 100.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    const payload: TacheInsert = {
      titre: form.titre.trim(),
      description: form.description.trim() || null,
      membre_id: form.membre_id || null,
      sprint_id: form.sprint_id || null,
      date_debut: form.date_debut || null,
      deadline: form.deadline || null,
      priorite: form.priorite,
      status: form.status,
      risque: form.risque,
      avancement: Math.round(form.avancement),
      commentaires: form.commentaires.trim() || null,
    };
    setSaving(true);
    try {
      if (tache) {
        await editTache(tache.id, payload);
        toast.success('Tâche mise à jour.');
      } else {
        await addTache(payload);
        toast.success('Tâche ajoutée.');
      }
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={tache ? 'Modifier la tâche' : 'Nouvelle tâche'}
      subtitle={tache ? tache.titre : 'Renseignez les informations de la tâche'}
      footer={
        <div className="flex w-full items-center gap-2">
          {tache && onDelete && (
            <Button variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => onDelete(tache)}>
              Supprimer
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" form="tache-form" loading={saving}>
              {tache ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </div>
        </div>
      }
    >
      <form id="tache-form" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="t-titre">
            Titre *
          </label>
          <input id="t-titre" className="field" value={form.titre} onChange={(e) => set('titre', e.target.value)} autoFocus />
          {errors.titre && <p className="mt-1 text-xs font-semibold text-[#D9412E]">{errors.titre}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="t-desc">
            Description
          </label>
          <textarea id="t-desc" rows={2} className="field resize-none" value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>

        <div>
          <label className="field-label" htmlFor="t-membre">
            Membre
          </label>
          <select id="t-membre" className="field" value={form.membre_id} onChange={(e) => set('membre_id', e.target.value)}>
            <option value="">— Non assignée —</option>
            {membres.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nom_complet}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="t-sprint">
            Sprint
          </label>
          <select id="t-sprint" className="field" value={form.sprint_id} onChange={(e) => set('sprint_id', e.target.value)}>
            <option value="">— Aucun —</option>
            {sprints.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="t-debut">
            Date de début
          </label>
          <input id="t-debut" type="date" className="field" value={form.date_debut} onChange={(e) => set('date_debut', e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="t-deadline">
            Deadline
          </label>
          <input id="t-deadline" type="date" className="field" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
          {errors.deadline && <p className="mt-1 text-xs font-semibold text-[#D9412E]">{errors.deadline}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="t-prio">
            Priorité
          </label>
          <select id="t-prio" className="field" value={form.priorite} onChange={(e) => set('priorite', e.target.value as Priorite)}>
            {PRIORITE_ORDER.map((p) => (
              <option key={p} value={p}>
                {PRIORITE_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="t-status">
            Status
          </label>
          <select id="t-status" className="field" value={form.status} onChange={(e) => set('status', e.target.value as StatusTache)}>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="t-risque">
            Risque
          </label>
          <select id="t-risque" className="field" value={form.risque} onChange={(e) => set('risque', e.target.value as Risque)}>
            {RISQUE_ORDER.map((r) => (
              <option key={r} value={r}>
                {RISQUE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="t-av">
            Avancement : <span className="font-extrabold text-ink">{form.avancement}%</span>
          </label>
          <input
            id="t-av"
            type="range"
            min={0}
            max={100}
            step={5}
            value={form.avancement}
            disabled={form.status === 'done'}
            onChange={(e) => set('avancement', Number(e.target.value))}
            className="mt-2 w-full accent-indigo-800 disabled:opacity-60"
          />
          {form.status === 'done' && <p className="mt-1 text-[11px] text-ink-muted">Une tâche terminée est à 100 %.</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="t-com">
            Commentaires
          </label>
          <textarea id="t-com" rows={2} className="field resize-none" value={form.commentaires} onChange={(e) => set('commentaires', e.target.value)} />
        </div>
      </form>
    </Modal>
  );
}
