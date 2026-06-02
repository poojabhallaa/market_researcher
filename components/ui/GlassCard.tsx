import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'emerald' | 'cyan' | 'violet' | 'amber' | 'red';
}

const glowColors = {
  emerald: 'from-emerald-500/20 via-transparent to-cyan-500/10',
  cyan: 'from-cyan-500/20 via-transparent to-blue-500/10',
  violet: 'from-violet-500/20 via-transparent to-purple-500/10',
  amber: 'from-amber-500/20 via-transparent to-orange-500/10',
  red: 'from-red-500/20 via-transparent to-rose-500/10',
};

export function GlassCard({ children, className, glowColor = 'emerald' }: GlassCardProps) {
  return (
    <div className="relative group rounded-xl">
      <div
        className={cn(
          'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br -z-10 blur-sm pointer-events-none',
          glowColors[glowColor]
        )}
      />
      <div
        className={cn(
          'bg-zinc-900 border border-zinc-800/60 group-hover:border-zinc-700/40 rounded-xl transition-colors duration-300',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
