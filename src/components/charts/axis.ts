import { CHART } from '@/lib/utils/labels';

/** Styles d'axes récessifs communs. */
export const axisProps = {
  axisLine: false,
  tickLine: false,
  tick: { fill: CHART.axis, fontSize: 11, fontFamily: 'Nunito' },
} as const;
