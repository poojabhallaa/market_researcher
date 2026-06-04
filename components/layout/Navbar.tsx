"use client";
import Link from "next/link";
import { Menu, Search, Bell } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";
import { useProfileStore } from "@/lib/stores/profileStore";
import { useAlertsStore } from "@/lib/stores/alertsStore";

interface NavbarProps {
    onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const { profile } = useProfileStore();
    const activeAlerts = useAlertsStore((s) =>
        s.alerts.filter((a) => a.active).length
    );
    return (
        <header className="h-16 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10 flex items-center px-4 gap-4">
            {/* Mobile hamburger */}
            <button
                onClick={onMenuClick}
                className="lg:hidden text-zinc-400 hover:text-white transition-colors p-1"
            >
                <Menu size={20} />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <input
                        type="text"
                        placeholder="Search assets, reports..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    />
                </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
                {/* Notifications */}
                <Link
                    href="/dashboard/alerts"
                    className="relative p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition-colors"
                >
                    <Bell size={18} />
                    {activeAlerts > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    )}
                </Link>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Avatar */}
                <Link href="/dashboard/settings" aria-label="Profile settings">
                    <Avatar
                        name={profile.name}
                        src={profile.avatar}
                        size={32}
                        className="cursor-pointer ring-1 ring-zinc-800 hover:ring-emerald-500/40 transition-all"
                    />
                </Link>
            </div>
        </header>
    );
}