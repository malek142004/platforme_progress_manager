import { useId } from 'react';
import { CHART } from '@/lib/utils/labels';

/** Jauge circulaire (maquette : « 75% »). */
export function RadialGauge({ value, size = 190, label }: { value: number; size?: number; label?: string }) {
  const id = useId();
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }} role="img" aria-label={`${v} % ${label ?? ''}`}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={CHART.indigoDeep} />
            <stop offset="100%" stopColor={CHART.indigoMid} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EFEFFD" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v / 100)}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[44px] font-medium leading-none text-ink">{v}%</span>
        {label && <span className="mt-1 text-[11px] font-semibold text-ink-muted">{label}</span>}
      </div>
    </div>
  );
}
