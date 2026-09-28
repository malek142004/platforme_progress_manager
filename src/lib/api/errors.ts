/** Normalise les erreurs Supabase/PostgREST/réseau en Error avec un message français. */
export function toError(err: unknown): Error {
  const e = err as { message?: string; code?: string; details?: string; hint?: string; name?: string };
  const raw = e?.message ?? String(err);
  const msg = raw.toLowerCase();

  if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('load failed')) {
    return new Error('Impossible de joindre Supabase. Vérifiez votre connexion internet.');
  }
  if (e?.code === '42501' || msg.includes('row-level security') || msg.includes('permission denied')) {
    return new Error("Accès refusé par la base (RLS). Votre session a peut-être expiré : reconnectez-vous.");
  }
  if (e?.code === 'PGRST301' || msg.includes('jwt expired')) {
    return new Error('Session expirée : reconnectez-vous.');
  }
  if (e?.code === '23503') {
    return new Error('Opération impossible : cet élément est encore référencé par d’autres données.');
  }
  if (e?.code === '23514' || e?.code === '22P02') {
    return new Error(`Valeur invalide : ${e.details ?? raw}`);
  }
  return new Error(raw || 'Une erreur inattendue est survenue.');
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : toError(err).message;
}
