import {
    LayoutDashboard,
    TrendingUp,
    PieChart,
    Wallet,
    Bell,
    Settings,
    BrainCircuit,
    FileBarChart,
    ShieldCheck,
} from "lucide-react";

export const NAV_ITEMS = [
    {
        label: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "AI Insights",
        href: "/dashboard/insights",
        icon: BrainCircuit,
    },
    {
        label: "Portfolio",
        href: "/dashboard/portfolio",
        icon: PieChart,
    },
    {
        label: "Markets",
        href: "/dashboard/markets",
        icon: TrendingUp,
    },
    {
        label: "Transactions",
        href: "/dashboard/transactions",
        icon: Wallet,
    },
    {
        label: "Reports",
        href: "/dashboard/reports",
        icon: FileBarChart,
    },
    {
        label: "Risk Analysis",
        href: "/dashboard/risk",
        icon: ShieldCheck,
    },
    {
        label: "Alerts",
        href: "/dashboard/alerts",
        icon: Bell,
    },
    {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
];