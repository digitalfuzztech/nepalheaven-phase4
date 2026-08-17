import {
    createFileRoute,
    redirect,
} from "@tanstack/react-router";

import { getAdminSessionFn } from "@/lib/auth.functions";
import { BarChart3 } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin_/reports")({
    loader: async () => {
        const admin = await getAdminSessionFn();

        if (!admin) {
            throw redirect({
                to: "/admin",
                search: {
                    redirect: "/admin/reports",
                },
            });
        }

        return admin;
    },

    component: AdminReportsPage,
});

function AdminReportsPage() {
    return (
        <AdminShell>
            <div className="p-5 lg:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                    Analytics
                </p>

                <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0c1724]">
                    Reports
                </h1>

                <div className="mt-8 rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
                    <BarChart3 className="h-6 w-6 text-gold" />

                    <h2 className="mt-5 text-xl font-semibold">
                        Reporting workspace
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        Business, booking, payment and operational reporting
                        will be added in the reporting phase.
                    </p>
                </div>
            </div>
        </AdminShell>
    );
}