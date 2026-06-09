import DashboardShell from "@/components/layout/DashboardShell";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DataSync } from "@/components/providers/DataSync";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RequireAuth>
            <DataSync>
                <QueryProvider>
                    <DashboardShell>{children}</DashboardShell>
                </QueryProvider>
            </DataSync>
        </RequireAuth>
    );
}
