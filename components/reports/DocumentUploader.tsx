'use client';
import { useState, useRef } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useRagStore } from '@/lib/stores/ragStore';
import { GlassCard } from '@/components/ui/GlassCard';

export function DocumentUploader() {
  const [title, setTitle] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState<'paste' | 'file'>('paste');
  const fileRef = useRef<HTMLInputElement>(null);
  const { addDocument } = useRagStore();

  async function ingest(text: string, docTitle: string) {
    if (!text.trim() || !docTitle.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/rag/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, title: docTitle }),
      });
      if (!res.ok) throw new Error('Ingest failed');
      const doc = await res.json();
      addDocument(doc);
      setPastedText('');
      setTitle('');
    } catch {
      // could show a toast here
    } finally {
      setIsLoading(false);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      ingest(text, title || file.name.replace(/\.[^.]+$/, ''));
    };
    reader.readAsText(file);
  }

  return (
    <GlassCard className="p-5">
      <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
        <Upload className="w-4 h-4 text-emerald-400" />
        Upload Document
      </h3>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Document title (e.g. AAPL Q4 2024 Earnings)"
        className="w-full mb-3 px-3 py-2 bg-zinc-800/60 border border-zinc-700/40 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
      />

      <div className="flex gap-1 mb-3">
        {(['paste', 'file'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              tab === t
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'border-zinc-700/40 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t === 'paste' ? 'Paste Text' : 'Upload File'}
          </button>
        ))}
      </div>

      {tab === 'paste' ? (
        <>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste annual report, earnings call transcript, or any financial document text here..."
            rows={6}
            className="w-full px-3 py-2 bg-zinc-800/60 border border-zinc-700/40 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 resize-none transition-colors"
          />
          <button
            onClick={() => ingest(pastedText, title || 'Untitled Document')}
            disabled={isLoading || !pastedText.trim()}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {isLoading ? 'Processing...' : 'Process Document'}
          </button>
        </>
      ) : (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.csv"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={isLoading}
            className="w-full flex flex-col items-center justify-center gap-2 py-8 border border-dashed border-zinc-700/60 rounded-lg text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
            <span className="text-sm">{isLoading ? 'Processing...' : 'Click to upload .txt or .md file'}</span>
          </button>
        </div>
      )}
    </GlassCard>
  );
}
