export function FullPageLoader({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 p-6">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-800" />
      <p className="text-sm font-semibold text-ink-muted">{label}</p>
    </div>
  );
}
