import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui';
import { toInputDate } from '@/lib/utils/dates';
import { SOUS_STATUS_LABELS } from '@/lib/utils/labels';
import type { SousTache, StatusSousTache } from '@/types/database';

export interface SousTacheValues {
  titre: string;
  status: StatusSousTache;
  date_debut: string | null;
  deadline: string | null;
  avancement: number;
}

interface Props {
  initial?: SousTache;
  onSubmit: (values: SousTacheValues) => Promise<void>;
  onCancel: () => void;
}

/** Formulaire en ligne d'ajout / édition d'une sous-tâche. */
export function SousTacheForm({ initial, onSubmit, onCancel }: Props) {
  const [titre, setTitre] = useState(initial?.titre ?? '');
  const [status, setStatus] = useState<StatusSousTache>(initial?.status ?? 'to_do');
  const [debut, setDebut] = useState(toInputDate(initial?.date_debut));
  const [deadline, setDeadline] = useState(toInputDate(initial?.deadline));
  const [avancement, setAvancement] = useState(initial?.avancement ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!titre.trim()) return setError('Le titre est obligatoire.');
    if (debut && deadline && deadline < debut) return setError('La deadline doit être après la date de début.');
    setSaving(true);
    try {
      await onSubmit({
        titre: titre.trim(),
        status,
        date_debut: debut || null,
        deadline: deadline || null,
        avancement: status === 'done' ? 100 : Math.round(avancement),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-3 rounded-2xl bg-lavender-soft p-4 animate-fade-up md:grid-cols-6" noValidate>
      <div className="col-span-2 md:col-span-6">
        <input className="field bg-white" value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Titre de la sous-tâche" autoFocus />
      </div>
      <div className="md:col-span-1">
        <label className="field-label">Status</label>
        <select
          className="field bg-white"
          value={status}
          onChange={(e) => {
            const s = e.target.value as StatusSousTache;
            setStatus(s);
            if (s === 'done') setAvancement(100);
          }}
        >
          {(Object.keys(SOUS_STATUS_LABELS) as StatusSousTache[]).map((s) => (
            <option key={s} value={s}>
              {SOUS_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <div className="md:col-span-1">
        <label className="field-label">Début</label>
        <input type="date" className="field bg-white" value={debut} onChange={(e) => setDebut(e.target.value)} />
      </div>
      <div className="md:col-span-1">
        <label className="field-label">Deadline</label>
        <input type="date" className="field bg-white" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </div>
      <div className="md:col-span-1">
        <label className="field-label">Avancement : {avancement}%</label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={avancement}
          disabled={status === 'done'}
          onChange={(e) => setAvancement(Number(e.target.value))}
          className="mt-3 w-full accent-indigo-800"
        />
      </div>
      <div className="col-span-2 flex items-end justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" size="sm" loading={saving}>
          {initial ? 'Enregistrer' : 'Ajouter'}
        </Button>
      </div>
      {error && <p className="col-span-2 text-xs font-semibold text-[#D9412E] md:col-span-6">{error}</p>}
    </form>
  );
}
