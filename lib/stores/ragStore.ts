import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RagDocument } from '@/lib/types/rag';

interface RagState {
  documents: RagDocument[];
  addDocument: (doc: RagDocument) => void;
  removeDocument: (id: string) => void;
}

export const useRagStore = create<RagState>()(
  persist(
    (set) => ({
      documents: [],
      addDocument: (doc) =>
        set((state) => ({ documents: [...state.documents, doc] })),
      removeDocument: (id) =>
        set((state) => ({ documents: state.documents.filter((d) => d.id !== id) })),
    }),
    { name: 'financeai-rag' }
  )
);
