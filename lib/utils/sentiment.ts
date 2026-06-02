const POSITIVE_WORDS = [
  'beat', 'beats', 'surge', 'surged', 'record', 'upgrade', 'upgraded', 'buy',
  'profit', 'growth', 'gains', 'rally', 'soars', 'strong', 'bullish', 'outperform',
  'revenue beat', 'earnings beat', 'raised guidance', 'new high', 'acquisition', 'partnership',
];

const NEGATIVE_WORDS = [
  'miss', 'misses', 'missed', 'decline', 'declined', 'downgrade', 'downgraded', 'sell',
  'loss', 'losses', 'drop', 'falls', 'weak', 'bearish', 'underperform', 'warning',
  'lawsuit', 'fine', 'investigation', 'layoffs', 'recall', 'cut guidance', 'miss estimates',
];

export function scoreSentiment(text: string): {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
} {
  const lower = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of POSITIVE_WORDS) {
    if (lower.includes(word)) positiveCount++;
  }
  for (const word of NEGATIVE_WORDS) {
    if (lower.includes(word)) negativeCount++;
  }

  if (positiveCount === 0 && negativeCount === 0) {
    return { sentiment: 'neutral', score: 50 };
  }

  const total = positiveCount + negativeCount;
  const positiveRatio = positiveCount / total;

  if (positiveRatio > 0.6) {
    return { sentiment: 'positive', score: Math.min(100, Math.round(positiveRatio * 100)) };
  }
  if (positiveRatio < 0.4) {
    return { sentiment: 'negative', score: Math.min(100, Math.round((1 - positiveRatio) * 100)) };
  }
  return { sentiment: 'neutral', score: 50 };
}
