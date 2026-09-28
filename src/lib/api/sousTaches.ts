import { supabase } from '@/lib/supabase';
import type { SousTache, SousTacheInsert, SousTacheUpdate } from '@/types/database';
import { toError } from './errors';

export async function listSousTaches(): Promise<SousTache[]> {
  const { data, error } = await supabase.from('sous_taches').select('*').order('created_at');
  if (error) throw toError(error);
  return (data ?? []) as SousTache[];
}

export async function createSousTache(input: SousTacheInsert): Promise<SousTache> {
  const { data, error } = await supabase.from('sous_taches').insert(input).select().single();
  if (error) throw toError(error);
  return data as SousTache;
}

export async function updateSousTache(id: string, patch: SousTacheUpdate): Promise<SousTache> {
  const { data, error } = await supabase.from('sous_taches').update(patch).eq('id', id).select().single();
  if (error) throw toError(error);
  return data as SousTache;
}

export async function deleteSousTache(id: string): Promise<void> {
  const { error } = await supabase.from('sous_taches').delete().eq('id', id);
  if (error) throw toError(error);
}
