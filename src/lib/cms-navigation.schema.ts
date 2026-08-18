import { z } from "zod";

export const cmsNavigationLinkTypeSchema =
    z.enum([
        "internal",
        "external",
    ]);

function isHttpUrl(
    value: string,
) {
    try {
        const url = new URL(value);

        return (
            url.protocol === "http:" ||
            url.protocol === "https:"
        );
    } catch {
        return false;
    }
}

export const cmsNavigationItemInputSchema =
    z
        .object({
            label: z
                .string()
                .trim()
                .min(
                    1,
                    "Navigation label is required.",
                )
                .max(180),

            linkType:
            cmsNavigationLinkTypeSchema,

            path: z
                .string()
                .trim()
                .max(500),

            url: z
                .string()
                .trim()
                .max(2000),

            enabled:
                z.boolean(),

            openNewTab:
                z.boolean(),
        })
        .superRefine(
            (
                item,
                context,
            ) => {
                if (
                    item.linkType ===
                    "internal"
                ) {
                    if (!item.path) {
                        context.addIssue({
                            code:
                            z.ZodIssueCode.custom,

                            path: ["path"],

                            message:
                                "Internal path is required.",
                        });

                        return;
                    }

                    if (
                        !item.path.startsWith(
                            "/",
                        )
                    ) {
                        context.addIssue({
                            code:
                            z.ZodIssueCode.custom,

                            path: ["path"],

                            message:
                                "Internal links must begin with /.",
                        });
                    }
                }

                if (
                    item.linkType ===
                    "external"
                ) {
                    if (!item.url) {
                        context.addIssue({
                            code:
                            z.ZodIssueCode.custom,

                            path: ["url"],

                            message:
                                "External URL is required.",
                        });

                        return;
                    }

                    if (
                        !isHttpUrl(
                            item.url,
                        )
                    ) {
                        context.addIssue({
                            code:
                            z.ZodIssueCode.custom,

                            path: ["url"],

                            message:
                                "External links must use a valid http:// or https:// URL.",
                        });
                    }
                }
            },
        );

export const cmsNavigationMenuUpdateSchema =
    z.object({
        key: z
            .string()
            .trim()
            .min(1)
            .max(100)
            .regex(
                /^[a-z0-9_]+$/,
                "Invalid navigation menu key.",
            ),

        items: z
            .array(
                cmsNavigationItemInputSchema,
            )
            .max(
                50,
                "A menu may contain a maximum of 50 items.",
            ),
    });

export type CmsNavigationItemInput =
    z.infer<
        typeof cmsNavigationItemInputSchema
    >;

export type CmsNavigationMenuUpdateInput =
    z.infer<
        typeof cmsNavigationMenuUpdateSchema
    >;