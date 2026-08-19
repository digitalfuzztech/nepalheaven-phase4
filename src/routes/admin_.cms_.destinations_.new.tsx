import {
    createFileRoute,
    redirect,
} from "@tanstack/react-router";

import {
    AdminShell,
} from "@/components/admin/AdminShell";

import {
    CmsDestinationCreateForm,
} from "@/components/admin/CmsDestinationCreateForm";

import {
    getAdminSessionFn,
} from "@/lib/auth.functions";

import {
    getCmsOtherSettingsOptionsFn,
} from "@/lib/cms-other-settings.functions";

export const Route =
    createFileRoute(
        "/admin_/cms_/destinations_/new",
    )({
        loader: async () => {
            const admin =
                await getAdminSessionFn();

            if (
                !admin
            ) {
                throw redirect({
                    to:
                        "/admin",
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
        AdminCmsDestinationCreatePage,
    });

function AdminCmsDestinationCreatePage() {
    const {
        options,
    } =
        Route.useLoaderData();

    return (
        <AdminShell>
            <div className="p-5 sm:p-7 lg:p-8">
                <CmsDestinationCreateForm
                    options={
                        options
                    }
                />
            </div>
        </AdminShell>
    );
}