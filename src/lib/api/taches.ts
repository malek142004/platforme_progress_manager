import { supabase } from '@/lib/supabase';
import type { Tache, TacheInsert, TacheUpdate } from '@/types/database';
import { toError } from './errors';

export async function listTaches(): Promise<Tache[]> {
  const { data, error } = await supabase
    .from('taches')
    .select('*')
    .order('deadline', { ascending: true, nullsFirst: false });
  if (error) throw toError(error);
  return (data ?? []) as Tache[];
}

export async function createTache(input: TacheInsert): Promise<Tache> {
  const { data, error } = await supabase.from('taches').insert(input).select().single();
  if (error) throw toError(error);
  return data as Tache;
}

export async function updateTache(id: string, patch: TacheUpdate): Promise<Tache> {
  const { data, error } = await supabase.from('taches').update(patch).eq('id', id).select().single();
  if (error) throw toError(error);
  return data as Tache;
}

export async function deleteTache(id: string): Promise<void> {
  const { error } = await supabase.from('taches').delete().eq('id', id);
  if (error) throw toError(error);
}
