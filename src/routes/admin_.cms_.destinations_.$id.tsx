import {
    createFileRoute,
    redirect,
} from "@tanstack/react-router";

import {
    AdminShell,
} from "@/components/admin/AdminShell";

import {
    CmsDestinationEditor,
} from "@/components/admin/CmsDestinationEditor";

import {
    getAdminSessionFn,
} from "@/lib/auth.functions";

import {
    getCmsDestinationByIdFn,
} from "@/lib/cms-destinations.functions";

import {
    getCmsOtherSettingsOptionsFn,
} from "@/lib/cms-other-settings.functions";

export const Route =
    createFileRoute(
        "/admin_/cms_/destinations_/$id",
    )({
        loader: async ({
                           params,
                       }) => {
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

            const [
                detail,
                options,
            ] =
                await Promise.all([
                    getCmsDestinationByIdFn({
                        data: {
                            id:
                            params.id,
                        },
                    }),

                    getCmsOtherSettingsOptionsFn(),
                ]);

            if (
                !detail
            ) {
                throw redirect({
                    to:
                        "/admin/cms/destinations",
                });
            }

            return {
                detail,
                options,
            };
        },

        component:
        AdminCmsDestinationEditorPage,
    });

function AdminCmsDestinationEditorPage() {
    const {
        detail,
        options,
    } =
        Route.useLoaderData();

    return (
        <AdminShell>
            <div className="p-5 sm:p-7 lg:p-8">
                <CmsDestinationEditor
                    detail={
                        detail
                    }
                    options={
                        options
                    }
                />
            </div>
        </AdminShell>
    );
}