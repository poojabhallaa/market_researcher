"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav-items";
import { useRouter } from "next/navigation";
import { X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils"; // see Step 7
import { useProfileStore } from "@/lib/stores/profileStore";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { profile } = useProfileStore();
    const { logOut } = useAuth();

    const handleLogout = async () => {
        await logOut();
        router.replace("/login");
    };

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
                        <Image
                            src="/logo.png"
                            alt="Finanalyst logo"
                            width={28}
                            height={28}
                            className="h-7 w-7 rounded-md object-cover"
                            priority
                        />
                        <span className="text-zinc-50 font-semibold text-sm tracking-tight">
                            Finanalyst
                        </span>
                    </Link>
                    <button
                        onClick={onClose}
                        className="lg:hidden text-zinc-400 hover:text-zinc-50 transition-colors"
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
                <div className="p-4 border-t border-zinc-800/60 space-y-1">
                    <Link
                        href="/dashboard/settings"
                        onClick={onClose}
                        className="flex items-center gap-3 px-2 py-1.5 -mx-1 rounded-lg hover:bg-zinc-800/60 transition-colors"
                    >
                        <Avatar
                            name={profile.name}
                            src={profile.avatar}
                            size={32}
                            className="flex-shrink-0"
                        />
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-100 truncate">
                                {profile.name}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">{profile.plan}</p>
                        </div>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 -mx-1 rounded-lg text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
                    >
                        <LogOut size={16} className="flex-shrink-0 text-zinc-500" />
                        <span className="font-medium">Sign out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}