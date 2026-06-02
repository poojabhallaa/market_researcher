export interface RagChunk {
  id: string;
  text: string;
  documentId: string;
  index: number;
}

export interface RagDocument {
  id: string;
  title: string;
  content: string;
  uploadedAt: number;
  chunks: RagChunk[];
}
