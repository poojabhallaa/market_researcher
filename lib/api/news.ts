import type { NewsArticle } from '@/lib/types/market';

const NEWS_API_BASE = 'https://newsapi.org/v2';

function key() {
  return process.env.NEWS_API_KEY ?? '';
}

async function fetchRssNews(symbol: string): Promise<NewsArticle[]> {
  try {
    const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${symbol}&region=US&lang=en-US`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    const xml = await res.text();

    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];
    return items.slice(0, 10).map((item, i) => {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ?? item.match(/<title>(.*?)<\/title>/)?.[1] ?? '';
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] ?? '';
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? '';
      const desc = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ?? item.match(/<description>(.*?)<\/description>/)?.[1] ?? '';
      return {
        id: `rss-${symbol}-${i}`,
        headline: title,
        summary: desc.replace(/<[^>]*>/g, '').slice(0, 300),
        source: 'Yahoo Finance',
        url: link,
        datetime: pubDate ? Math.floor(new Date(pubDate).getTime() / 1000) : Date.now() / 1000,
      };
    });
  } catch {
    return [];
  }
}

/** Per-company headlines from Yahoo Finance RSS — no API key required. */
export async function getCompanyNews(symbol: string): Promise<NewsArticle[]> {
  return fetchRssNews(symbol);
}

export async function getTopFinanceNews(): Promise<NewsArticle[]> {
  if (!key()) return fetchRssNews('AAPL,MSFT,GOOGL');

  try {
    const url = new URL(`${NEWS_API_BASE}/everything`);
    url.searchParams.set('q', 'stock market finance earnings');
    url.searchParams.set('sortBy', 'publishedAt');
    url.searchParams.set('language', 'en');
    url.searchParams.set('pageSize', '20');
    url.searchParams.set('apiKey', key());

    const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
    if (!res.ok) return fetchRssNews('AAPL');
    const d = await res.json();

    return (d.articles ?? []).map((a: Record<string, unknown>, i: number) => ({
      id: `news-${i}`,
      headline: String(a.title ?? ''),
      summary: String(a.description ?? ''),
      source: String((a.source as Record<string, unknown>)?.name ?? 'NewsAPI'),
      url: String(a.url ?? ''),
      datetime: Math.floor(new Date(String(a.publishedAt ?? '')).getTime() / 1000),
      image: String(a.urlToImage ?? ''),
    }));
  } catch {
    return fetchRssNews('AAPL');
  }
}

export async function searchNews(query: string): Promise<NewsArticle[]> {
  if (!key()) return [];

  try {
    const url = new URL(`${NEWS_API_BASE}/everything`);
    url.searchParams.set('q', query);
    url.searchParams.set('sortBy', 'relevancy');
    url.searchParams.set('language', 'en');
    url.searchParams.set('pageSize', '10');
    url.searchParams.set('apiKey', key());

    const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    const d = await res.json();

    return (d.articles ?? []).map((a: Record<string, unknown>, i: number) => ({
      id: `search-${i}`,
      headline: String(a.title ?? ''),
      summary: String(a.description ?? ''),
      source: String((a.source as Record<string, unknown>)?.name ?? 'NewsAPI'),
      url: String(a.url ?? ''),
      datetime: Math.floor(new Date(String(a.publishedAt ?? '')).getTime() / 1000),
    }));
  } catch {
    return [];
  }
}
