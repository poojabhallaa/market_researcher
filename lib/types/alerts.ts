export type AlertCondition = 'above' | 'below';

export interface PriceAlert {
  id: string;
  symbol: string;
  name: string;
  condition: AlertCondition;
  targetPrice: number;
  note?: string;
  active: boolean;
  triggeredAt: string | null;
  createdAt: string;
}
