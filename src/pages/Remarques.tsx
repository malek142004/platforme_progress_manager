import { useMemo, useState, type FormEvent } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Mail, MessageSquareText, RefreshCw, Send } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar, Badge, Button, Card, EmptyState, ErrorState, PillSelect, Skeleton } from '@/components/ui';
import { addRemarque, sendRemarque, useMembres, useRemarques } from '@/hooks/useData';
import { combine } from '@/hooks/useResource';
import { useToast } from '@/hooks/useToast';
import { errorMessage } from '@/lib/api/errors';
import { fmtDate } from '@/lib/utils/dates';

const MAX = 2000;

export default function Remarques() {
  const toast = useToast();
  const membresR = useMembres();
  const remarquesR = useRemarques();
  const state = combine(membresR, remarquesR);
  const membres = membresR.data ?? [];
  const membreById = useMemo(() => new Map(membres.map((m) => [m.id, m])), [membres]);

  const [destinataire, setDestinataire] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState<Set<string>>(new Set());
  const [failures, setFailures] = useState<Record<string, string>>({});
  const [filtre, setFiltre] = useState('all');

  const dest = destinataire ? membreById.get(destinataire) : undefined;

  async function deliver(id: string, nom?: string) {
    setSending((s) => new Set(s).add(id));
    try {
      await sendRemarque(id);
      setFailures(({ [id]: _removed, ...rest }) => rest);
      toast.success(`Email envoyé${nom ? ` à ${nom}` : ''}.`);
      return true;
    } catch (err) {
      const msg = errorMessage(err);
      setFailures((f) => ({ ...f, [id]: msg }));
      toast.error(`La remarque est enregistrée, mais l'email n'a pas pu être envoyé : ${msg}`);
      return false;
    } finally {
      setSending((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!destinataire) return setFormError('Choisissez un destinataire.');
    if (!message.trim()) return setFormError('Le message est vide.');
    setFormError(null);
    setSubmitting(true);
    try {
      const saved = await addRemarque({ destinataire_id: destinataire, message: message.trim() });
      setMessage('');
      await deliver(saved.id, dest?.nom_complet);
    } catch (err) {
      toast.error(`Remarque non enregistrée : ${errorMessage(err)}`);
    } finally {
      setSubmitting(false);
    }
  }

  const historique = (remarquesR.data ?? []).filter((r) => filtre === 'all' || r.destinataire_id === filtre);

  return (
    <>
      <PageHeader title="Remarques" subtitle="Envoyez un retour par email à un membre de l'équipe" />

      {state.error ? (
        <Card hoverable={false}>
          <ErrorState message={state.error} onRetry={state.reload} />
        </Card>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(320px,400px)_1fr]">
          {/* Formulaire */}
          <Card title="Nouvelle remarque" subtitle="Enregistrée puis envoyée par email" hoverable={false} className="lg:sticky lg:top-6">
            {state.loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10" />
                <Skeleton className="h-36" />
                <Skeleton className="h-12 rounded-full" />
              </div>
            ) : membres.length === 0 ? (
              <EmptyState title="Aucun membre" description="Ajoutez des membres dans Supabase pour leur envoyer des remarques." />
            ) : (
              <form onSubmit={submit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="r-dest" className="field-label">
                    Destinataire
                  </label>
                  <select id="r-dest" className="field" value={destinataire} onChange={(e) => setDestinataire(e.target.value)}>
                    <option value="">— Choisir un membre —</option>
                    {membres.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nom_complet}
                      </option>
                    ))}
                  </select>
                  {dest && (
                    <p className={`mt-1.5 flex items-center gap-1.5 text-xs ${dest.email ? 'text-ink-muted' : 'font-semibold text-[#D9412E]'}`}>
                      <Mail className="h-3.5 w-3.5" />
                      {dest.email ?? "Ce membre n'a pas d'email : la remarque sera enregistrée mais pas envoyée."}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="r-msg" className="field-label">
                    Message
                  </label>
                  <textarea
                    id="r-msg"
                    rows={7}
                    maxLength={MAX}
                    className="field resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Bravo pour la livraison de la semaine ! Pense à mettre à jour…"
                  />
                  <p className="mt-1 text-right text-[11px] text-ink-muted">
                    {message.length}/{MAX}
                  </p>
                </div>
                {formError && <p className="text-xs font-semibold text-[#D9412E]">{formError}</p>}
                <Button type="submit" size="lg" className="w-full" loading={submitting} icon={<Send className="h-4 w-4" />}>
                  Envoyer
                </Button>
              </form>
            )}
          </Card>

          {/* Historique */}
          <Card
            title="Historique"
            subtitle={`${historique.length} remarque${historique.length > 1 ? 's' : ''}`}
            hoverable={false}
            delay={80}
            action={
              <PillSelect
                aria-label="Filtrer par membre"
                value={filtre}
                onChange={setFiltre}
                options={[{ value: 'all', label: 'Tous les membres' }, ...membres.map((m) => ({ value: m.id, label: m.nom_complet }))]}
              />
            }
          >
            {state.loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : historique.length === 0 ? (
              <EmptyState
                icon={<MessageSquareText className="h-6 w-6" />}
                title={filtre === 'all' ? 'Aucune remarque envoyée' : 'Aucune remarque pour ce membre'}
                description="Les remarques envoyées apparaîtront ici avec leur statut d'envoi."
              />
            ) : (
              <ul className="space-y-3">
                {historique.map((r) => {
                  const m = membreById.get(r.destinataire_id);
                  const isSending = sending.has(r.id);
                  const failure = failures[r.id];
                  return (
                    <li key={r.id} className="rounded-2xl bg-lavender-soft p-4 animate-fade-up">
                      <div className="flex flex-wrap items-center gap-3">
                        <Avatar name={m?.nom_complet} src={m?.avatar_url} size={34} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-ink">{m?.nom_complet ?? 'Membre supprimé'}</p>
                          <p className="text-[11px] text-ink-muted">{fmtDate(r.date_envoi, "dd MMM yyyy 'à' HH:mm")}</p>
                        </div>
                        {isSending ? (
                          <Badge tone="indigoSoft">
                            <Loader2 className="h-3 w-3 animate-spin" /> Envoi…
                          </Badge>
                        ) : r.envoye_email ? (
                          <Badge tone="indigo">
                            <CheckCircle2 className="h-3 w-3" /> Email envoyé
                          </Badge>
                        ) : (
                          <>
                            <Badge tone="danger">
                              <AlertTriangle className="h-3 w-3" /> Email non envoyé
                            </Badge>
                            <Button size="sm" variant="soft" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={() => deliver(r.id, m?.nom_complet)}>
                              Réessayer
                            </Button>
                          </>
                        )}
                      </div>
                      <p className="mt-3 whitespace-pre-line text-sm text-ink-soft">{r.message}</p>
                      {failure && !r.envoye_email && !isSending && (
                        <p className="mt-2 rounded-xl bg-coral-50 px-3 py-2 text-xs text-[#C4552A]">Échec : {failure}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
