import { streamGeminiText } from '@/lib/api/gemini';

export const maxDuration = 60;

interface HoldingWithPrice {
  symbol: string;
  name: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
}

export async function POST(request: Request) {
  const body = (await request.json()) as { holdings: HoldingWithPrice[] };
  const { holdings } = body;

  const totalValue = holdings.reduce((s, h) => s + h.currentPrice * h.quantity, 0);
  const totalCost = holdings.reduce((s, h) => s + h.avgCost * h.quantity, 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  const holdingLines = holdings
    .map((h) => {
      const value = h.currentPrice * h.quantity;
      const cost = h.avgCost * h.quantity;
      const pnl = value - cost;
      const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
      const weight = totalValue > 0 ? (value / totalValue) * 100 : 0;
      return `- ${h.symbol} (${h.name}): ${h.quantity} shares | avg cost $${h.avgCost.toFixed(2)} | current $${h.currentPrice.toFixed(2)} | P&L ${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(1)}% ($${pnl >= 0 ? '+' : ''}${pnl.toFixed(0)}) | weight ${weight.toFixed(1)}%`;
    })
    .join('\n');

  const system = `You are a professional financial advisor. Analyze the given portfolio and provide:
1. A brief performance assessment for each holding (is it doing well or not, and why based on general market knowledge)
2. An overall portfolio health assessment
3. 2–3 specific, actionable recommendations the investor should consider

Be direct and concise. Use bullet points. Do not add excessive disclaimers. Focus on what the investor should actually consider doing.`;

  const userMessage = `Portfolio Analysis Request:

Summary:
- Total Market Value: $${totalValue.toFixed(0)}
- Total Cost Basis: $${totalCost.toFixed(0)}
- Unrealized P&L: ${totalPnL >= 0 ? '+' : ''}$${Math.abs(totalPnL).toFixed(0)} (${totalPnLPct >= 0 ? '+' : ''}${totalPnLPct.toFixed(1)}%)

Holdings:
${holdingLines}

Analyze each position's performance and provide actionable advice for this portfolio.`;

  return streamGeminiText({
    system,
    messages: [{ role: 'user', content: userMessage }],
    search: true,
  });
}
