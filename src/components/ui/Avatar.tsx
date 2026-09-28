import { cn } from '@/lib/utils/cn';

const BG = ['bg-indigo-100 text-indigo-800', 'bg-coral-50 text-coral-600', 'bg-indigo-50 text-indigo-600'];

export function initials(name?: string | null) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
}

export function Avatar({ name, src, size = 32, className }: AvatarProps) {
  const style = { width: size, height: size, fontSize: Math.max(10, size * 0.38) };
  if (src) {
    return <img src={src} alt={name ?? ''} style={style} className={cn('shrink-0 rounded-full object-cover', className)} />;
  }
  return (
    <span
      title={name ?? undefined}
      style={style}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-extrabold',
        BG[hash(name ?? '') % BG.length],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
