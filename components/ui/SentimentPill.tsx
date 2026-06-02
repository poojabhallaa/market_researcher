import { cn } from '@/lib/utils';

interface SentimentPillProps {
  sentiment: 'positive' | 'negative' | 'neutral';
  score?: number;
  className?: string;
}

const COLORS = {
  positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  negative: 'bg-red-500/10 text-red-400 border-red-500/20',
  neutral: 'bg-zinc-700/40 text-zinc-400 border-zinc-700/40',
};

export function SentimentPill({ sentiment, score, className }: SentimentPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide',
        COLORS[sentiment],
        className
      )}
    >
      {sentiment}
      {score !== undefined && <span className="opacity-70">· {score}%</span>}
    </span>
  );
}
