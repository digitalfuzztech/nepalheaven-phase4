import {
    createServerFn,
} from "@tanstack/react-start";

export const getCmsOverviewFn =
    createServerFn({
        method: "GET",
    }).handler(async () => {
        const server =
            await import(
                "@/lib/admin-overview.server"
                );

        return server.getCmsOverview();
    });

export const getAdminDashboardStatsFn =
    createServerFn({
        method: "GET",
    }).handler(async () => {
        const server =
            await import(
                "@/lib/admin-overview.server"
                );

        return server.getAdminDashboardStats();
    });