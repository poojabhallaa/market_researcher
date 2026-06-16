import { streamGeminiText } from '@/lib/api/gemini';
import type { Holding } from '@/lib/types/portfolio';
import type { RiskMetrics } from '@/lib/types/risk';

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = (await request.json()) as {
    holdings: Holding[];
    metrics?: RiskMetrics;
    question: string;
  };

  const { holdings, metrics, question } = body;

  const holdingsSummary = holdings
    .map((h) => `${h.symbol} (${h.name}): ${h.quantity} shares @ $${h.avgCost.toFixed(2)} avg cost`)
    .join('\n');

  const metricsText = metrics
    ? `Computed Risk Metrics:
- Overall Risk Score: ${metrics.overallScore}/100
- Annualized Volatility: ${metrics.volatility.toFixed(1)}%
- Sharpe Ratio: ${metrics.sharpeRatio.toFixed(2)}
- Beta vs SPY: ${metrics.beta.toFixed(2)}
- 95% Value at Risk: $${metrics.valueAtRisk.toFixed(0)}
- Max Drawdown: ${metrics.maxDrawdown.toFixed(1)}%
- Concentration: ${metrics.concentration.toFixed(1)}%`
    : 'Note: quantitative risk metrics have not been computed yet.';

  const system = `You are a professional financial risk analyst. The user has asked a specific question about their portfolio risk. Provide a focused, actionable answer. Use clear language, short paragraphs, and bullet points where helpful. Avoid excessive disclaimers.`;

  const userMessage = `Portfolio Holdings:
${holdingsSummary}

${metricsText}

User Question: ${question}`;

  return streamGeminiText({
    system,
    messages: [{ role: 'user', content: userMessage }],
    search: false,
  });
}
