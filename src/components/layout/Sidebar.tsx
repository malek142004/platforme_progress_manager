import { NavLink } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { NAV_ITEMS } from './navigation';

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  userName: string;
  userEmail?: string | null;
}

export function Sidebar({ expanded, onToggle, mobileOpen, onCloseMobile, onLogout, userName, userEmail }: SidebarProps) {
  // Sur mobile, le tiroir est toujours en version étendue.
  const showLabels = expanded || mobileOpen;

  return (
    <>
      {/* Voile mobile */}
      <div
        onClick={onCloseMobile}
        className={cn(
          'fixed inset-0 z-30 bg-ink/30 backdrop-blur-[2px] transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-indigo-800 py-6 text-white transition-all duration-300',
          'lg:static lg:z-auto lg:translate-x-0 lg:rounded-l-shell',
          showLabels ? 'w-60' : 'w-[76px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Avatar */}
        <div className={cn('mb-8 flex items-center gap-3', showLabels ? 'px-5' : 'justify-center')}>
          <div
            title={showLabels ? undefined : `${userName}${userEmail ? ` · ${userEmail}` : ''}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-4 ring-white/15"
          >
            <svg viewBox="0 0 40 40" className="h-11 w-11" aria-hidden>
              <circle cx="20" cy="20" r="20" fill="#fff" />
              <circle cx="20" cy="16" r="7" fill="#F58B5C" />
              <path d="M7 35c2-7 7-10 13-10s11 3 13 10" fill="#F58B5C" />
            </svg>
          </div>
          {showLabels && (
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold leading-tight">{userName}</p>
              <p className="truncate text-[11px] text-white/60">{userEmail ?? 'Administratrice'}</p>
            </div>
          )}
          {mobileOpen && (
            <button onClick={onCloseMobile} aria-label="Fermer le menu" className="ml-auto rounded-full p-1.5 hover:bg-white/10 lg:hidden">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onCloseMobile}
              title={showLabels ? undefined : label}
              className={({ isActive }) =>
                cn(
                  'group relative flex h-12 items-center gap-3 transition-colors',
                  showLabels ? 'px-6' : 'justify-center',
                  isActive ? 'bg-indigo-900 text-white' : 'text-white/85 hover:bg-white/10 hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute inset-y-0 left-0 w-[3px] rounded-r-full bg-white/80" />}
                  <Icon className="h-[22px] w-[22px] shrink-0" strokeWidth={1.8} />
                  {showLabels && <span className="truncate text-sm font-semibold">{label}</span>}
                </>
              )}
            </NavLink>
          ))}

          {/* Menu : bascule étendu / replié (desktop) */}
          <button
            type="button"
            onClick={onToggle}
            title={expanded ? 'Replier le menu' : 'Déplier le menu'}
            aria-label={expanded ? 'Replier le menu' : 'Déplier le menu'}
            className={cn(
              'hidden h-12 items-center gap-3 text-white/85 transition-colors hover:bg-white/10 hover:text-white lg:flex',
              showLabels ? 'px-6' : 'justify-center',
            )}
          >
            <Menu className="h-[22px] w-[22px] shrink-0" strokeWidth={1.8} />
            {showLabels && <span className="text-sm font-semibold">Replier</span>}
          </button>
        </nav>

        {/* Déconnexion */}
        <button
          type="button"
          onClick={onLogout}
          title="Se déconnecter"
          className={cn(
            'flex h-12 items-center gap-3 text-white/85 transition-colors hover:bg-white/10 hover:text-white',
            showLabels ? 'px-6' : 'justify-center',
          )}
        >
          <LogOut className="h-[22px] w-[22px] shrink-0 -scale-x-100" strokeWidth={1.8} />
          {showLabels && <span className="text-sm font-semibold">Déconnexion</span>}
        </button>
      </aside>
    </>
  );
}
