import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate, type Location } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui';
import { FullPageLoader } from '@/components/layout/FullPageLoader';
import { useAuth } from '@/hooks/useAuth';
import { authErrorMessage } from '@/lib/api/auth';

export default function Login() {
  const { session, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return <FullPageLoader />;
  if (session) return <Navigate to={from} replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Renseignez votre email et votre mot de passe.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-shell bg-white shadow-card-hover animate-fade-up md:grid-cols-[1.05fr_1fr]">
        {/* Panneau décoratif indigo */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-indigo-800 p-10 text-white md:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
              <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden>
                <path d="M6 22l6-7 5 5 9-11" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="26" cy="9" r="3" fill="#F58B5C" />
              </svg>
            </div>
            <span className="text-sm font-extrabold tracking-wide">Progress & Performance</span>
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold leading-tight">
              Pilotez l'avancement
              <br />
              de votre équipe.
            </h2>
            <p className="mt-3 max-w-xs text-sm text-white/70">
              Tâches, sprints, remarques et performances : tout le suivi au même endroit, sans fichier Excel.
            </p>
          </div>

          {/* Aires dégradées façon maquette */}
          <svg viewBox="0 0 400 160" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-40 w-full" aria-hidden>
            <defs>
              <linearGradient id="loginA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B5B7F5" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#B5B7F5" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="loginB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F58B5C" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#F9B08F" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 90 C50 40 90 120 140 80 S230 30 280 70 S360 110 400 60 V160 H0Z" fill="url(#loginA)" />
            <path d="M0 120 C60 90 100 140 160 110 S250 80 300 115 S370 130 400 100 V160 H0Z" fill="url(#loginB)" />
          </svg>
        </div>

        {/* Formulaire */}
        <div className="p-8 sm:p-12">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Espace admin</p>
            <h1 className="mt-2 text-2xl font-extrabold text-ink">Connexion</h1>
            <p className="mt-1 text-sm text-ink-muted">Connectez-vous pour accéder au tableau de bord.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="field-label">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="field rounded-full pl-11"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="field-label">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="field rounded-full pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-ink-muted transition hover:bg-lavender hover:text-ink"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" className="flex items-start gap-2.5 rounded-2xl bg-coral-50 px-4 py-3 text-sm text-[#C4552A]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" size="lg" loading={submitting} className="w-full">
              Se connecter
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-ink-muted">Accès réservé à l'administratrice du projet.</p>
        </div>
      </div>
    </div>
  );
}
