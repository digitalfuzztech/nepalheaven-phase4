import {
    createFileRoute,
    Link,
    redirect,
} from "@tanstack/react-router";

import {
    Mail,
    Pencil,
    ShieldCheck,
} from "lucide-react";

import {
    AdminShell,
} from "@/components/admin/AdminShell";

import {
    getAdminSessionFn,
} from "@/lib/auth.functions";

import {
    getCmsEmailTemplatesFn,
} from "@/lib/cms-email-templates.functions";

export const Route =
    createFileRoute(
        "/admin_/cms_/email-templates",
    )({
        loader: async () => {
            const admin =
                await getAdminSessionFn();

            if (!admin) {
                throw redirect({
                    to: "/admin",
                    search: {
                        redirect:
                            "/admin/cms/email-templates",
                    },
                });
            }

            const templates =
                await getCmsEmailTemplatesFn();

            return {
                admin,
                templates,
            };
        },

        component:
        EmailTemplatesPage,
    });

function EmailTemplatesPage() {
    const {
        templates,
    } = Route.useLoaderData();

    const activeCount =
        templates.filter(
            (template) =>
                template.status ===
                "active",
        ).length;

    return (
        <AdminShell>
            <div className="p-5 lg:p-8">
                <Link
                    to="/admin/cms"
                    className="text-sm font-semibold text-muted-foreground transition hover:text-[#0c1724]"
                >
                    ← Back to CMS
                </Link>

                <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                            Communications
                        </p>

                        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0c1724]">
                            Email Templates
                        </h1>

                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                            Edit the live transactional
                            email content used by Nepal
                            Heaven registration, leads,
                            bookings, cancellations and
                            account services.
                        </p>
                    </div>

                    <div className="rounded-xl border border-black/10 bg-white px-5 py-3 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                            Templates
                        </p>

                        <p className="mt-1 text-2xl font-semibold text-[#0c1724]">
                            {templates.length}
                        </p>

                        <p className="text-xs text-muted-foreground">
                            {activeCount} active
                        </p>
                    </div>
                </div>

                <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div className="flex gap-3">
                        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />

                        <div>
                            <p className="text-sm font-semibold text-amber-950">
                                These templates are live
                            </p>

                            <p className="mt-1 text-sm leading-relaxed text-amber-800">
                                Saving a template changes
                                the content used the next
                                time that email is sent.
                                Template keys, SMTP routing
                                and recipient routing remain
                                controlled by application
                                code.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid gap-4">
                    {templates.map(
                        (template) => (
                            <section
                                key={
                                    template.key
                                }
                                className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
                            >
                                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                                    <div className="flex min-w-0 gap-4">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0c1724] text-gold">
                                            <Mail className="h-5 w-5" />
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="font-semibold text-[#0c1724]">
                                                    {
                                                        template.name
                                                    }
                                                </h2>

                                                <StatusBadge
                                                    status={
                                                        template.status
                                                    }
                                                />
                                            </div>

                                            <code className="mt-1 block break-all text-xs text-muted-foreground">
                                                {
                                                    template.key
                                                }
                                            </code>

                                            <p className="mt-2 truncate text-sm text-muted-foreground">
                                                Subject:{" "}
                                                {
                                                    template.subjectTemplate
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <Link
                                        to="/admin/cms/email-templates/$key"
                                        params={{
                                            key:
                                            template.key,
                                        }}
                                        className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-[#0c1724] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#16283b]"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                    </Link>
                                </div>
                            </section>
                        ),
                    )}
                </div>
            </div>
        </AdminShell>
    );
}

function StatusBadge({
                         status,
                     }: {
    status:
        | "active"
        | "inactive";
}) {
    return (
        <span
            className={
                status === "active"
                    ? "rounded-full bg-emerald-50 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-emerald-700"
                    : "rounded-full bg-red-50 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-red-700"
            }
        >
      {status}
    </span>
    );
}