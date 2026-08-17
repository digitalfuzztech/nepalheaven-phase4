import {
    createFileRoute,
    redirect,
} from "@tanstack/react-router";

import { getAdminSessionFn } from "@/lib/auth.functions";
import { Users } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin_/crm")({
    loader: async () => {
        const admin = await getAdminSessionFn();

        if (!admin) {
            throw redirect({
                to: "/admin",
                search: {
                    redirect: "/admin/crm",
                },
            });
        }

        return admin;
    },

    component: AdminCrmPage,
});

function AdminCrmPage() {
    return (
        <AdminShell>
            <div className="p-5 lg:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                    Customer operations
                </p>

                <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0c1724]">
                    CRM
                </h1>

                <div className="mt-8 rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
                    <Users className="h-6 w-6 text-gold" />

                    <h2 className="mt-5 text-xl font-semibold">
                        CRM workspace
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        Leads, customers, enquiries, bookings, payments and
                        communication management will live here. Existing
                        confirmed and cancelled booking detail routes remain
                        unchanged.
                    </p>
                </div>
            </div>
        </AdminShell>
    );
}