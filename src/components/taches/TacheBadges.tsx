import { Badge } from '@/components/ui';
import {
  PRIORITE_LABELS,
  PRIORITE_TONES,
  RISQUE_LABELS,
  RISQUE_TONES,
  STATUS_LABELS,
  STATUS_TONES,
} from '@/lib/utils/labels';
import type { Priorite, Risque, StatusTache } from '@/types/database';

export const PrioriteBadge = ({ value }: { value: Priorite }) => <Badge tone={PRIORITE_TONES[value]}>{PRIORITE_LABELS[value]}</Badge>;
export const StatusBadge = ({ value }: { value: StatusTache }) => (
  <Badge tone={STATUS_TONES[value]} dot>
    {STATUS_LABELS[value]}
  </Badge>
);
export const RisqueBadge = ({ value }: { value: Risque }) => (
  <Badge tone={RISQUE_TONES[value]}>{value === 'aucun' ? 'Aucun' : `Risque ${RISQUE_LABELS[value].toLowerCase()}`}</Badge>
);
