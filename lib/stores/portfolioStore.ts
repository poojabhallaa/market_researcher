import { create } from 'zustand';
import type { Holding, Transaction } from '@/lib/types/portfolio';
import {
  addHoldingDoc,
  removeHoldingDoc,
  updateHoldingDoc,
  addTransactionDoc,
  removeTransactionDoc,
} from '@/lib/firebase/db';

interface PortfolioState {
  holdings: Holding[];
  transactions: Transaction[];
  // Hydrated by the Firestore sync layer:
  setHoldings: (h: Holding[]) => void;
  setTransactions: (t: Transaction[]) => void;
  // Writes go to Firestore; the live listener reflects them back into state.
  addHolding: (h: Omit<Holding, 'id'>) => void;
  removeHolding: (id: string) => void;
  updateHolding: (id: string, updates: Partial<Holding>) => void;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
}

export const usePortfolioStore = create<PortfolioState>()((set) => ({
  holdings: [],
  transactions: [],
  setHoldings: (holdings) => set({ holdings }),
  setTransactions: (transactions) => set({ transactions }),
  addHolding: (h) => void addHoldingDoc(h),
  removeHolding: (id) => void removeHoldingDoc(id),
  updateHolding: (id, updates) => void updateHoldingDoc(id, updates),
  addTransaction: (t) => void addTransactionDoc(t),
  removeTransaction: (id) => void removeTransactionDoc(id),
}));
