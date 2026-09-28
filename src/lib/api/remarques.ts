import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Remarque, RemarqueInsert } from '@/types/database';
import { toError } from './errors';

export async function listRemarques(): Promise<Remarque[]> {
  const { data, error } = await supabase.from('remarques').select('*').order('date_envoi', { ascending: false });
  if (error) throw toError(error);
  return (data ?? []) as Remarque[];
}

export async function createRemarque(input: RemarqueInsert): Promise<Remarque> {
  const { data, error } = await supabase
    .from('remarques')
    .insert({ envoye_email: false, date_envoi: new Date().toISOString(), ...input })
    .select()
    .single();
  if (error) throw toError(error);
  return data as Remarque;
}

/**
 * Appelle l'Edge Function send-remark. C'est elle qui envoie l'email (Resend)
 * et passe envoye_email à true. Renvoie la remarque mise à jour.
 */
export async function sendRemarqueEmail(remarqueId: string): Promise<Remarque> {
  const { data, error } = await supabase.functions.invoke<{ remarque?: Remarque; error?: string }>('send-remark', {
    body: { remarque_id: remarqueId },
  });

  if (error) {
    let detail = error.message;
    if (error instanceof FunctionsHttpError) {
      try {
        const body = await error.context.json();
        if (body?.error) detail = body.error;
      } catch {
        /* corps non JSON */
      }
    } else if (error.name === 'FunctionsFetchError') {
      detail = "Edge Function send-remark injoignable : est-elle déployée ?";
    }
    throw new Error(detail);
  }
  if (!data?.remarque) throw new Error(data?.error ?? "Réponse inattendue de l'Edge Function.");
  return data.remarque;
}
