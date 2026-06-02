"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav-items";
import { X, Zap } from "lucide-react";
import { cn } from "@/lib/utils"; // see Step 7

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar panel */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-30 h-full w-64 flex flex-col",
                    "bg-zinc-950 border-r border-zinc-800/60",
                    "transition-transform duration-300 ease-in-out",
                    "lg:translate-x-0 lg:static lg:z-auto",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo */}
                <div className="flex items-center justify-between px-5 h-16 border-b border-zinc-800/60">
                    <Link href="/dashboard" className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center">
                            <Zap size={15} className="text-black" strokeWidth={2.5} />
                        </div>
                        <span className="text-white font-semibold text-sm tracking-tight">
                            FinanceAI
                        </span>
                    </Link>
                    <button
                        onClick={onClose}
                        className="lg:hidden text-zinc-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
                    <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                        Main Menu
                    </p>
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group",
                                    isActive
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                                )}
                            >
                                <Icon
                                    size={16}
                                    className={cn(
                                        "flex-shrink-0 transition-colors",
                                        isActive
                                            ? "text-emerald-400"
                                            : "text-zinc-500 group-hover:text-zinc-300"
                                    )}
                                />
                                <span className="font-medium">{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1 h-4 rounded-full bg-emerald-400" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-800/60">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-100 truncate">
                                Alex Morgan
                            </p>
                            <p className="text-xs text-zinc-500 truncate">Pro Plan</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}