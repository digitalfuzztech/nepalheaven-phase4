import {
    z,
} from "zod";

import {
    cmsMediaIdSchema,
} from "@/lib/cms-media.schema";

export const cmsDestinationListingPageInputSchema =
    z.object({
        heroMediaId:
            cmsMediaIdSchema
                .nullable(),

        subtitle:
            z
                .string()
                .trim()
                .min(
                    1,
                    "Hero subtitle is required.",
                )
                .max(
                    180,
                    "Hero subtitle is too long.",
                ),

        title:
            z
                .string()
                .trim()
                .min(
                    1,
                    "Hero title is required.",
                )
                .max(
                    240,
                    "Hero title is too long.",
                ),

        description:
            z
                .string()
                .trim()
                .min(
                    1,
                    "Hero description is required.",
                )
                .max(
                    1000,
                    "Hero description is too long.",
                ),

        searchTitle:
            z
                .string()
                .trim()
                .min(
                    1,
                    "Search form title is required.",
                )
                .max(
                    120,
                ),

        searchPlaceholder:
            z
                .string()
                .trim()
                .min(
                    1,
                    "Search placeholder is required.",
                )
                .max(
                    180,
                ),
    });

export type CmsDestinationListingPageInput =
    z.infer<
        typeof cmsDestinationListingPageInputSchema
    >;