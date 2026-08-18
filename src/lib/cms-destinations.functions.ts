import {
    createServerFn,
} from "@tanstack/react-start";

import {
    cmsDestinationCoreUpdateInputSchema,
    cmsDestinationCreateInputSchema,
    cmsDestinationIdInputSchema,
} from "@/lib/cms-destinations.schema";

export const getCmsDestinationsFn =
    createServerFn({
        method: "GET",
    }).handler(
        async () => {
            const server =
                await import(
                    "@/lib/cms-destinations.server"
                    );

            return server
                .getCmsDestinations();
        },
    );

export const getCmsDestinationByIdFn =
    createServerFn({
        method: "GET",
    })
        .inputValidator(
            cmsDestinationIdInputSchema,
        )
        .handler(
            async ({
                       data,
                   }) => {
                const server =
                    await import(
                        "@/lib/cms-destinations.server"
                        );

                return server
                    .getCmsDestinationById(
                        data.id,
                    );
            },
        );

export const createCmsDestinationFn =
    createServerFn({
        method: "POST",
    })
        .inputValidator(
            cmsDestinationCreateInputSchema,
        )
        .handler(
            async ({
                       data,
                   }) => {
                const server =
                    await import(
                        "@/lib/cms-destinations.server"
                        );

                return server
                    .createCmsDestination(
                        data,
                    );
            },
        );

export const updateCmsDestinationCoreFn =
    createServerFn({
        method: "POST",
    })
        .inputValidator(
            cmsDestinationCoreUpdateInputSchema,
        )
        .handler(
            async ({
                       data,
                   }) => {
                const server =
                    await import(
                        "@/lib/cms-destinations.server"
                        );

                return server
                    .updateCmsDestinationCore(
                        data,
                    );
            },
        );