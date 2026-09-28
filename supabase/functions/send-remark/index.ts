// Edge Function « send-remark »
// Envoie par email (Resend) une remarque déjà insérée dans la table remarques,
// puis passe remarques.envoye_email à true.
//
// Secrets (Supabase > Edge Functions > Secrets, ou `supabase secrets set`) :
//   RESEND_API_KEY  (obligatoire) clé API Resend — jamais dans le frontend
//   RESEND_FROM     (optionnel)  expéditeur, défaut « Progress & Performance <onboarding@resend.dev> »
//   RESEND_REPLY_TO (optionnel)  adresse de réponse (ex. votre email)
//
// Corps attendu : { "remarque_id": "<uuid>" }  — appel authentifié (session de l'admin).

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function emailHtml(nom: string, message: string, date: string) {
  const body = escapeHtml(message).replace(/\n/g, '<br>');
  return `<!doctype html><html><body style="margin:0;background:#E9EBFB;font-family:Nunito,Segoe UI,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;"><tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;">
      <tr><td style="background:#4F52C6;padding:24px 32px;color:#ffffff;font-size:18px;font-weight:800;">Nouvelle remarque</td></tr>
      <tr><td style="padding:32px;color:#2B2D42;font-size:15px;line-height:1.6;">
        <p style="margin:0 0 16px;">Bonjour ${escapeHtml(nom)},</p>
        <div style="background:#F3F4FD;border-radius:16px;padding:20px;color:#2B2D42;">${body}</div>
        <p style="margin:24px 0 0;color:#9A9CB5;font-size:12px;">Envoyée le ${escapeHtml(date)} par la Progress &amp; Performance Manager.</p>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée.' }, 405);

  try {
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) return json({ error: 'Secret RESEND_API_KEY non configuré dans Supabase.' }, 500);
    const from = Deno.env.get('RESEND_FROM') || 'Progress & Performance <onboarding@resend.dev>';
    const replyTo = Deno.env.get('RESEND_REPLY_TO') || undefined;

    // Authentification : on vérifie nous-mêmes le jeton de session de l'appelant.
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) return json({ error: 'Non authentifié.' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '';
    // Client agissant AVEC les droits de l'admin connectée : la RLS s'applique.
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) return json({ error: 'Session invalide ou expirée : reconnectez-vous.' }, 401);

    const { remarque_id } = await req.json().catch(() => ({}));
    if (!remarque_id) return json({ error: 'remarque_id manquant.' }, 400);

    const { data: remarque, error: rErr } = await supabase.from('remarques').select('*').eq('id', remarque_id).single();
    if (rErr || !remarque) return json({ error: 'Remarque introuvable.' }, 404);

    const { data: membre, error: mErr } = await supabase
      .from('membres')
      .select('nom_complet, email')
      .eq('id', remarque.destinataire_id)
      .single();
    if (mErr || !membre) return json({ error: 'Destinataire introuvable.' }, 404);
    if (!membre.email) return json({ error: `${membre.nom_complet} n'a pas d'adresse email.` }, 400);

    const date = new Date(remarque.date_envoi ?? Date.now()).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [membre.email],
        subject: 'Nouvelle remarque de votre Progress & Performance Manager',
        html: emailHtml(membre.nom_complet, remarque.message, date),
        text: `Bonjour ${membre.nom_complet},\n\n${remarque.message}\n\n— Progress & Performance Manager`,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    const resendBody = await resendRes.json().catch(() => ({}));
    if (!resendRes.ok) {
      const detail = resendBody?.message ?? `HTTP ${resendRes.status}`;
      return json({ error: `Resend a refusé l'envoi : ${detail}` }, 502);
    }

    const { data: updated, error: uErr } = await supabase
      .from('remarques')
      .update({ envoye_email: true })
      .eq('id', remarque_id)
      .select()
      .single();
    if (uErr) return json({ error: `Email envoyé mais statut non mis à jour : ${uErr.message}` }, 500);

    return json({ remarque: updated, email_id: resendBody?.id ?? null });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Erreur inattendue.' }, 500);
  }
});
