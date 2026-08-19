import {
    z,
} from "zod";

const destinationContentItemSchema =
    z
        .string()
        .trim()
        .min(
            1,
            "Content items cannot be empty.",
        )
        .max(
            2000,
            "Content items are too long.",
        );

export const cmsDestinationContentUpdateInputSchema =
    z.object({
        id:
            z
                .string()
                .uuid(),

        highlights:
            z
                .array(
                    destinationContentItemSchema,
                )
                .max(100),

        inclusions:
            z
                .array(
                    destinationContentItemSchema,
                )
                .max(100),

        exclusions:
            z
                .array(
                    destinationContentItemSchema,
                )
                .max(100),

        tips:
            z
                .array(
                    destinationContentItemSchema,
                )
                .max(100),
    });

export type CmsDestinationContentUpdateInput =
    z.infer<
        typeof cmsDestinationContentUpdateInputSchema
    >;