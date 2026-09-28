import { KeyRound } from 'lucide-react';

export function ConfigMissing() {
  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div className="w-full max-w-md rounded-card bg-white p-8 text-center shadow-card animate-fade-up">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-800">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-extrabold text-ink">Configuration Supabase manquante</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Renseignez <code className="rounded bg-lavender px-1.5 py-0.5 text-ink">VITE_SUPABASE_URL</code> et{' '}
          <code className="rounded bg-lavender px-1.5 py-0.5 text-ink">VITE_SUPABASE_ANON_KEY</code> dans le fichier{' '}
          <code className="rounded bg-lavender px-1.5 py-0.5 text-ink">.env.local</code>, puis relancez{' '}
          <code className="rounded bg-lavender px-1.5 py-0.5 text-ink">npm run dev</code>.
        </p>
        <p className="mt-4 text-xs text-ink-muted">Supabase › Project Settings › API</p>
      </div>
    </div>
  );
}
