import type { AuthError, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Nom affiché de l'admin : métadonnées Supabase, sinon partie locale de l'email. */
export function displayName(user: User | null): string {
  if (!user) return 'Admin';
  const meta = user.user_metadata ?? {};
  const name = meta.full_name || meta.nom_complet || meta.name;
  if (typeof name === 'string' && name.trim()) return name.trim();
  const local = user.email?.split('@')[0] ?? 'Admin';
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(' ');
}

/** Traduit les erreurs Supabase Auth en messages clairs en français. */
export function authErrorMessage(err: unknown): string {
  const e = err as Partial<AuthError> & { message?: string; name?: string };
  const msg = (e?.message ?? '').toLowerCase();

  if (
    e?.name === 'AuthRetryableFetchError' ||
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('load failed') ||
    (typeof navigator !== 'undefined' && !navigator.onLine)
  ) {
    return 'Impossible de joindre le serveur. Vérifiez votre connexion internet et réessayez.';
  }
  if (msg.includes('invalid login credentials')) return 'Email ou mot de passe incorrect.';
  if (msg.includes('email not confirmed')) return "Cet email n'a pas encore été confirmé dans Supabase.";
  if (e?.status === 429 || msg.includes('rate limit') || msg.includes('too many')) {
    return 'Trop de tentatives. Patientez quelques instants avant de réessayer.';
  }
  if (msg.includes('invalid api key') || msg.includes('no api key')) {
    return 'Clé Supabase invalide : vérifiez VITE_SUPABASE_ANON_KEY dans .env.local.';
  }
  return e?.message ? `Connexion impossible : ${e.message}` : 'Une erreur inattendue est survenue.';
}
