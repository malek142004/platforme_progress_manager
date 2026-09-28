import type { TooltipProps } from 'recharts';

interface Props extends TooltipProps<number, string> {
  valueSuffix?: string;
  /** Titre forcé (sinon le label de l'axe X) */
  title?: string;
}

/** Infobulle commune : carte blanche arrondie, pastille de couleur + valeur en encre. */
export function ChartTooltip({ active, payload, label, valueSuffix = '', title }: Props) {
  if (!active || !payload?.length) return null;
  const rows = payload.filter((p) => p.value !== undefined && p.type !== 'none');
  return (
    <div className="min-w-[140px] rounded-2xl bg-white px-3.5 py-2.5 text-xs shadow-card-hover ring-1 ring-ink-line">
      {(title ?? label) !== undefined && <p className="mb-1.5 font-bold text-ink">{title ?? label}</p>}
      <ul className="space-y-1">
        {rows.map((p) => (
          <li key={String(p.dataKey ?? p.name)} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: (p.color ?? p.payload?.fill) as string }} />
            <span className="flex-1 text-ink-soft">{p.name}</span>
            <span className="font-bold tabular-nums text-ink">
              {typeof p.value === 'number' ? Math.round(p.value * 10) / 10 : p.value}
              {valueSuffix}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
