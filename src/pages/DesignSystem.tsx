import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardSkeleton,
  EmptyState,
  ErrorState,
  Modal,
  PillSelect,
  ProgressBar,
  SearchPill,
  SegmentedPills,
} from '@/components/ui';
import {
  PRIORITE_LABELS,
  PRIORITE_ORDER,
  PRIORITE_TONES,
  RISQUE_LABELS,
  RISQUE_ORDER,
  RISQUE_TONES,
  STATUS_LABELS,
  STATUS_ORDER,
  STATUS_TONES,
} from '@/lib/utils/labels';

type Periode = 'week' | 'month' | 'all';
const PERIODES = [
  { value: 'week' as const, label: 'Semaine' },
  { value: 'month' as const, label: 'Mois' },
  { value: 'all' as const, label: 'Tout' },
];

const SWATCHES = [
  ['Lavande', '#E9EBFB'],
  ['Sidebar', '#4F52C6'],
  ['Indigo', '#6C6FE0'],
  ['Indigo moyen', '#8E91EE'],
  ['Indigo clair', '#B5B7F5'],
  ['Corail', '#F58B5C'],
  ['Corail clair', '#F9B08F'],
  ['Encre', '#2B2D42'],
];

/** Vitrine du design system (route /design) : sert à comparer avec la maquette. */
export default function DesignSystem() {
  const [periode, setPeriode] = useState<Periode>('week');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Design system"
        subtitle="Tokens et composants de base"
        actions={<SegmentedPills value={periode} options={PERIODES} onChange={setPeriode} />}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Terminées vs en retard" action={<PillSelect value={periode} options={PERIODES} onChange={setPeriode} />}>
          <div className="flex items-center gap-2">
            <ArrowUp className="h-7 w-7 text-indigo-600" strokeWidth={2.5} />
            <span className="text-4xl font-medium text-ink">1974</span>
          </div>
          <p className="mt-1 pl-9 text-xs text-ink-muted">Tâches terminées cette semaine</p>
          <hr className="my-5 border-ink-line" />
          <div className="flex items-center gap-2">
            <ArrowDown className="h-7 w-7 text-coral-600" strokeWidth={2.5} />
            <span className="text-4xl font-medium text-ink">287</span>
          </div>
          <p className="mt-1 pl-9 text-xs text-ink-muted">Tâches en retard</p>
        </Card>

        <Card title="Barres de progression" delay={60}>
          <div className="space-y-4">
            <div>
              <ProgressBar value={68} />
              <p className="mt-1.5 text-xs text-ink-muted">Sprint 1</p>
            </div>
            <div>
              <ProgressBar value={92} tone="coral" />
              <p className="mt-1.5 text-xs text-ink-muted">Sprint 2</p>
            </div>
            <div>
              <ProgressBar value={45} showLabel />
              <p className="mt-1.5 text-xs text-ink-muted">Sprint 3</p>
            </div>
          </div>
        </Card>

        <Card title="Badges" delay={120}>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {STATUS_ORDER.map((s) => (
                <Badge key={s} tone={STATUS_TONES[s]} dot>
                  {STATUS_LABELS[s]}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRIORITE_ORDER.map((p) => (
                <Badge key={p} tone={PRIORITE_TONES[p]}>
                  {PRIORITE_LABELS[p]}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {RISQUE_ORDER.map((r) => (
                <Badge key={r} tone={RISQUE_TONES[r]}>
                  {RISQUE_LABELS[r]}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2">
              {['Amira Ben Salah', 'Youssef Trabelsi', 'Sarra Jlassi', 'Karim Haddad'].map((n) => (
                <Avatar key={n} name={n} />
              ))}
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <SearchPill value={search} onChange={setSearch} placeholder="Rechercher…" />
          <Card title="Boutons" delay={180}>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setOpen(true)}>Ouvrir la modale</Button>
              <Button variant="soft" icon={<Plus className="h-4 w-4" />}>
                Ajouter
              </Button>
              <Button variant="coral" size="sm">
                Corail
              </Button>
              <Button variant="ghost" size="sm">
                Annuler
              </Button>
              <Button loading size="sm">
                Chargement
              </Button>
            </div>
          </Card>
        </div>

        <Card title="Palette" className="md:col-span-2" delay={240}>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {SWATCHES.map(([name, hex]) => (
              <div key={hex} className="text-center">
                <div className="mx-auto h-12 w-12 rounded-2xl shadow-card" style={{ background: hex }} />
                <p className="mt-1.5 text-[10px] font-semibold text-ink-soft">{name}</p>
                <p className="text-[10px] text-ink-muted">{hex}</p>
              </div>
            ))}
          </div>
        </Card>

        <CardSkeleton />
        <Card hoverable={false} delay={300}>
          <EmptyState title="Aucune tâche" description="Ajoutez une première tâche pour commencer." />
        </Card>

        <Card hoverable={false} className="md:col-span-2" delay={360}>
          <ErrorState message="Exemple : la connexion à Supabase a échoué." onRetry={() => undefined} />
        </Card>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Exemple de modale"
        subtitle="Formulaire type"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => setOpen(false)}>Enregistrer</Button>
          </>
        }
      >
        <label className="field-label">Titre</label>
        <input className="field" placeholder="Titre de la tâche" />
      </Modal>
    </>
  );
}
