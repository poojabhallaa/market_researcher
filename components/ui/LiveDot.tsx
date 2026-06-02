import { cn } from '@/lib/utils';

interface LiveDotProps {
  color?: 'emerald' | 'red' | 'amber' | 'cyan';
  className?: string;
}

const colorMap = {
  emerald: 'bg-emerald-400',
  red: 'bg-red-400',
  amber: 'bg-amber-400',
  cyan: 'bg-cyan-400',
};

export function LiveDot({ color = 'emerald', className }: LiveDotProps) {
  return (
    <span className={cn('inline-block w-2 h-2 rounded-full animate-pulse', colorMap[color], className)} />
  );
}
