import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Holding, Transaction } from '@/lib/types/portfolio';

interface PortfolioState {
  holdings: Holding[];
  transactions: Transaction[];
  addHolding: (h: Omit<Holding, 'id'>) => void;
  removeHolding: (id: string) => void;
  updateHolding: (id: string, updates: Partial<Holding>) => void;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      holdings: [],
      transactions: [],
      addHolding: (h) =>
        set((state) => ({
          holdings: [...state.holdings, { ...h, id: crypto.randomUUID() }],
        })),
      removeHolding: (id) =>
        set((state) => ({
          holdings: state.holdings.filter((h) => h.id !== id),
        })),
      updateHolding: (id, updates) =>
        set((state) => ({
          holdings: state.holdings.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        })),
      addTransaction: (t) =>
        set((state) => ({
          transactions: [{ ...t, id: crypto.randomUUID() }, ...state.transactions],
        })),
      removeTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),
    }),
    { name: 'financeai-portfolio' }
  )
);
