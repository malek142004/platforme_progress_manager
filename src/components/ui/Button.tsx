import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type Variant = 'primary' | 'soft' | 'ghost' | 'coral' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-indigo-800 text-white shadow-pill hover:bg-indigo-900',
  soft: 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100',
  ghost: 'bg-transparent text-ink-soft hover:bg-lavender',
  coral: 'bg-coral-600 text-white shadow-[0_4px_14px_-4px_rgba(245,139,92,0.55)] hover:brightness-95',
  danger: 'bg-coral-50 text-[#D9612E] hover:bg-coral-200/60',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3.5 text-xs gap-1.5',
  md: 'h-10 px-5 text-sm gap-2',
  lg: 'h-12 px-8 text-[15px] gap-2',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

/** Bouton pilule (fond indigo, texte blanc par défaut). */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex select-none items-center justify-center rounded-full font-bold transition',
        'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
});

/** Bouton rond icône seule (ex. loupe de la barre de recherche). */
export function IconButton({
  className,
  variant = 'primary',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; 'aria-label': string }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition active:scale-95',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:opacity-50',
        VARIANTS[variant],
        variant === 'primary' && 'shadow-none',
        className,
      )}
      {...rest}
    />
  );
}
