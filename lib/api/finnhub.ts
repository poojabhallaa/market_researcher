import type { Quote, Candle, CompanyProfile, NewsArticle, SymbolSearchResult } from '@/lib/types/market';

const BASE = 'https://finnhub.io/api/v1';

function key() {
  const k = process.env.FINNHUB_API_KEY;
  if (!k) throw new Error('FINNHUB_API_KEY is not set');
  return k;
}

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set('token', key());
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Finnhub ${path} failed: ${res.status}`);
  return res.json();
}

export async function getQuote(symbol: string): Promise<Quote> {
  const d = await get<{
    c: number; d: number; dp: number; h: number; l: number; o: number; pc: number; t: number;
  }>('/quote', { symbol });
  return {
    symbol,
    price: d.c,
    change: d.d ?? 0,
    changePercent: d.dp ?? 0,
    high: d.h,
    low: d.l,
    open: d.o,
    previousClose: d.pc,
    volume: 0,
    timestamp: d.t,
  };
}

export async function getCandles(
  symbol: string,
  resolution: string,
  from: number,
  to: number
): Promise<Candle[]> {
  const d = await get<{
    c: number[]; h: number[]; l: number[]; o: number[]; t: number[]; v: number[]; s: string;
  }>('/stock/candle', { symbol, resolution, from: String(from), to: String(to) });

  if (d.s !== 'ok' || !d.t) return [];

  return d.t.map((time, i) => ({
    time,
    open: d.o[i],
    high: d.h[i],
    low: d.l[i],
    close: d.c[i],
    volume: d.v[i],
  }));
}

export async function getCompanyProfile(symbol: string): Promise<CompanyProfile> {
  const d = await get<{
    name: string; exchange: string; finnhubIndustry: string; sector?: string;
    marketCapitalization: number; shareOutstanding: number; logo: string;
    weburl: string; description?: string; country: string; currency: string; ipo: string;
  }>('/stock/profile2', { symbol });
  return {
    symbol,
    name: d.name ?? symbol,
    exchange: d.exchange ?? '',
    industry: d.finnhubIndustry ?? '',
    sector: d.sector ?? d.finnhubIndustry ?? '',
    marketCap: d.marketCapitalization ?? 0,
    shareOutstanding: d.shareOutstanding ?? 0,
    logo: d.logo ?? '',
    weburl: d.weburl ?? '',
    description: d.description ?? '',
    country: d.country ?? '',
    currency: d.currency ?? 'USD',
    ipo: d.ipo ?? '',
  };
}

export async function searchSymbol(query: string): Promise<SymbolSearchResult[]> {
  const d = await get<{ result: Array<{ symbol: string; description: string; type: string; displaySymbol: string }> }>(
    '/search', { q: query }
  );
  return (d.result ?? []).slice(0, 8);
}

export async function getCompanyNews(symbol: string, from: string, to: string): Promise<NewsArticle[]> {
  const d = await get<Array<{
    id: number; headline: string; summary: string; source: string;
    url: string; datetime: number; image?: string;
  }>>('/company-news', { symbol, from, to });

  return (d ?? []).slice(0, 20).map((a) => ({
    id: String(a.id),
    headline: a.headline,
    summary: a.summary,
    source: a.source,
    url: a.url,
    datetime: a.datetime,
    image: a.image,
  }));
}
