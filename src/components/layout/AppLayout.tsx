import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { Avatar, Button } from '@/components/ui';
import { Sidebar } from './Sidebar';
import { NAV_ITEMS } from './navigation';
import { useAuth } from '@/hooks/useAuth';
import { FullPageLoader } from './FullPageLoader';

const STORAGE_KEY = 'ppm.sidebar.expanded';

function readExpanded() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function AppLayout() {
  const { user, name, signOut } = useAuth();
  const [expanded, setExpanded] = useState(readExpanded);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Déconnexion puis retour à la page de connexion.
  async function logout() {
    setLoggingOut(true);
    try {
      await signOut();
    } finally {
      setMobileOpen(false);
      navigate('/login', { replace: true });
    }
  }
  const current = NAV_ITEMS.find((n) => (n.to === '/' ? pathname === '/' : pathname.startsWith(n.to)));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, expanded ? '1' : '0');
    } catch {
      /* stockage indisponible : on ignore */
    }
  }, [expanded]);

  return (
    <div className="min-h-full p-0 lg:p-4">
      {/* Grand conteneur arrondi */}
      <div className="flex min-h-screen bg-lavender lg:min-h-[calc(100vh-2rem)] lg:rounded-shell lg:bg-[#EEF0FC] lg:shadow-[0_20px_60px_-30px_rgba(79,82,198,0.35)]">
        <Sidebar
          expanded={expanded}
          onToggle={() => setExpanded((v) => !v)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          onLogout={() => void logout()}
          userName={name}
          userEmail={user?.email}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Barre supérieure mobile */}
          <div className="sticky top-0 z-20 flex items-center gap-3 bg-lavender/90 px-4 py-3 backdrop-blur lg:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-800 text-white shadow-pill"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="flex-1 truncate font-extrabold text-ink">{current?.label ?? 'Progress & Performance'}</span>
            <button
              onClick={() => void logout()}
              disabled={loggingOut}
              aria-label="Se déconnecter"
              title="Se déconnecter"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-coral-600 shadow-card transition hover:bg-coral-50 disabled:opacity-60"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          {/* Barre supérieure desktop : utilisatrice + déconnexion */}
          <div className="hidden items-center justify-end gap-3 px-8 pt-5 lg:flex">
            <div className="flex items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-4 shadow-card">
              <Avatar name={name} size={30} />
              <div className="leading-tight">
                <p className="text-xs font-extrabold text-ink">{name}</p>
                {user?.email && <p className="text-[11px] text-ink-muted">{user.email}</p>}
              </div>
            </div>
            <Button variant="danger" icon={<LogOut className="h-4 w-4" />} loading={loggingOut} onClick={() => void logout()}>
              Déconnexion
            </Button>
          </div>

          <main className="min-w-0 flex-1 px-4 pb-8 pt-2 sm:px-6 lg:px-8 lg:pb-7 lg:pt-3">
            <Suspense fallback={<FullPageLoader />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
