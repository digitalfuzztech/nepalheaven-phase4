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

export const Route = createFileRoute(
    "/admin_/cms_/destinations_/new",
)({
    loader: async () => {
        const admin =
            await getAdminSessionFn();

        if (!admin) {
            throw redirect({
                to: "/admin",
            });
        }

        return {
            admin,
        };
    },

    component:
    AdminCmsDestinationCreatePage,
});

function AdminCmsDestinationCreatePage() {
    return (
        <AdminShell>
            <div className="p-5 sm:p-7 lg:p-8">
                <CmsDestinationCreateForm />
            </div>
        </AdminShell>
    );
}