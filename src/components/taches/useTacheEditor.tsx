import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui';
import { removeTache } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import { errorMessage } from '@/lib/api/errors';
import type { Membre, Sprint, Tache, TacheInsert } from '@/types/database';
import { TacheFormModal } from './TacheFormModal';

/** Gère la modale d'ajout/édition + la confirmation de suppression d'une tâche. */
export function useTacheEditor(membres: Membre[], sprints: Sprint[]) {
  const toast = useToast();
  const [editing, setEditing] = useState<{ tache: Tache | null; defaults?: Partial<TacheInsert> } | null>(null);
  const [deleting, setDeleting] = useState<Tache | null>(null);

  const ui = (
    <>
      <TacheFormModal
        open={!!editing}
        tache={editing?.tache}
        defaults={editing?.defaults}
        membres={membres}
        sprints={sprints}
        onClose={() => setEditing(null)}
        onDelete={(t) => {
          setEditing(null);
          setDeleting(t);
        }}
      />
      <ConfirmDialog
        open={!!deleting}
        title="Supprimer la tâche ?"
        message={`« ${deleting?.titre ?? ''} » et ses sous-tâches seront définitivement supprimées.`}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await removeTache(deleting.id);
            toast.success('Tâche supprimée.');
            setDeleting(null);
          } catch (err) {
            toast.error(errorMessage(err));
          }
        }}
      />
    </>
  );

  return {
    create: (defaults?: Partial<TacheInsert>) => setEditing({ tache: null, defaults }),
    edit: (tache: Tache) => setEditing({ tache }),
    remove: (tache: Tache) => setDeleting(tache),
    ui,
  };
}
