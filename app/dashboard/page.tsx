"use client";
import Link from "next/link";
import {
    TrendingUp, TrendingDown, BrainCircuit,
    ArrowUpRight, ArrowDownRight, Zap, Activity,
    BarChart3, Shield,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useQuote } from "@/lib/hooks/useQuote";
import { usePortfolioStore } from "@/lib/stores/portfolioStore";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { GlassCard } from "@/components/ui/GlassCard";
import { LiveDot } from "@/components/ui/LiveDot";

const SIGNAL_TICKERS = ["AAPL", "TSLA", "NVDA", "AMZN"];

const AI_SIGNALS = [
    { asset: "AAPL", signal: "Strong Buy", confidence: 92, type: "up", note: "Momentum breakout detected" },
    { asset: "TSLA", signal: "Hold", confidence: 67, type: "neutral", note: "Consolidation phase" },
    { asset: "NVDA", signal: "Buy", confidence: 88, type: "up", note: "AI tailwinds + earnings beat" },
    { asset: "AMZN", signal: "Sell", confidence: 74, type: "down", note: "Bearish divergence on MACD" },
];

const ALLOCATION_DATA = [
    { name: "US Equities", percent: 42, fill: "#34d399" },
    { name: "Crypto", percent: 28, fill: "#22d3ee" },
    { name: "International", percent: 18, fill: "#a78bfa" },
    { name: "Bonds & Cash", percent: 12, fill: "#52525b" },
];

function QuotePrice({ symbol }: { symbol: string }) {
    const { data: quote } = useQuote(symbol);
    if (!quote || typeof quote.price !== 'number') return <span className="text-zinc-600 text-xs">—</span>;
    const isUp = (quote.changePercent ?? 0) >= 0;
    return (
        <div className="text-right">
            <span className="text-sm font-semibold text-zinc-200">${quote.price.toFixed(2)}</span>
            <span className={`ml-1.5 text-[10px] font-medium ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                {isUp ? "+" : ""}{(quote.changePercent ?? 0).toFixed(2)}%
            </span>
        </div>
    );
}

function PortfolioKPI() {
    const { holdings } = usePortfolioStore();
    const { data: q1 } = useQuote("AAPL");

    const totalCost = holdings.reduce((s, h) => s + h.avgCost * h.quantity, 0);
    const portfolioValue = totalCost > 0 ? totalCost : 284930;

    return (
        <GlassCard className="p-5">
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Portfolio Value</p>
            <div className="mt-2 mb-1 flex items-baseline gap-2">
                <AnimatedNumber value={portfolioValue} prefix="$" decimals={0} className="text-2xl font-semibold text-zinc-100" />
            </div>
            <div className="flex items-center gap-1">
                <ArrowUpRight size={13} className="text-emerald-400" />
                <p className="text-xs font-medium text-emerald-400">
                    {holdings.length > 0 ? `${holdings.length} positions` : "+$1,240 today"}
                </p>
            </div>
        </GlassCard>
    );
}

export default function DashboardPage() {
    const { transactions } = usePortfolioStore();

    const recentTx = transactions.slice(0, 4);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-100">Overview</h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Welcome back. Here&apos;s your financial snapshot.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <LiveDot />
                    <span className="text-xs text-emerald-400 font-medium">Markets Open</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <PortfolioKPI />

                <GlassCard className="p-5">
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Today&apos;s P&amp;L</p>
                    <p className="text-2xl font-semibold text-zinc-100 mt-2 mb-1">
                        <AnimatedNumber value={1240} prefix="+$" decimals={0} />
                    </p>
                    <div className="flex items-center gap-1">
                        <ArrowUpRight size={13} className="text-emerald-400" />
                        <p className="text-xs font-medium text-emerald-400">+0.44% today</p>
                    </div>
                </GlassCard>

                <GlassCard className="p-5">
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">AI Signals</p>
                    <p className="text-2xl font-semibold text-zinc-100 mt-2 mb-1">
                        <AnimatedNumber value={12} prefix="" suffix=" Active" decimals={0} />
                    </p>
                    <div className="flex items-center gap-1">
                        <BrainCircuit size={13} className="text-emerald-400" />
                        <p className="text-xs font-medium text-emerald-400">4 new today</p>
                    </div>
                </GlassCard>

                <GlassCard className="p-5">
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Risk Score</p>
                    <p className="text-2xl font-semibold text-zinc-100 mt-2 mb-1">Medium</p>
                    <div className="flex items-center gap-1">
                        <Shield size={13} className="text-amber-400" />
                        <p className="text-xs font-medium text-amber-400">Stable</p>
                    </div>
                </GlassCard>
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* AI Signals */}
                <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800/60 rounded-xl">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
                        <div className="flex items-center gap-2">
                            <BrainCircuit size={16} className="text-emerald-400" />
                            <h2 className="text-sm font-semibold text-zinc-100">AI Signals</h2>
                        </div>
                        <Link href="/dashboard/insights" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                            Open AI Chat →
                        </Link>
                    </div>
                    <div className="divide-y divide-zinc-800/60">
                        {AI_SIGNALS.map((s) => (
                            <div key={s.asset} className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800/30 transition-colors">
                                <div className="w-14">
                                    <span className="text-sm font-semibold text-zinc-100">{s.asset}</span>
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    s.type === "up" ? "bg-emerald-500/10 text-emerald-400" :
                                    s.type === "down" ? "bg-red-500/10 text-red-400" :
                                    "bg-zinc-700/40 text-zinc-400"
                                }`}>
                                    {s.signal}
                                </span>
                                <span className="text-xs text-zinc-500 flex-1 hidden sm:block">{s.note}</span>
                                <QuotePrice symbol={s.asset} />
                                <div className="flex items-center gap-2 ml-2">
                                    <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${
                                            s.type === "up" ? "bg-emerald-400" :
                                            s.type === "down" ? "bg-red-400" : "bg-zinc-500"
                                        }`} style={{ width: `${s.confidence}%` }} />
                                    </div>
                                    <span className="text-xs text-zinc-400 w-8 text-right">{s.confidence}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Portfolio Allocation */}
                <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-zinc-800/60">
                        <Activity size={16} className="text-emerald-400" />
                        <h2 className="text-sm font-semibold text-zinc-100">Allocation</h2>
                    </div>
                    <div className="p-5">
                        <ResponsiveContainer width="100%" height={140}>
                            <PieChart>
                                <Pie
                                    data={ALLOCATION_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={42}
                                    outerRadius={62}
                                    dataKey="percent"
                                    paddingAngle={2}
                                >
                                    {ALLOCATION_DATA.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} stroke="transparent" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(v) => [`${v}%`, '']}
                                    contentStyle={{ background: '#18181b', border: '1px solid rgba(63,63,70,0.6)', borderRadius: '8px', fontSize: '12px' }}
                                    itemStyle={{ color: '#d4d4d8' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2 mt-2">
                            {ALLOCATION_DATA.map((item) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full" style={{ background: item.fill }} />
                                        <span className="text-xs text-zinc-400">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-zinc-200">{item.percent}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/dashboard/markets">
                    <GlassCard className="p-4 hover:cursor-pointer" glowColor="emerald">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-zinc-100">Live Markets</p>
                                <p className="text-xs text-zinc-500">Real-time prices & charts</p>
                            </div>
                        </div>
                    </GlassCard>
                </Link>
                <Link href="/dashboard/insights">
                    <GlassCard className="p-4 hover:cursor-pointer" glowColor="cyan">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                <BrainCircuit className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-zinc-100">AI Insights</p>
                                <p className="text-xs text-zinc-500">Multi-agent analysis</p>
                            </div>
                        </div>
                    </GlassCard>
                </Link>
                <Link href="/dashboard/portfolio">
                    <GlassCard className="p-4 hover:cursor-pointer" glowColor="violet">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                <BarChart3 className="w-4 h-4 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-zinc-100">Portfolio</p>
                                <p className="text-xs text-zinc-500">Track your holdings</p>
                            </div>
                        </div>
                    </GlassCard>
                </Link>
            </div>

            {/* Recent Transactions */}
            <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
                    <div className="flex items-center gap-2">
                        <Zap size={16} className="text-emerald-400" />
                        <h2 className="text-sm font-semibold text-zinc-100">Recent Transactions</h2>
                    </div>
                    <Link href="/dashboard/portfolio" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                        View all →
                    </Link>
                </div>
                <div className="divide-y divide-zinc-800/60">
                    {recentTx.length > 0 ? recentTx.map((tx) => {
                        const isUp = tx.type === 'buy';
                        return (
                            <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800/30 transition-colors">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                                    {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-zinc-100 truncate">{tx.name}</p>
                                    <p className="text-xs text-zinc-500">{tx.date}</p>
                                </div>
                                <span className={`hidden sm:inline text-xs font-medium px-2 py-0.5 rounded-full ${isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                                    {tx.type}
                                </span>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-zinc-100">${(tx.price * tx.quantity).toFixed(0)}</p>
                                    <p className="text-xs text-zinc-500">{tx.quantity} shares</p>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="px-5 py-8 text-center">
                            <p className="text-sm text-zinc-500 mb-2">No transactions yet</p>
                            <Link href="/dashboard/portfolio" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
                                Add your first holding →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
