'use client';
import { ExternalLink, Globe, Building2 } from 'lucide-react';
import { useQuote } from '@/lib/hooks/useQuote';
import { useCompanyProfile } from '@/lib/hooks/useCompanyProfile';
import { useFinnhubSocket } from '@/lib/hooks/useFinnhubSocket';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { LiveDot } from '@/components/ui/LiveDot';
import { Skeleton } from '@/components/ui/Skeleton';
import { GlassCard } from '@/components/ui/GlassCard';

function formatMarketCap(v: number): string {
  if (v >= 1_000) return `$${(v / 1_000).toFixed(2)}T`;
  if (v >= 1) return `$${v.toFixed(2)}B`;
  return `$${(v * 1_000).toFixed(0)}M`;
}

export function CompanyOverview({ symbol }: { symbol: string }) {
  const { data: quote, isLoading: qLoading } = useQuote(symbol);
  const { data: profile, isLoading: pLoading } = useCompanyProfile(symbol);
  const livePrice = useFinnhubSocket(symbol);

  const price = livePrice ?? (typeof quote?.price === 'number' ? quote.price : undefined);

  const isUp = (quote?.changePercent ?? 0) >= 0;

  return (
    <GlassCard className="p-6">
      <div className="flex items-start gap-4">
        {profile?.logo ? (
          <img
            src={profile.logo}
            alt={profile.name}
            className="w-12 h-12 rounded-lg object-contain bg-white p-1 shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-zinc-500" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-zinc-100 truncate">{profile?.name ?? symbol}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {symbol} · {profile?.exchange ?? ''} · {profile?.sector ?? ''}
          </p>

          <div className="flex items-baseline gap-3 mt-3">
            <div className="flex items-center gap-1.5">
              <LiveDot color={isUp ? 'emerald' : 'red'} />
              <span className="text-2xl font-bold text-zinc-100">
                {price !== undefined ? (
                  <AnimatedNumber value={price} prefix="$" decimals={2} duration={400} />
                ) : '—'}
              </span>
            </div>
            {quote && typeof quote.changePercent === 'number' && (
              <span className={`text-sm font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                {isUp ? '+' : ''}{quote.changePercent.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {profile && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-zinc-500 mb-0.5">Market Cap</p>
            <p className="text-zinc-200 font-medium">{formatMarketCap(profile.marketCap)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-0.5">Country</p>
            <p className="text-zinc-200 font-medium">{profile.country || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-0.5">Industry</p>
            <p className="text-zinc-200 font-medium truncate">{profile.industry || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-0.5">IPO Date</p>
            <p className="text-zinc-200 font-medium">{profile.ipo || '—'}</p>
          </div>
        </div>
      )}

      {profile?.weburl && (
        <a
          href={profile.weburl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          Company website
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </GlassCard>
  );
}
