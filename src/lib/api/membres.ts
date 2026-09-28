import { supabase } from '@/lib/supabase';
import type { Membre } from '@/types/database';
import { toError } from './errors';

export async function listMembres(): Promise<Membre[]> {
  const { data, error } = await supabase.from('membres').select('*').order('nom_complet');
  if (error) throw toError(error);
  return (data ?? []) as Membre[];
}
