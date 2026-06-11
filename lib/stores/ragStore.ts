import { create } from 'zustand';
import type { RagDocument } from '@/lib/types/rag';
import { addRagDocumentDoc, removeRagDocumentDoc } from '@/lib/firebase/db';

interface RagState {
  documents: RagDocument[];
  /** Replaces the full document list — called by DataSync when Firestore snapshot arrives. */
  setDocuments: (docs: RagDocument[]) => void;
  /**
   * Adds a document optimistically to local state, then persists it to Firestore.
   * The `content` field (full raw text) is kept in-memory for the current session
   * but is intentionally stripped before writing to Firestore.
   */
  addDocument: (doc: RagDocument) => void;
  removeDocument: (id: string) => void;
}

export const useRagStore = create<RagState>()((set) => ({
  documents: [],

  setDocuments: (documents) => set({ documents }),

  addDocument: (ragDoc) => {
    // Optimistic update so the document appears immediately in the UI
    set((state) => ({ documents: [...state.documents, ragDoc] }));
    // Persist to Firestore (strips content — large text not needed after chunking)
    void addRagDocumentDoc(ragDoc);
  },

  removeDocument: (id) => {
    // Optimistic removal
    set((state) => ({ documents: state.documents.filter((d) => d.id !== id) }));
    void removeRagDocumentDoc(id);
  },
}));
