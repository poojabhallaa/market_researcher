'use client';
import { cn } from '@/lib/utils';
import { AGENT_CONFIG } from './AgentBadge';
import type { AgentType } from '@/lib/agents/prompts';

interface AgentSelectorProps {
  value: AgentType;
  onChange: (a: AgentType) => void;
}

const AGENTS = Object.entries(AGENT_CONFIG) as [AgentType, typeof AGENT_CONFIG[AgentType]][];

export function AgentSelector({ value, onChange }: AgentSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {AGENTS.map(([type, cfg]) => {
        const Icon = cfg.icon;
        const isActive = value === type;
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-150',
              isActive
                ? cfg.color
                : 'border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700/60'
            )}
          >
            <Icon className="w-4 h-4" />
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}
