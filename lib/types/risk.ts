export interface RiskMetrics {
  overallScore: number;
  volatility: number;
  sharpeRatio: number;
  beta: number;
  valueAtRisk: number;
  maxDrawdown: number;
  concentration: number;
}

export interface CorrelationMatrix {
  symbols: string[];
  matrix: number[][];
}

export type AlertMetric = 'price' | 'changePercent' | 'riskScore';
export type AlertDirection = 'above' | 'below';

export interface AlertRule {
  id: string;
  symbol: string;
  metric: AlertMetric;
  threshold: number;
  direction: AlertDirection;
  triggered?: boolean;
}
