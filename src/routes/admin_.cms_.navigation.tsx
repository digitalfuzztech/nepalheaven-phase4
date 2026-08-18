import {
    createFileRoute,
    Link,
    redirect,
} from "@tanstack/react-router";

import {
    Navigation,
    Pencil,
} from "lucide-react";

import {
    AdminShell,
} from "@/components/admin/AdminShell";

import {
    getAdminSessionFn,
} from "@/lib/auth.functions";

import {
    getCmsNavigationMenusFn,
} from "@/lib/cms-navigation.functions";

export const Route =
    createFileRoute(
        "/admin_/cms_/navigation",
    )({
        loader: async () => {
            const admin =
                await getAdminSessionFn();

            if (!admin) {
                throw redirect({
                    to: "/admin",

                    search: {
                        redirect:
                            "/admin/cms/navigation",
                    },
                });
            }

            const menus =
                await getCmsNavigationMenusFn();

            return {
                admin,
                menus,
            };
        },

        component:
        NavigationMenusPage,
    });

function NavigationMenusPage() {
    const {
        menus,
    } = Route.useLoaderData();

    return (
        <AdminShell>
            <div className="p-5 lg:p-8">
                <Link
                    to="/admin/cms"
                    className="text-sm font-semibold text-muted-foreground transition hover:text-[#0c1724]"
                >
                    ← Back to CMS
                </Link>

                <div className="mt-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                        Website Structure
                    </p>

                    <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0c1724]">
                        Navigation
                    </h1>

                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                        Manage the ordered links for
                        Nepal Heaven's primary and
                        footer navigation groups.
                        System menu identities remain
                        controlled by the codebase.
                    </p>
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                    {menus.map(
                        (menu) => (
                            <section
                                key={menu.key}
                                className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0c1724] text-gold">
                                        <Navigation className="h-5 w-5" />
                                    </div>

                                    <div className="text-right">
                                        <p className="text-2xl font-semibold text-[#0c1724]">
                                            {
                                                menu.itemCount
                                            }
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            items
                                        </p>
                                    </div>
                                </div>

                                <h2 className="mt-5 text-lg font-semibold text-[#0c1724]">
                                    {menu.name}
                                </h2>

                                <code className="mt-1 block text-xs text-muted-foreground">
                                    {menu.key}
                                </code>

                                <p className="mt-3 min-h-12 text-sm leading-relaxed text-muted-foreground">
                                    {
                                        menu.description
                                    }
                                </p>

                                <Link
                                    to="/admin/cms/navigation/$key"
                                    params={{
                                        key:
                                        menu.key,
                                    }}
                                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0c1724] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#16283b]"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Edit menu
                                </Link>
                            </section>
                        ),
                    )}
                </div>
            </div>
        </AdminShell>
    );
}