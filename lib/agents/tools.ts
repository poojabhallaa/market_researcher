import { tool } from 'ai';
import { z } from 'zod/v4';
import { getIncomeStatement, getBalanceSheet, getCashFlow } from '@/lib/api/fmp';
import { getCompanyNews } from '@/lib/api/finnhub';
import { searchNews } from '@/lib/api/news';

const now = () => new Date().toISOString().slice(0, 10);
const weekAgo = () => new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10);

export const financialTools = {
  getIncomeStatement: tool({
    description: 'Fetch quarterly income statements (revenue, profit, EPS, margins) for a company',
    inputSchema: z.object({ symbol: z.string().describe('Stock ticker symbol e.g. AAPL') }),
    execute: async ({ symbol }: { symbol: string }) => getIncomeStatement(symbol.toUpperCase()),
  }),
  getBalanceSheet: tool({
    description: 'Fetch balance sheet data (assets, liabilities, equity, debt) for a company',
    inputSchema: z.object({ symbol: z.string() }),
    execute: async ({ symbol }: { symbol: string }) => getBalanceSheet(symbol.toUpperCase()),
  }),
  getCashFlow: tool({
    description: 'Fetch cash flow statement (operating, investing, financing, free cash flow)',
    inputSchema: z.object({ symbol: z.string() }),
    execute: async ({ symbol }: { symbol: string }) => getCashFlow(symbol.toUpperCase()),
  }),
};

export const newsTools = {
  getCompanyNews: tool({
    description: 'Get recent news articles for a specific company stock symbol',
    inputSchema: z.object({ symbol: z.string() }),
    execute: async ({ symbol }: { symbol: string }) => getCompanyNews(symbol.toUpperCase(), weekAgo(), now()),
  }),
  searchNews: tool({
    description: 'Search for financial news by keyword or topic',
    inputSchema: z.object({ query: z.string() }),
    execute: async ({ query }: { query: string }) => searchNews(query),
  }),
};

export const allTools = { ...financialTools, ...newsTools };
