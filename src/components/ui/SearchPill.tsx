import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { IconButton } from './Button';

interface SearchPillProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onSubmit?: () => void;
}

/** Barre de recherche pilule avec bouton rond indigo. */
export function SearchPill({ value, onChange, placeholder = 'Rechercher…', className, onSubmit }: SearchPillProps) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className={cn('flex h-12 items-center gap-2 rounded-full bg-white pl-5 pr-1.5 shadow-card', className)}
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
      />
      <IconButton type="submit" aria-label="Rechercher">
        <Search className="h-4 w-4" strokeWidth={2.5} />
      </IconButton>
    </form>
  );
}
