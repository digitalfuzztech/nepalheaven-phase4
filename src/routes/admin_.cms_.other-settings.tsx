import {
    createFileRoute,
    Link,
    redirect,
} from "@tanstack/react-router";

import {
    AdminShell,
} from "@/components/admin/AdminShell";

import {
    CmsOtherSettingsManager,
} from "@/components/admin/CmsOtherSettingsManager";

import {
    getAdminSessionFn,
} from "@/lib/auth.functions";

import {
    getCmsOtherSettingsOptionsFn,
} from "@/lib/cms-other-settings.functions";

export const Route =
    createFileRoute(
        "/admin_/cms_/other-settings",
    )({
        loader: async () => {
            const admin =
                await getAdminSessionFn();

            if (!admin) {
                throw redirect({
                    to:
                        "/admin",

                    search: {
                        redirect:
                            "/admin/cms/other-settings",
                    },
                });
            }

            const options =
                await getCmsOtherSettingsOptionsFn();

            return {
                admin,
                options,
            };
        },

        component:
        AdminCmsOtherSettingsPage,
    });

function AdminCmsOtherSettingsPage() {
    const {
        options,
    } =
        Route.useLoaderData();

    return (
        <AdminShell>
            <div className="p-5 lg:p-8">
                <div>
                    <Link
                        to="/admin/cms"
                        className="text-sm font-semibold text-muted-foreground transition hover:text-[#0c1724]"
                    >
                        ← Back to CMS
                    </Link>

                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-gold">
                        CMS Configuration
                    </p>

                    <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0c1724]">
                        Other Settings
                    </h1>

                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                        Manage reusable
                        category, difficulty
                        and content-type
                        options used by
                        Nepal Heaven CMS
                        editors.
                    </p>
                </div>

                <div className="mt-8">
                    <CmsOtherSettingsManager
                        options={
                            options
                        }
                    />
                </div>
            </div>
        </AdminShell>
    );
}