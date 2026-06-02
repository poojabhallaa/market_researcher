import { BrainCircuit, Newspaper, TrendingUp, Crosshair } from 'lucide-react';
import type { AgentType } from '@/lib/agents/prompts';

const AGENT_CONFIG = {
  financial: { label: 'Financial Analysis', icon: BrainCircuit, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  sentiment: { label: 'News Sentiment', icon: Newspaper, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  forecasting: { label: 'Forecasting', icon: TrendingUp, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  strategy: { label: 'Strategy', icon: Crosshair, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
} as const;

export function AgentBadge({ agentType }: { agentType: AgentType }) {
  const cfg = AGENT_CONFIG[agentType];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

export { AGENT_CONFIG };
