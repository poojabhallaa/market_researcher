'use client';
import { FileText, Trash2, ChevronRight } from 'lucide-react';
import { useRagStore } from '@/lib/stores/ragStore';
import { GlassCard } from '@/components/ui/GlassCard';
import type { RagDocument } from '@/lib/types/rag';

interface DocumentListProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function DocumentList({ selected, onSelect }: DocumentListProps) {
  const { documents, removeDocument } = useRagStore();

  if (documents.length === 0) {
    return (
      <GlassCard className="p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Documents</h3>
        <p className="text-xs text-zinc-600 text-center py-4">No documents uploaded yet</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5">
      <h3 className="text-sm font-semibold text-zinc-300 mb-3">Documents ({documents.length})</h3>
      <div className="space-y-1">
        {documents.map((doc: RagDocument) => (
          <div
            key={doc.id}
            onClick={() => onSelect(doc.id)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors group ${
              selected === doc.id
                ? 'bg-emerald-500/10 border border-emerald-500/20'
                : 'hover:bg-zinc-800/60 border border-transparent'
            }`}
          >
            <FileText className={`w-4 h-4 shrink-0 ${selected === doc.id ? 'text-emerald-400' : 'text-zinc-500'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-200 truncate">{doc.title}</p>
              <p className="text-[10px] text-zinc-600">{doc.chunks.length} chunks · {formatDate(doc.uploadedAt)}</p>
            </div>
            <ChevronRight className={`w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${selected === doc.id ? 'text-emerald-400 opacity-100' : 'text-zinc-500'}`} />
            <button
              onClick={(e) => { e.stopPropagation(); removeDocument(doc.id); }}
              className="ml-1 text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
