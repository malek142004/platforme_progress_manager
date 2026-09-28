// Hooks de données + mutations (avec mise à jour optimiste et rollback).
import { listMembres } from '@/lib/api/membres';
import { createSprint, listSprints, updateSprint } from '@/lib/api/sprints';
import { createTache, deleteTache, listTaches, updateTache } from '@/lib/api/taches';
import { createSousTache, deleteSousTache, listSousTaches, updateSousTache } from '@/lib/api/sousTaches';
import { createRemarque, listRemarques, sendRemarqueEmail } from '@/lib/api/remarques';
import { listPerformance, snapshotNow } from '@/lib/api/performance';
import { getSnapshot, loadResource, mutateResource } from '@/lib/store';
import type {
  Membre,
  PerformanceHistorique,
  Remarque,
  RemarqueInsert,
  SousTache,
  SousTacheInsert,
  SousTacheUpdate,
  Sprint,
  SprintInsert,
  SprintUpdate,
  Tache,
  TacheInsert,
  TacheUpdate,
} from '@/types/database';
import { useResource } from './useResource';

export const KEYS = {
  membres: 'membres',
  sprints: 'sprints',
  taches: 'taches',
  sousTaches: 'sous_taches',
  remarques: 'remarques',
  performance: 'performance_historique',
} as const;

export const useMembres = () => useResource<Membre[]>(KEYS.membres, listMembres);
export const useSprints = () => useResource<Sprint[]>(KEYS.sprints, listSprints);
export const useTaches = () => useResource<Tache[]>(KEYS.taches, listTaches);
export const useSousTaches = () => useResource<SousTache[]>(KEYS.sousTaches, listSousTaches);
export const useRemarques = () => useResource<Remarque[]>(KEYS.remarques, listRemarques);
export const usePerformance = () => useResource<PerformanceHistorique[]>(KEYS.performance, listPerformance);

type WithId = { id: string };

function upsert<T extends WithId>(key: string, item: T, prepend = false) {
  mutateResource<T[]>(key, (prev) =>
    prev.some((p) => p.id === item.id) ? prev.map((p) => (p.id === item.id ? item : p)) : prepend ? [item, ...prev] : [...prev, item],
  );
}

/** Applique un patch localement, appelle l'API, puis remplace par la ligne serveur ou annule. */
async function optimisticUpdate<T extends WithId>(key: string, id: string, patch: Partial<T>, call: () => Promise<T>): Promise<T> {
  const before = getSnapshot<T[]>(key)?.data?.find((x) => x.id === id);
  mutateResource<T[]>(key, (prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  try {
    const saved = await call();
    upsert(key, saved);
    return saved;
  } catch (err) {
    if (before) upsert(key, before);
    throw err;
  }
}

async function optimisticDelete<T extends WithId>(key: string, id: string, call: () => Promise<void>) {
  const list = getSnapshot<T[]>(key)?.data ?? [];
  const index = list.findIndex((x) => x.id === id);
  const before = list[index];
  mutateResource<T[]>(key, (prev) => prev.filter((x) => x.id !== id));
  try {
    await call();
  } catch (err) {
    if (before) mutateResource<T[]>(key, (prev) => [...prev.slice(0, index), before, ...prev.slice(index)]);
    throw err;
  }
}

// --- Tâches ---------------------------------------------------------------

/** Règle métier : une tâche passée à « done » a un avancement de 100. */
function normalizeTache<P extends TacheUpdate>(patch: P): P {
  return patch.status === 'done' ? { ...patch, avancement: 100 } : patch;
}

export async function addTache(input: TacheInsert) {
  const saved = await createTache(normalizeTache(input));
  upsert(KEYS.taches, saved);
  return saved;
}

export function editTache(id: string, patch: TacheUpdate) {
  const p = normalizeTache(patch);
  return optimisticUpdate<Tache>(KEYS.taches, id, p, () => updateTache(id, p));
}

export async function removeTache(id: string) {
  await optimisticDelete<Tache>(KEYS.taches, id, () => deleteTache(id));
  // Les sous-tâches liées sont supprimées côté base (cascade) : on les retire du cache.
  mutateResource<SousTache[]>(KEYS.sousTaches, (prev) => prev.filter((s) => s.tache_id !== id));
}

// --- Sprints --------------------------------------------------------------

export async function addSprint(input: SprintInsert) {
  const saved = await createSprint(input);
  upsert(KEYS.sprints, saved, true);
  return saved;
}

export function editSprint(id: string, patch: SprintUpdate) {
  return optimisticUpdate<Sprint>(KEYS.sprints, id, patch, () => updateSprint(id, patch));
}

// --- Sous-tâches ----------------------------------------------------------

export async function addSousTache(input: SousTacheInsert) {
  const saved = await createSousTache(input);
  upsert(KEYS.sousTaches, saved);
  return saved;
}

export function editSousTache(id: string, patch: SousTacheUpdate) {
  const p: SousTacheUpdate = patch.status === 'done' ? { ...patch, avancement: 100 } : patch;
  return optimisticUpdate<SousTache>(KEYS.sousTaches, id, p, () => updateSousTache(id, p));
}

export function removeSousTache(id: string) {
  return optimisticDelete<SousTache>(KEYS.sousTaches, id, () => deleteSousTache(id));
}

// --- Remarques ------------------------------------------------------------

export async function addRemarque(input: RemarqueInsert) {
  const saved = await createRemarque(input);
  upsert(KEYS.remarques, saved, true);
  return saved;
}

export async function sendRemarque(id: string) {
  const updated = await sendRemarqueEmail(id);
  upsert(KEYS.remarques, updated);
  return updated;
}

// --- Performance ----------------------------------------------------------

export async function takeSnapshot(membres: Membre[], taches: Tache[]) {
  const result = await snapshotNow(membres, taches);
  await loadResource(KEYS.performance);
  return result;
}
