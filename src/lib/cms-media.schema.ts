import { z } from "zod";

export const cmsMediaIdSchema =
    z.string().uuid(
        "Invalid media ID.",
    );

export const cmsMediaMetadataUpdateSchema =
    z.object({
        id: cmsMediaIdSchema,

        title: z
            .string()
            .trim()
            .max(
                300,
                "Title must be 300 characters or fewer.",
            ),

        altText: z
            .string()
            .trim()
            .max(
                500,
                "Alt text must be 500 characters or fewer.",
            ),

        caption: z
            .string()
            .trim()
            .max(
                2000,
                "Caption must be 2,000 characters or fewer.",
            ),

        category: z
            .string()
            .trim()
            .max(
                100,
                "Category must be 100 characters or fewer.",
            ),
    });

export const cmsMediaUploadMetadataSchema =
    z.object({
        title: z
            .string()
            .trim()
            .max(
                300,
                "Title must be 300 characters or fewer.",
            ),

        altText: z
            .string()
            .trim()
            .max(
                500,
                "Alt text must be 500 characters or fewer.",
            ),

        caption: z
            .string()
            .trim()
            .max(
                2000,
                "Caption must be 2,000 characters or fewer.",
            ),

        category: z
            .string()
            .trim()
            .max(
                100,
                "Category must be 100 characters or fewer.",
            ),
    });

export type CmsMediaUploadMetadata =
    z.infer<
        typeof cmsMediaUploadMetadataSchema
    >;

export type CmsMediaMetadataUpdateInput =
    z.infer<
        typeof cmsMediaMetadataUpdateSchema
    >;