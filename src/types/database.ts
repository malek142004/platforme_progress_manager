// Types alignés sur le schéma Supabase existant (aucune migration côté app).

export type Priorite = 'basse' | 'moyenne' | 'haute' | 'critique';
export type StatusTache = 'to_do' | 'in_progress' | 'in_review' | 'done';
export type StatusSousTache = 'to_do' | 'in_progress' | 'done';
export type Risque = 'aucun' | 'faible' | 'moyen' | 'eleve';

export interface Membre {
  id: string;
  nom_complet: string;
  email: string | null;
  tache_dev: string | null;
  role_management: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Sprint {
  id: string;
  nom: string;
  date_debut: string | null;
  date_fin: string | null;
  objectif: string | null;
  created_at: string;
}

export interface Tache {
  id: string;
  titre: string;
  description: string | null;
  membre_id: string | null;
  sprint_id: string | null;
  date_debut: string | null;
  deadline: string | null;
  priorite: Priorite;
  status: StatusTache;
  commentaires: string | null;
  risque: Risque;
  avancement: number;
  created_at: string;
  updated_at: string;
}

export interface SousTache {
  id: string;
  tache_id: string;
  titre: string;
  status: StatusSousTache;
  date_debut: string | null;
  deadline: string | null;
  avancement: number;
  created_at: string;
}

export interface Remarque {
  id: string;
  destinataire_id: string;
  message: string;
  date_envoi: string;
  envoye_email: boolean;
  created_at: string;
}

export interface PerformanceHistorique {
  id: string;
  membre_id: string;
  date_snapshot: string;
  taches_terminees: number;
  taches_totales: number;
  avancement_moyen: number;
  score_performance: number;
  created_at: string;
}

// Types d'écriture : champs générés par la base exclus.
type Generated = 'id' | 'created_at';
export type MembreInsert = Omit<Membre, Generated>;
export type SprintInsert = Omit<Sprint, Generated>;
export type SprintUpdate = Partial<SprintInsert>;
export type TacheInsert = Omit<Tache, Generated | 'updated_at'>;
export type TacheUpdate = Partial<TacheInsert>;
export type SousTacheInsert = Omit<SousTache, Generated>;
export type SousTacheUpdate = Partial<SousTacheInsert>;
export type RemarqueInsert = Pick<Remarque, 'destinataire_id' | 'message'> &
  Partial<Pick<Remarque, 'date_envoi' | 'envoye_email'>>;
export type PerformanceInsert = Omit<PerformanceHistorique, Generated>;
