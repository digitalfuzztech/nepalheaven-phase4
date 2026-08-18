import {
    createServerFn,
} from "@tanstack/react-start";

import { z } from "zod";

import {
    cmsNavigationMenuUpdateSchema,
} from "@/lib/cms-navigation.schema";

export const getCmsNavigationMenusFn =
    createServerFn({
        method: "GET",
    }).handler(async () => {
        const server =
            await import(
                "@/lib/cms-navigation.server"
                );

        return server.getCmsNavigationMenus();
    });

export const getCmsNavigationMenuFn =
    createServerFn({
        method: "GET",
    })
        .validator(
            z.object({
                key: z
                    .string()
                    .trim()
                    .min(1)
                    .max(100),
            }),
        )
        .handler(
            async ({ data }) => {
                const server =
                    await import(
                        "@/lib/cms-navigation.server"
                        );

                return server.getCmsNavigationMenu(
                    data.key,
                );
            },
        );

export const updateCmsNavigationMenuFn =
    createServerFn({
        method: "POST",
    })
        .validator(
            cmsNavigationMenuUpdateSchema,
        )
        .handler(
            async ({ data }) => {
                const server =
                    await import(
                        "@/lib/cms-navigation.server"
                        );

                return server.updateCmsNavigationMenu(
                    data,
                );
            },
        );