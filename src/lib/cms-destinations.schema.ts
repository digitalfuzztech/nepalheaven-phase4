import { z } from "zod";

function nullableText(max: number) {
    return z
        .string()
        .trim()
        .max(max)
        .transform((value) => {
            return value.length > 0 ? value : null;
        });
}

const nullableInteger = z
    .number()
    .int()
    .nullable();

const nullablePercentage = z
    .number()
    .min(
        0,
        "Cancellation fee cannot be below 0%.",
    )
    .max(
        100,
        "Cancellation fee cannot exceed 100%.",
    )
    .nullable()
    .transform((value) => {
        return value === null
            ? null
            : value.toFixed(2);
    });

export const cmsDestinationIdInputSchema =
    z.object({
        id: z.string().uuid(),
    });

export const cmsDestinationSlugSchema = z
    .string()
    .trim()
    .min(
        2,
        "Slug is required.",
    )
    .max(191)
    .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug can contain only lowercase letters, numbers and hyphens.",
    );

export const cmsDestinationCreateInputSchema =
    z.object({
        name: z
            .string()
            .trim()
            .min(
                2,
                "Destination name is required.",
            )
            .max(255),

        slug:
        cmsDestinationSlugSchema,

        region:
            nullableText(255),

        category:
            nullableText(120),

        difficulty:
            nullableText(120),

        duration:
            nullableText(120),

        sortOrder: z
            .number()
            .int()
            .min(
                0,
                "Sort order cannot be negative.",
            ),
    });

export const cmsDestinationCoreUpdateInputSchema =
    z
        .object({
            id:
                z.string().uuid(),

            name: z
                .string()
                .trim()
                .min(
                    2,
                    "Destination name is required.",
                )
                .max(255),

            slug:
            cmsDestinationSlugSchema,

            shortDescription:
                nullableText(1500),

            description:
                nullableText(30000),

            region:
                nullableText(255),

            category:
                nullableText(120),

            difficulty:
                nullableText(120),

            duration:
                nullableText(120),

            bestSeason:
                nullableText(255),

            altitudeLabel:
                nullableText(255),

            minAltitude:
            nullableInteger,

            maxAltitude:
            nullableInteger,

            cancellationFeePercentage:
            nullablePercentage,

            sortOrder: z
                .number()
                .int()
                .min(
                    0,
                    "Sort order cannot be negative.",
                ),
        })
        .superRefine(
            (
                value,
                context,
            ) => {
                if (
                    value.minAltitude !==
                    null &&
                    value.maxAltitude !==
                    null &&
                    value.minAltitude >
                    value.maxAltitude
                ) {
                    context.addIssue({
                        code:
                        z.ZodIssueCode
                            .custom,

                        path: [
                            "maxAltitude",
                        ],

                        message:
                            "Maximum altitude must be greater than or equal to minimum altitude.",
                    });
                }
            },
        );

export type CmsDestinationCreateInput =
    z.infer<
        typeof cmsDestinationCreateInputSchema
    >;

export type CmsDestinationCoreUpdateInput =
    z.infer<
        typeof cmsDestinationCoreUpdateInputSchema
    >;