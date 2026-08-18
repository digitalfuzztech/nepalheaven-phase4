import {
    createServerFn,
} from "@tanstack/react-start";

import {
    createCmsOtherSettingsOptionSchema,
    deleteCmsOtherSettingsOptionSchema,
    updateCmsOtherSettingsOptionSchema,
} from "@/lib/cms-other-settings.schema";

export const getCmsOtherSettingsOptionsFn =
    createServerFn({
        method:
            "GET",
    }).handler(
        async () => {
            const server =
                await import(
                    "@/lib/cms-other-settings.server"
                    );

            return server
                .getCmsOtherSettingsOptions();
        },
    );

export const createCmsOtherSettingsOptionFn =
    createServerFn({
        method:
            "POST",
    })
        .validator(
            createCmsOtherSettingsOptionSchema,
        )
        .handler(
            async ({
                       data,
                   }) => {
                const server =
                    await import(
                        "@/lib/cms-other-settings.server"
                        );

                return server
                    .createCmsOtherSettingsOption(
                        data,
                    );
            },
        );

export const updateCmsOtherSettingsOptionFn =
    createServerFn({
        method:
            "POST",
    })
        .validator(
            updateCmsOtherSettingsOptionSchema,
        )
        .handler(
            async ({
                       data,
                   }) => {
                const server =
                    await import(
                        "@/lib/cms-other-settings.server"
                        );

                return server
                    .updateCmsOtherSettingsOption(
                        data,
                    );
            },
        );

export const deleteCmsOtherSettingsOptionFn =
    createServerFn({
        method:
            "POST",
    })
        .validator(
            deleteCmsOtherSettingsOptionSchema,
        )
        .handler(
            async ({
                       data,
                   }) => {
                const server =
                    await import(
                        "@/lib/cms-other-settings.server"
                        );

                return server
                    .deleteCmsOtherSettingsOption(
                        data.id,
                    );
            },
        );