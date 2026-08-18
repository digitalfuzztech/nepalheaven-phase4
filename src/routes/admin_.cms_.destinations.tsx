import {
    createFileRoute,
    redirect,
} from "@tanstack/react-router";

import {
    AdminShell,
} from "@/components/admin/AdminShell";

import {
    CmsDestinationsList,
} from "@/components/admin/CmsDestinationsList";

import {
    getAdminSessionFn,
} from "@/lib/auth.functions";

import {
    getCmsDestinationsFn,
} from "@/lib/cms-destinations.functions";

export const Route = createFileRoute(
    "/admin_/cms_/destinations",
)({
    loader: async () => {
        const admin =
            await getAdminSessionFn();

        if (!admin) {
            throw redirect({
                to: "/admin",
            });
        }

        const destinations =
            await getCmsDestinationsFn();

        return {
            destinations,
        };
    },

    component:
    AdminCmsDestinationsPage,
});

function AdminCmsDestinationsPage() {
    const {
        destinations,
    } = Route.useLoaderData();

    return (
        <AdminShell>
            <div className="p-5 sm:p-7 lg:p-8">
                <CmsDestinationsList
                    destinations={
                        destinations
                    }
                />
            </div>
        </AdminShell>
    );
}