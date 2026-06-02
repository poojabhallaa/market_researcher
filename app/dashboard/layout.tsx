import DashboardShell from "@/components/layout/DashboardShell";
import { QueryProvider } from "@/components/providers/QueryProvider";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <QueryProvider>
            <DashboardShell>{children}</DashboardShell>
        </QueryProvider>
    );
}