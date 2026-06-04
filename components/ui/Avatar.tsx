'use client';
import { cn } from '@/lib/utils';
import { initials } from '@/lib/stores/profileStore';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}

export function Avatar({ name, src, size = 32, className }: AvatarProps) {
  const dimension = { width: size, height: size };

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        style={dimension}
        className={cn('rounded-full object-cover', className)}
      />
    );
  }

  return (
    <div
      style={{ ...dimension, fontSize: Math.max(10, Math.round(size * 0.38)) }}
      className={cn(
        'rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center font-semibold text-black select-none',
        className
      )}
    >
      {initials(name) || '?'}
    </div>
  );
}
