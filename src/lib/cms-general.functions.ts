import {
    createServerFn,
} from "@tanstack/react-start";

import {
    cmsGeneralSettingsInputSchema,
} from "@/lib/cms-general.schema";

export const getCmsGeneralSettingsFn =
    createServerFn({
        method: "GET",
    }).handler(async () => {
        const server =
            await import(
                "@/lib/cms-general.server"
                );

        return server.getCmsGeneralSettings();
    });

export const updateCmsGeneralSettingsFn =
    createServerFn({
        method: "POST",
    })
        .validator(
            cmsGeneralSettingsInputSchema,
        )
        .handler(
            async ({ data }) => {
                const server =
                    await import(
                        "@/lib/cms-general.server"
                        );

                return server.updateCmsGeneralSettings(
                    data,
                );
            },
        );