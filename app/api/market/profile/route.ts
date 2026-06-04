import { Type } from '@google/genai';
import { generateGeminiJSON } from '@/lib/api/gemini';
import type { CompanyProfile } from '@/lib/types/market';

export const maxDuration = 30;

// Stable company facts come from Gemini; the live price/stats come from Twelve
// Data (via useQuote). Together they populate the company overview card.
const PROFILE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: 'Full company name' },
    exchange: { type: Type.STRING, description: 'Primary listing exchange, e.g. NASDAQ' },
    sector: { type: Type.STRING },
    industry: { type: Type.STRING },
    country: { type: Type.STRING, description: 'Headquarters country' },
    marketCapB: { type: Type.NUMBER, description: 'Approximate market cap in billions USD' },
    description: { type: Type.STRING, description: 'One or two sentence business summary' },
    weburl: { type: Type.STRING, description: 'Official company website URL' },
    ipo: { type: Type.STRING, description: 'IPO date as YYYY-MM-DD, empty if unknown' },
  },
  required: ['name', 'exchange', 'sector', 'industry', 'country', 'marketCapB', 'weburl'],
};

interface GeminiProfile {
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  country: string;
  marketCapB: number;
  description?: string;
  weburl?: string;
  ipo?: string;
}

function domainOf(url: string): string {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  if (!symbol) return Response.json({ error: 'symbol required' }, { status: 400 });

  const ticker = symbol.toUpperCase();

  try {
    const p = await generateGeminiJSON<GeminiProfile>({
      system:
        'You are a financial reference database. Return accurate, factual company profile data. Use empty strings / 0 for anything you are unsure of rather than guessing.',
      prompt: `Company profile for the stock ticker ${ticker}.`,
      schema: PROFILE_SCHEMA,
    });

    if (!p) return Response.json({ error: 'profile unavailable' }, { status: 404 });

    const domain = domainOf(p.weburl ?? '');
    const profile: CompanyProfile = {
      symbol: ticker,
      name: p.name || ticker,
      exchange: p.exchange ?? '',
      industry: p.industry ?? '',
      sector: p.sector ?? '',
      // marketCap is stored in billions to match formatMarketCap() in the UI.
      marketCap: Number(p.marketCapB) || 0,
      shareOutstanding: 0,
      logo: domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : '',
      weburl: p.weburl ?? '',
      description: p.description ?? '',
      country: p.country ?? '',
      currency: 'USD',
      ipo: p.ipo ?? '',
    };

    return Response.json(profile);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
