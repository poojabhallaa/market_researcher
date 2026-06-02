import type { IncomeStatement, BalanceSheet, CashFlowStatement } from '@/lib/types/market';

const BASE = 'https://financialmodelingprep.com/api/v3';

function key() {
  const k = process.env.FMP_API_KEY;
  if (!k) throw new Error('FMP_API_KEY is not set');
  return k;
}

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set('apikey', key());
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`FMP ${path} failed: ${res.status}`);
  return res.json();
}

export async function getIncomeStatement(symbol: string): Promise<IncomeStatement[]> {
  'use cache';
  const d = await get<Array<Record<string, unknown>>>(`/income-statement/${symbol}`, { limit: '4' });
  return (d ?? []).map((r) => ({
    date: String(r.date ?? ''),
    symbol: String(r.symbol ?? symbol),
    revenue: Number(r.revenue ?? 0),
    grossProfit: Number(r.grossProfit ?? 0),
    operatingIncome: Number(r.operatingIncome ?? 0),
    netIncome: Number(r.netIncome ?? 0),
    eps: Number(r.eps ?? 0),
    ebitda: Number(r.ebitda ?? 0),
    grossProfitRatio: Number(r.grossProfitRatio ?? 0),
    operatingIncomeRatio: Number(r.operatingIncomeRatio ?? 0),
    netIncomeRatio: Number(r.netIncomeRatio ?? 0),
  }));
}

export async function getBalanceSheet(symbol: string): Promise<BalanceSheet[]> {
  'use cache';
  const d = await get<Array<Record<string, unknown>>>(`/balance-sheet-statement/${symbol}`, { limit: '4' });
  return (d ?? []).map((r) => ({
    date: String(r.date ?? ''),
    symbol: String(r.symbol ?? symbol),
    totalAssets: Number(r.totalAssets ?? 0),
    totalLiabilities: Number(r.totalLiabilities ?? 0),
    totalEquity: Number(r.totalStockholdersEquity ?? 0),
    totalDebt: Number(r.totalDebt ?? 0),
    cashAndCashEquivalents: Number(r.cashAndCashEquivalents ?? 0),
    shortTermInvestments: Number(r.shortTermInvestments ?? 0),
    longTermDebt: Number(r.longTermDebt ?? 0),
  }));
}

export async function getCashFlow(symbol: string): Promise<CashFlowStatement[]> {
  'use cache';
  const d = await get<Array<Record<string, unknown>>>(`/cash-flow-statement/${symbol}`, { limit: '4' });
  return (d ?? []).map((r) => ({
    date: String(r.date ?? ''),
    symbol: String(r.symbol ?? symbol),
    operatingCashFlow: Number(r.operatingCashFlow ?? 0),
    investingCashFlow: Number(r.investingCashFlowActivities ?? 0),
    financingCashFlow: Number(r.financingCashFlowActivities ?? 0),
    freeCashFlow: Number(r.freeCashFlow ?? 0),
    capitalExpenditure: Number(r.capitalExpenditure ?? 0),
    dividendsPaid: Number(r.dividendsPaid ?? 0),
  }));
}
