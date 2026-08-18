import {
    createServerFn,
} from "@tanstack/react-start";

import { z } from "zod";

import {
    cmsMediaIdSchema,
    cmsMediaMetadataUpdateSchema,
} from "@/lib/cms-media.schema";

export const getCmsMediaListFn =
    createServerFn({
        method: "GET",
    }).handler(async () => {
        const server =
            await import(
                "@/lib/cms-media.server"
                );

        return server.getCmsMediaList();
    });

export const getCmsMediaFn =
    createServerFn({
        method: "GET",
    })
        .validator(
            z.object({
                id:
                cmsMediaIdSchema,
            }),
        )
        .handler(
            async ({ data }) => {
                const server =
                    await import(
                        "@/lib/cms-media.server"
                        );

                return server.getCmsMedia(
                    data.id,
                );
            },
        );

export const updateCmsMediaMetadataFn =
    createServerFn({
        method: "POST",
    })
        .validator(
            cmsMediaMetadataUpdateSchema,
        )
        .handler(
            async ({ data }) => {
                const server =
                    await import(
                        "@/lib/cms-media.server"
                        );

                return server.updateCmsMediaMetadata(
                    data,
                );
            },
        );

export const uploadCmsMediaFn =
    createServerFn({
        method: "POST",
    })
        .validator(
            (data) => {
                if (
                    !(
                        data instanceof
                        FormData
                    )
                ) {
                    throw new Error(
                        "Expected media upload form data.",
                    );
                }

                return data;
            },
        )
        .handler(
            async ({
                       data,
                   }) => {
                const server =
                    await import(
                        "@/lib/cms-media-upload.server"
                        );

                return server.uploadCmsMedia(
                    data,
                );
            },
        );
export const getCmsSelectableImagesFn =
    createServerFn({
        method: "GET",
    }).handler(async () => {
        const server =
            await import(
                "@/lib/cms-media.server"
                );

        return server.getCmsSelectableImages();
    });