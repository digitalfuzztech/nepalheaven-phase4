import {
    createFileRoute,
} from "@tanstack/react-router";

export const Route =
    createFileRoute(
        "/media/$",
    )({
        server: {
            handlers: {
                GET: async ({
                                request,
                                params,
                            }) => {
                    const server =
                        await import(
                            "@/lib/cms-media-storage.server"
                            );

                    return server.serveCmsMediaFile(
                        params._splat ??
                        "",
                        request,
                    );
                },

                HEAD: async ({
                                 request,
                                 params,
                             }) => {
                    const server =
                        await import(
                            "@/lib/cms-media-storage.server"
                            );

                    return server.serveCmsMediaFile(
                        params._splat ??
                        "",
                        request,
                        true,
                    );
                },
            },
        },
    });