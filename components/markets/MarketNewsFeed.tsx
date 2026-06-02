'use client';
import { ExternalLink, Clock } from 'lucide-react';
import { useCompanyNews } from '@/lib/hooks/useCompanyNews';
import { SentimentPill } from '@/components/ui/SentimentPill';
import { GlassCard } from '@/components/ui/GlassCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { scoreSentiment } from '@/lib/utils/sentiment';

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000 - ts);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function MarketNewsFeed({ symbol }: { symbol: string }) {
  const { data: articles, isLoading } = useCompanyNews(symbol);

  if (!Array.isArray(articles) || articles.length === 0) {
    if (isLoading) return (
      <GlassCard className="p-6 space-y-4">
        <Skeleton className="h-4 w-24" />
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}
      </GlassCard>
    );
    return (
      <GlassCard className="p-6">
        <p className="text-sm text-zinc-500 text-center py-8">No recent news available</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <h3 className="text-sm font-semibold text-zinc-300 mb-4">Recent News</h3>
      <div className="space-y-0 divide-y divide-zinc-800/60">
        {articles.map((article) => {
          const { sentiment, score } = scoreSentiment(`${article.headline} ${article.summary}`);
          return (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block py-4 group hover:bg-zinc-800/20 -mx-2 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h4 className="text-sm text-zinc-200 group-hover:text-white transition-colors leading-snug line-clamp-2">
                  {article.headline}
                </h4>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 shrink-0 mt-0.5 transition-colors" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-zinc-500 font-medium">{article.source}</span>
                <span className="text-zinc-700">·</span>
                <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                  <Clock className="w-3 h-3" />
                  {timeAgo(article.datetime)}
                </span>
                <SentimentPill sentiment={sentiment} score={score} />
              </div>
            </a>
          );
        })}
      </div>
    </GlassCard>
  );
}
