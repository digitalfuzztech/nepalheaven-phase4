import {
    createFileRoute,
    redirect,
} from "@tanstack/react-router";

import { getAdminSessionFn } from "@/lib/auth.functions";
import { Settings } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin_/settings")({
    loader: async () => {
        const admin = await getAdminSessionFn();

        if (!admin) {
            throw redirect({
                to: "/admin",
                search: {
                    redirect: "/admin/settings",
                },
            });
        }

        return admin;
    },

    component: AdminSettingsPage,
});

function AdminSettingsPage() {
    return (
        <AdminShell>
            <div className="p-5 lg:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                    Administration
                </p>

                <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0c1724]">
                    Settings
                </h1>

                <div className="mt-8 rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
                    <Settings className="h-6 w-6 text-gold" />

                    <h2 className="mt-5 text-xl font-semibold">
                        Platform settings
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        Administrator and application-level configuration
                        will live here. Website content settings belong in
                        the CMS, not this workspace.
                    </p>
                </div>
            </div>
        </AdminShell>
    );
}