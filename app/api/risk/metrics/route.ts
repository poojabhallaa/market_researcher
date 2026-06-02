import { getCandles } from '@/lib/api/finnhub';
import type { RiskMetrics, CorrelationMatrix } from '@/lib/types/risk';
import type { Holding } from '@/lib/types/portfolio';

function mean(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function stddev(arr: number[]): number {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

function returns(prices: number[]): number[] {
  const r: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    r.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  return r;
}

function pearson(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  const ax = a.slice(0, n);
  const bx = b.slice(0, n);
  const ma = mean(ax);
  const mb = mean(bx);
  const cov = ax.reduce((s, v, i) => s + (v - ma) * (bx[i] - mb), 0) / n;
  const sa = stddev(ax);
  const sb = stddev(bx);
  if (sa === 0 || sb === 0) return 0;
  return cov / (sa * sb);
}

function maxDrawdown(prices: number[]): number {
  let peak = prices[0];
  let maxDD = 0;
  for (const p of prices) {
    if (p > peak) peak = p;
    const dd = (peak - p) / peak;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD * 100;
}

export async function POST(request: Request) {
  const { holdings } = await request.json() as { holdings: Holding[] };

  if (!holdings || holdings.length === 0) {
    return Response.json({ error: 'No holdings provided' }, { status: 400 });
  }

  const now = Math.floor(Date.now() / 1000);
  const from90d = now - 90 * 86400;

  try {
    const [spyCandles, ...holdingCandles] = await Promise.all([
      getCandles('SPY', 'D', from90d, now),
      ...holdings.map((h) => getCandles(h.symbol, 'D', from90d, now)),
    ]);

    const spyPrices = spyCandles.map((c) => c.close);
    const spyReturns = returns(spyPrices);

    const allReturns = holdingCandles.map((c) => returns(c.map((x) => x.close)));
    const allPrices = holdingCandles.map((c) => c.map((x) => x.close));

    // Weighted portfolio returns by market value
    const weights = holdings.map((h) => {
      const lastPrice = allPrices[holdings.indexOf(h)]?.at(-1) ?? h.avgCost;
      return lastPrice * h.quantity;
    });
    const totalValue = weights.reduce((s, w) => s + w, 0);
    const normalizedWeights = weights.map((w) => (totalValue > 0 ? w / totalValue : 1 / holdings.length));

    const minLen = Math.min(...allReturns.map((r) => r.length), spyReturns.length);
    const portfolioReturns = Array.from({ length: minLen }, (_, i) =>
      allReturns.reduce((s, r, j) => s + (r[i] ?? 0) * normalizedWeights[j], 0)
    );

    const annualizedVol = stddev(portfolioReturns) * Math.sqrt(252) * 100;
    const annualizedReturn = mean(portfolioReturns) * 252;
    const sharpeRatio = (annualizedReturn - 0.05) / (annualizedVol / 100);

    const spyR = spyReturns.slice(-minLen);
    const covPortfolioSpy = portfolioReturns.reduce((s, r, i) => s + (r - mean(portfolioReturns)) * (spyR[i] - mean(spyR)), 0) / minLen;
    const varSpy = stddev(spyR) ** 2;
    const beta = varSpy > 0 ? covPortfolioSpy / varSpy : 1;

    const dailyVol = stddev(portfolioReturns);
    const valueAtRisk = totalValue * 1.645 * dailyVol;

    const portfolioPrices = holdingCandles[0]?.map((_, dayIdx) =>
      holdings.reduce((s, h, j) => {
        const p = allPrices[j]?.[dayIdx] ?? h.avgCost;
        return s + p * h.quantity;
      }, 0)
    ) ?? [];
    const portMaxDD = maxDrawdown(portfolioPrices);

    const concentration = Math.max(...normalizedWeights) * 100;
    const overallScore = Math.min(100, Math.round(
      annualizedVol * 0.4 +
      portMaxDD * 0.3 +
      concentration * 0.2 +
      Math.max(0, beta - 1) * 20
    ));

    const metrics: RiskMetrics = {
      overallScore,
      volatility: annualizedVol,
      sharpeRatio,
      beta,
      valueAtRisk,
      maxDrawdown: portMaxDD,
      concentration,
    };

    const symbols = holdings.map((h) => h.symbol);
    const matrix: number[][] = symbols.map((_, i) =>
      symbols.map((_, j) => {
        if (i === j) return 1;
        return pearson(allReturns[i] ?? [], allReturns[j] ?? []);
      })
    );

    const correlationMatrix: CorrelationMatrix = { symbols, matrix };

    return Response.json({ metrics, correlationMatrix });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
