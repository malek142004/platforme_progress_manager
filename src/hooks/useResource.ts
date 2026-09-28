import { useCallback, useEffect, useReducer } from 'react';
import { ensureEntry, getSnapshot, loadResource, subscribe } from '@/lib/store';

export interface Resource<T> {
  data: T | undefined;
  loading: boolean;
  error: string | undefined;
  reload: () => Promise<void>;
}

export function useResource<T>(key: string, fetcher: () => Promise<T>): Resource<T> {
  ensureEntry(key, fetcher);
  const [, force] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    const unsub = subscribe(key, force);
    const entry = getSnapshot<T>(key);
    if (entry && entry.data === undefined && !entry.promise && !entry.error) void loadResource(key);
    return () => {
      unsub();
    };
  }, [key]);

  const entry = getSnapshot<T>(key);
  const reload = useCallback(() => loadResource(key), [key]);
  return {
    data: entry?.data,
    loading: entry?.data === undefined && !entry?.error,
    error: entry?.error,
    reload,
  };
}

/** Combine plusieurs ressources : chargement tant qu'une manque, première erreur remontée. */
export function combine(...resources: Resource<unknown>[]) {
  return {
    loading: resources.some((r) => r.loading),
    error: resources.find((r) => r.error)?.error,
    reload: () => Promise.all(resources.filter((r) => r.error || r.data === undefined).map((r) => r.reload())).then(() => undefined),
  };
}
