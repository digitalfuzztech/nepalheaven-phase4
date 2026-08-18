import {
    createFileRoute,
    Link,
    redirect,
} from "@tanstack/react-router";

import {
    BookOpen,
    Inbox,
    Settings,
    Users,
    WalletCards,
} from "lucide-react";

import {
    AdminShell,
} from "@/components/admin/AdminShell";

import {
    getAdminSessionFn,
} from "@/lib/auth.functions";

import {
    getAdminDashboardStatsFn,
} from "@/lib/admin-overview.functions";

export const Route =
    createFileRoute(
        "/admin_/dashboard",
    )({
        loader: async () => {
            const admin =
                await getAdminSessionFn();

            if (!admin) {
                throw redirect({
                    to: "/admin",
                    search: {
                        redirect:
                            "/admin/dashboard",
                    },
                });
            }

            const stats =
                await getAdminDashboardStatsFn();

            return {
                admin,
                stats,
            };
        },

        component:
        AdminDashboardPage,
    });

function AdminDashboardPage() {
    const {
        stats,
    } = Route.useLoaderData();

    return (
        <AdminShell>
            <div className="p-5 lg:p-8">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                        Administration
                    </p>

                    <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0c1724]">
                        Admin Dashboard
                    </h1>

                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                        Manage Nepal Heaven website
                        content, travellers, bookings,
                        reports and platform
                        configuration from this
                        workspace.
                    </p>
                </div>

                <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Bookings"
                        value={stats.bookings}
                        icon={WalletCards}
                    />

                    <StatCard
                        title="Customers"
                        value={stats.customers}
                        icon={Users}
                    />

                    <StatCard
                        title="New leads"
                        value={stats.newLeads}
                        icon={Inbox}
                    />

                    <StatCard
                        title="Published content"
                        value={
                            stats.publishedContent
                        }
                        icon={BookOpen}
                    />
                </div>

                <div className="mt-8 grid gap-6 xl:grid-cols-2">
                    <WorkspaceCard
                        title="Website CMS"
                        description="Manage destinations, packages, experiences, website pages, blog content, media, FAQs, testimonials and email templates."
                        to="/admin/cms"
                        button="Open CMS"
                        icon={BookOpen}
                    />

                    <WorkspaceCard
                        title="Customer CRM"
                        description="Bookings, customers, enquiries, payments and communication will be managed from the CRM workspace."
                        to="/admin/crm"
                        button="Open CRM"
                        icon={Users}
                    />
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <WorkspaceCard
                        title="Reports"
                        description="Business, booking, payment and operational reporting."
                        to="/admin/reports"
                        button="Open Reports"
                        icon={WalletCards}
                    />

                    <WorkspaceCard
                        title="Settings"
                        description="Administration and platform-level configuration."
                        to="/admin/settings"
                        button="Open Settings"
                        icon={Settings}
                    />
                </div>
            </div>
        </AdminShell>
    );
}

function StatCard({
                      title,
                      value,
                      icon: Icon,
                  }: {
    title: string;
    value: number;
    icon: typeof WalletCards;
}) {
    return (
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <Icon className="h-5 w-5 text-gold" />

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {title}
            </p>

            <p className="mt-2 text-3xl font-semibold text-[#0c1724]">
                {value.toLocaleString()}
            </p>
        </section>
    );
}

function WorkspaceCard({
                           title,
                           description,
                           to,
                           button,
                           icon: Icon,
                       }: {
    title: string;
    description: string;

    to:
        | "/admin/cms"
        | "/admin/crm"
        | "/admin/reports"
        | "/admin/settings";

    button: string;

    icon: typeof BookOpen;
}) {
    return (
        <section className="rounded-2xl border border-black/10 bg-white p-7 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0c1724] text-gold">
                <Icon className="h-5 w-5" />
            </div>

            <h2 className="mt-6 text-xl font-semibold text-[#0c1724]">
                {title}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {description}
            </p>

            <Link
                to={to}
                className="mt-6 inline-flex rounded-full bg-[#0c1724] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16283b]"
            >
                {button}
            </Link>
        </section>
    );
}