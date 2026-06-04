'use client';
import { useState } from 'react';
import { BrainCircuit } from 'lucide-react';
import { AgentSelector } from '@/components/insights/AgentSelector';
import { AgentChat } from '@/components/insights/AgentChat';
import { CompanyAnalysisPanel } from '@/components/insights/CompanyAnalysisPanel';
import type { AgentType } from '@/lib/agents/prompts';

export default function InsightsPage() {
  const [agentType, setAgentType] = useState<AgentType>('financial');

  return (
    <div className="flex flex-col h-full gap-4" style={{ height: 'calc(100vh - 8rem)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <BrainCircuit className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-zinc-100">AI Financial Intelligence</h1>
          <p className="text-xs text-zinc-500">Multi-agent analysis powered by Gemini</p>
        </div>
      </div>

      {/* Agent selector */}
      <div className="shrink-0">
        <AgentSelector value={agentType} onChange={setAgentType} />
      </div>

      {/* Two column layout */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Chat panel */}
        <div className="flex-1 bg-zinc-900 border border-zinc-800/60 rounded-xl overflow-hidden min-h-0">
          <AgentChat agentType={agentType} />
        </div>

        {/* Analysis panel */}
        <div className="w-72 shrink-0 overflow-y-auto">
          <CompanyAnalysisPanel />
        </div>
      </div>
    </div>
  );
}
