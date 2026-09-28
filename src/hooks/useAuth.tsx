import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { displayName, signIn, signOut } from '@/lib/api/auth';
import { clearResources } from '@/lib/store';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  /** Nom affiché de l'admin */
  name: string;
  /** true tant que la session initiale n'est pas connue */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => active && setSession(data.session))
      .finally(() => active && setLoading(false));

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      // Données en cache vidées à la déconnexion (ou changement d'utilisatrice).
      if (!next) clearResources();
      setSession(next);
      setLoading(false);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      name: displayName(session?.user ?? null),
      loading,
      signIn: async (email, password) => {
        await signIn(email, password);
      },
      signOut: async () => {
        try {
          await signOut();
        } finally {
          // Même si l'appel réseau échoue, on vide la session locale.
          clearResources();
          setSession(null);
        }
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  return ctx;
}
