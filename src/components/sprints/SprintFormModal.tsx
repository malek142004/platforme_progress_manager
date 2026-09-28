import { useEffect, useState, type FormEvent } from 'react';
import { Button, Modal } from '@/components/ui';
import { addSprint, editSprint } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import { errorMessage } from '@/lib/api/errors';
import { toInputDate } from '@/lib/utils/dates';
import type { Sprint } from '@/types/database';

interface Props {
  open: boolean;
  sprint?: Sprint | null;
  onClose: () => void;
  onSaved?: (s: Sprint) => void;
}

export function SprintFormModal({ open, sprint, onClose, onSaved }: Props) {
  const toast = useToast();
  const [nom, setNom] = useState('');
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');
  const [objectif, setObjectif] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNom(sprint?.nom ?? '');
    setDebut(toInputDate(sprint?.date_debut));
    setFin(toInputDate(sprint?.date_fin));
    setObjectif(sprint?.objectif ?? '');
    setError(null);
  }, [open, sprint]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!nom.trim()) return setError('Le nom du sprint est obligatoire.');
    if (debut && fin && fin < debut) return setError('La date de fin doit être après la date de début.');
    setSaving(true);
    try {
      const payload = { nom: nom.trim(), date_debut: debut || null, date_fin: fin || null, objectif: objectif.trim() || null };
      const saved = sprint ? await editSprint(sprint.id, payload) : await addSprint(payload);
      toast.success(sprint ? 'Sprint mis à jour.' : 'Sprint créé.');
      onSaved?.(saved);
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
      title={sprint ? 'Modifier le sprint' : 'Nouveau sprint'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="sprint-form" loading={saving}>
            {sprint ? 'Enregistrer' : 'Créer'}
          </Button>
        </>
      }
    >
      <form id="sprint-form" onSubmit={submit} className="grid grid-cols-2 gap-4" noValidate>
        <div className="col-span-2">
          <label className="field-label" htmlFor="s-nom">
            Nom *
          </label>
          <input id="s-nom" className="field" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Sprint 4" autoFocus />
        </div>
        <div>
          <label className="field-label" htmlFor="s-debut">
            Date de début
          </label>
          <input id="s-debut" type="date" className="field" value={debut} onChange={(e) => setDebut(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="s-fin">
            Date de fin
          </label>
          <input id="s-fin" type="date" className="field" value={fin} onChange={(e) => setFin(e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="field-label" htmlFor="s-obj">
            Objectif
          </label>
          <textarea id="s-obj" rows={3} className="field resize-none" value={objectif} onChange={(e) => setObjectif(e.target.value)} />
        </div>
        {error && <p className="col-span-2 text-xs font-semibold text-[#D9412E]">{error}</p>}
      </form>
    </Modal>
  );
}
