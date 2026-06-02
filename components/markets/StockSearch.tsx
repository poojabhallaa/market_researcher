'use client';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp } from 'lucide-react';
import type { SymbolSearchResult } from '@/lib/types/market';

interface StockSearchProps {
  defaultValue?: string;
  onSelect?: (symbol: string) => void;
  navigateTo?: boolean;
}

export function StockSearch({ defaultValue = '', onSelect, navigateTo = true }: StockSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results = [] } = useQuery<SymbolSearchResult[]>({
    queryKey: ['search', debouncedQuery],
    queryFn: () => fetch(`/api/market/search?q=${encodeURIComponent(debouncedQuery)}`).then((r) => r.json()),
    enabled: debouncedQuery.length > 1,
    staleTime: 60_000,
  });

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  function handleSelect(symbol: string) {
    setQuery('');
    setOpen(false);
    if (onSelect) onSelect(symbol);
    if (navigateTo) router.push(`/dashboard/markets?symbol=${symbol}`);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={defaultValue || 'Search symbol or company...'}
          className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800/60 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-zinc-900 border border-zinc-800/60 rounded-lg shadow-2xl overflow-hidden">
          {results.map((r) => (
            <button
              key={r.symbol}
              onClick={() => handleSelect(r.symbol)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/60 transition-colors text-left"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold text-sm text-zinc-100">{r.symbol}</span>
              <span className="text-xs text-zinc-400 truncate">{r.description}</span>
              <span className="ml-auto text-[10px] text-zinc-600 shrink-0">{r.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
