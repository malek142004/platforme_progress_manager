// Petit cache partagé : chaque ressource (ex. « taches ») est chargée une fois et
// partagée entre toutes les pages. Les mutations mettent le cache à jour
// immédiatement (optimiste) et notifient les composants abonnés.
import { errorMessage } from '@/lib/api/errors';

interface Entry<T> {
  data?: T;
  error?: string;
  promise?: Promise<void>;
  fetcher: () => Promise<T>;
  listeners: Set<() => void>;
}

const entries = new Map<string, Entry<unknown>>();

function notify(entry: Entry<unknown>) {
  entry.listeners.forEach((l) => l());
}

export function ensureEntry<T>(key: string, fetcher: () => Promise<T>): Entry<T> {
  let entry = entries.get(key) as Entry<T> | undefined;
  if (!entry) {
    entry = { fetcher, listeners: new Set() };
    entries.set(key, entry as Entry<unknown>);
  }
  return entry;
}

export function loadResource(key: string): Promise<void> {
  const entry = entries.get(key);
  if (!entry) return Promise.resolve();
  if (entry.promise) return entry.promise;
  entry.error = undefined;
  notify(entry);
  entry.promise = entry
    .fetcher()
    .then((data) => {
      entry.data = data;
    })
    .catch((err) => {
      entry.error = errorMessage(err);
    })
    .finally(() => {
      entry.promise = undefined;
      notify(entry);
    });
  return entry.promise;
}

export function subscribe(key: string, listener: () => void) {
  const entry = entries.get(key);
  entry?.listeners.add(listener);
  return () => entry?.listeners.delete(listener);
}

export function getSnapshot<T>(key: string): Entry<T> | undefined {
  return entries.get(key) as Entry<T> | undefined;
}

/** Remplace les données en cache (mise à jour optimiste). */
export function mutateResource<T>(key: string, updater: (prev: T) => T) {
  const entry = entries.get(key) as Entry<T> | undefined;
  if (!entry || entry.data === undefined) return;
  entry.data = updater(entry.data);
  notify(entry as Entry<unknown>);
}

/** Vide tout le cache (à la déconnexion). */
export function clearResources() {
  entries.forEach((entry) => {
    entry.data = undefined;
    entry.error = undefined;
    entry.promise = undefined;
  });
}
