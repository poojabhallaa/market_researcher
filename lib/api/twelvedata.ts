import type { Quote, Candle, SymbolSearchResult } from '@/lib/types/market';

/**
 * Twelve Data client (https://twelvedata.com) — quotes, candles, symbol search.
 *
 * Free tier is ~8 requests/min, 800/day, so we batch where possible (the ticker
 * fetches every symbol in a single request) and let React Query cache the rest.
 */

const BASE = 'https://api.twelvedata.com';

function key(): string {
  const k = process.env.TWELVEDATA_API_KEY;
  if (!k) throw new Error('TWELVEDATA_API_KEY is not set — add it to .env.local');
  return k;
}

async function get<T>(
  path: string,
  params: Record<string, string>,
  revalidate = 30
): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set('apikey', key());
  const res = await fetch(url.toString(), { next: { revalidate } });
  if (!res.ok) throw new Error(`Twelve Data ${path} failed: ${res.status}`);
  return res.json();
}

const num = (v: unknown): number => {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : 0;
};

interface TDQuote {
  symbol?: string;
  name?: string;
  exchange?: string;
  currency?: string;
  datetime?: string;
  timestamp?: number;
  open?: string;
  high?: string;
  low?: string;
  close?: string;
  previous_close?: string;
  change?: string;
  percent_change?: string;
  volume?: string;
  status?: string;
  code?: number;
}

/** A raw Twelve Data quote is usable only if it carries a real price. */
function isUsableQuote(q: TDQuote | undefined): q is TDQuote {
  return !!q && q.status !== 'error' && q.close != null && Number.isFinite(parseFloat(q.close));
}

function mapQuote(symbol: string, q: TDQuote): Quote {
  return {
    symbol: q.symbol ?? symbol,
    price: num(q.close),
    change: num(q.change),
    changePercent: num(q.percent_change),
    high: num(q.high),
    low: num(q.low),
    open: num(q.open),
    previousClose: num(q.previous_close),
    volume: num(q.volume),
    timestamp: Number(q.timestamp) || Math.floor(Date.now() / 1000),
  };
}

export async function getQuote(symbol: string): Promise<Quote | null> {
  const q = await get<TDQuote>('/quote', { symbol }, 15);
  return isUsableQuote(q) ? mapQuote(symbol, q) : null;
}

/**
 * Batch quote for the ticker. Returns ONLY symbols whose price could actually be
 * fetched — unknown / rate-limited symbols are silently dropped.
 */
export async function getQuotes(symbols: string[]): Promise<Quote[]> {
  if (symbols.length === 0) return [];
  const joined = symbols.join(',');
  const data = await get<TDQuote | Record<string, TDQuote>>('/quote', { symbol: joined }, 15);

  // A single symbol comes back flat; multiple symbols come back keyed by symbol.
  if ('close' in data || 'status' in data) {
    const q = data as TDQuote;
    return isUsableQuote(q) ? [mapQuote(symbols[0], q)] : [];
  }

  const byKey = data as Record<string, TDQuote>;
  return symbols
    .map((s) => (isUsableQuote(byKey[s]) ? mapQuote(s, byKey[s]) : null))
    .filter((q): q is Quote => q !== null);
}

interface TDInterval {
  interval: string;
  /** How many bars to request for the given timeframe. */
  outputsize: number;
}

/** Map the app's Finnhub-style resolutions to Twelve Data intervals. */
function resolutionToInterval(resolution: string, from: number, to: number): TDInterval {
  const spanSec = Math.max(to - from, 1);
  const map: Record<string, { interval: string; barSec: number }> = {
    '5': { interval: '5min', barSec: 300 },
    '15': { interval: '15min', barSec: 900 },
    '30': { interval: '30min', barSec: 1800 },
    '60': { interval: '1h', barSec: 3600 },
    D: { interval: '1day', barSec: 86_400 },
    W: { interval: '1week', barSec: 604_800 },
    M: { interval: '1month', barSec: 2_592_000 },
  };
  const cfg = map[resolution] ?? map.D;
  const outputsize = Math.min(Math.max(Math.ceil(spanSec / cfg.barSec), 5), 500);
  return { interval: cfg.interval, outputsize };
}

interface TDTimeSeries {
  status?: string;
  values?: Array<{
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume?: string;
  }>;
}

export async function getTimeSeries(
  symbol: string,
  resolution: string,
  from: number,
  to: number
): Promise<Candle[]> {
  const { interval, outputsize } = resolutionToInterval(resolution, from, to);
  const data = await get<TDTimeSeries>(
    '/time_series',
    { symbol, interval, outputsize: String(outputsize) },
    60
  );
  if (data.status === 'error' || !Array.isArray(data.values)) return [];

  // Twelve Data returns newest-first; the chart expects oldest-first.
  return data.values
    .map((v) => ({
      time: Math.floor(new Date(v.datetime.replace(' ', 'T')).getTime() / 1000),
      open: num(v.open),
      high: num(v.high),
      low: num(v.low),
      close: num(v.close),
      volume: num(v.volume),
    }))
    .reverse();
}

interface TDSearch {
  data?: Array<{
    symbol: string;
    instrument_name: string;
    exchange: string;
    instrument_type: string;
    country: string;
  }>;
}

export async function searchSymbol(query: string): Promise<SymbolSearchResult[]> {
  const data = await get<TDSearch>('/symbol_search', { symbol: query, outputsize: '20' }, 300);
  const seen = new Set<string>();
  const out: SymbolSearchResult[] = [];
  for (const r of data.data ?? []) {
    if (seen.has(r.symbol)) continue; // collapse the same ticker across exchanges
    seen.add(r.symbol);
    out.push({
      symbol: r.symbol,
      description: r.instrument_name,
      type: r.instrument_type,
      displaySymbol: r.symbol,
    });
    if (out.length >= 8) break;
  }
  return out;
}
