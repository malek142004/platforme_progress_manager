import type { Priorite, Risque, StatusSousTache, StatusTache } from '@/types/database';

export type Tone = 'indigo' | 'indigoSoft' | 'lilac' | 'coral' | 'coralSoft' | 'neutral' | 'danger';

export const STATUS_LABELS: Record<StatusTache, string> = {
  to_do: 'À faire',
  in_progress: 'En cours',
  in_review: 'En revue',
  done: 'Terminé',
};

export const STATUS_TONES: Record<StatusTache, Tone> = {
  to_do: 'neutral',
  in_progress: 'indigoSoft',
  in_review: 'coralSoft',
  done: 'indigo',
};

export const SOUS_STATUS_LABELS: Record<StatusSousTache, string> = {
  to_do: 'À faire',
  in_progress: 'En cours',
  done: 'Terminé',
};

export const PRIORITE_LABELS: Record<Priorite, string> = {
  basse: 'Basse',
  moyenne: 'Moyenne',
  haute: 'Haute',
  critique: 'Critique',
};

export const PRIORITE_TONES: Record<Priorite, Tone> = {
  basse: 'lilac',
  moyenne: 'indigoSoft',
  haute: 'coralSoft',
  critique: 'danger',
};

export const RISQUE_LABELS: Record<Risque, string> = {
  aucun: 'Aucun',
  faible: 'Faible',
  moyen: 'Moyen',
  eleve: 'Élevé',
};

export const RISQUE_TONES: Record<Risque, Tone> = {
  aucun: 'neutral',
  faible: 'lilac',
  moyen: 'coralSoft',
  eleve: 'danger',
};

export const STATUS_ORDER: StatusTache[] = ['to_do', 'in_progress', 'in_review', 'done'];
export const PRIORITE_ORDER: Priorite[] = ['basse', 'moyenne', 'haute', 'critique'];
export const RISQUE_ORDER: Risque[] = ['aucun', 'faible', 'moyen', 'eleve'];

// Palette graphique (identique aux tokens Tailwind)
export const CHART = {
  indigoDeep: '#4F52C6',
  indigoDarker: '#3A3CA0',
  indigo: '#6C6FE0',
  indigoMid: '#8E91EE',
  indigoLight: '#B5B7F5',
  coral: '#F58B5C',
  coralLight: '#F9B08F',
  coralDeep: '#C4552A',
  grid: '#ECEDF7',
  axis: '#9A9CB5',
} as const;

// Ordres validés (daltonisme) : indigo et corail alternés entre séries adjacentes.
export const STATUS_COLORS: Record<StatusTache, string> = {
  to_do: CHART.indigoLight,
  in_progress: CHART.coralLight,
  in_review: CHART.indigo,
  done: CHART.coral,
};

export const PRIORITE_COLORS: Record<Priorite, string> = {
  basse: CHART.indigoLight,
  moyenne: CHART.indigo,
  haute: CHART.indigoDarker,
  critique: CHART.coral,
};

export const RISQUE_COLORS: Record<Risque, string> = {
  aucun: CHART.indigoLight,
  faible: CHART.indigo,
  moyen: CHART.coral,
  eleve: CHART.coralDeep,
};

/** Couleurs par membre : fixées par l'index du membre (jamais recalculées quand on filtre). */
export const SERIES_COLORS = [
  CHART.indigoDeep,
  CHART.coral,
  CHART.indigoMid,
  CHART.coralLight,
  CHART.indigo,
  CHART.indigoLight,
];

export const memberColor = (index: number) => SERIES_COLORS[((index % SERIES_COLORS.length) + SERIES_COLORS.length) % SERIES_COLORS.length];
