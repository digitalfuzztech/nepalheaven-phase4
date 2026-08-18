import {
    createServerFn,
} from "@tanstack/react-start";

import {
    cmsFooterSettingsInputSchema,
} from "@/lib/cms-footer.schema";

export const getCmsFooterSettingsFn =
    createServerFn({
        method: "GET",
    }).handler(async () => {
        const server =
            await import(
                "@/lib/cms-footer.server"
                );

        return server.getCmsFooterSettings();
    });

export const updateCmsFooterSettingsFn =
    createServerFn({
        method: "POST",
    })
        .validator(
            cmsFooterSettingsInputSchema,
        )
        .handler(
            async ({ data }) => {
                const server =
                    await import(
                        "@/lib/cms-footer.server"
                        );

                return server.updateCmsFooterSettings(
                    data,
                );
            },
        );