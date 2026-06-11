export interface RagChunk {
  id: string;
  text: string;
  documentId: string;
  index: number;
}

export interface RagDocument {
  id: string;
  title: string;
  /** Full raw text. Present in-memory after upload but NOT persisted to Firestore. */
  content?: string;
  uploadedAt: number;
  chunks: RagChunk[];
}
