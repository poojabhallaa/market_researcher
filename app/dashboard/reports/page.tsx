'use client';
import { useState } from 'react';
import { FileBarChart } from 'lucide-react';
import { DocumentUploader } from '@/components/reports/DocumentUploader';
import { DocumentList } from '@/components/reports/DocumentList';
import { RagChat } from '@/components/reports/RagChat';

export default function ReportsPage() {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4" style={{ height: 'calc(100vh - 8rem)' }}>
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <FileBarChart className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-zinc-100">Document Analysis</h1>
          <p className="text-xs text-zinc-500">RAG-powered Q&A on financial documents</p>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left panel */}
        <div className="w-72 shrink-0 flex flex-col gap-4 overflow-y-auto">
          <DocumentUploader />
          <DocumentList selected={selectedDocId} onSelect={setSelectedDocId} />
        </div>

        {/* Chat panel */}
        <div className="flex-1 bg-zinc-900 border border-zinc-800/60 rounded-xl overflow-hidden min-h-0">
          <RagChat />
        </div>
      </div>
    </div>
  );
}
