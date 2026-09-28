import { supabase } from '@/lib/supabase';
import type { Sprint, SprintInsert, SprintUpdate } from '@/types/database';
import { toError } from './errors';

export async function listSprints(): Promise<Sprint[]> {
  const { data, error } = await supabase
    .from('sprints')
    .select('*')
    .order('date_debut', { ascending: false, nullsFirst: false });
  if (error) throw toError(error);
  return (data ?? []) as Sprint[];
}

export async function createSprint(input: SprintInsert): Promise<Sprint> {
  const { data, error } = await supabase.from('sprints').insert(input).select().single();
  if (error) throw toError(error);
  return data as Sprint;
}

export async function updateSprint(id: string, patch: SprintUpdate): Promise<Sprint> {
  const { data, error } = await supabase.from('sprints').update(patch).eq('id', id).select().single();
  if (error) throw toError(error);
  return data as Sprint;
}
