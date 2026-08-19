import { z } from "zod";

function nullableText(
    max: number,
) {
    return z
        .string()
        .trim()
        .max(max)
        .transform(
            (value) =>
                value.length
                    ? value
                    : null,
        );
}

const nullableInteger =
    z
        .number()
        .int()
        .nullable();

const nullablePositiveInteger =
    z
        .number()
        .int()
        .min(1)
        .nullable();

const nullableUuid =
    z
        .string()
        .uuid()
        .nullable();

export const cmsDestinationIdInputSchema =
    z.object({
        id:
            z
                .string()
                .uuid(),
    });

export const cmsDestinationSlugSchema =
    z
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

export const cmsDestinationBestSeasonSchema =
    z.object({
        fromMonth:
            z
                .number()
                .int()
                .min(1)
                .max(12),

        toMonth:
            z
                .number()
                .int()
                .min(1)
                .max(12),
    });

const destinationStructuredFields =
    z.object({
        name:
            z
                .string()
                .trim()
                .min(
                    2,
                    "Destination title is required.",
                )
                .max(255),

        slug:
        cmsDestinationSlugSchema,

        region:
            nullableText(255),

        subtitle:
            nullableText(1500),

        destinationTypeOptionId:
        nullableUuid,

        difficultyOptionId:
        nullableUuid,

        minAltitude:
        nullableInteger,

        maxAltitude:
        nullableInteger,

        durationMinDays:
        nullablePositiveInteger,

        durationMaxDays:
        nullablePositiveInteger,

        overview:
            nullableText(30000),

        sortOrder:
            z
                .number()
                .int()
                .min(
                    0,
                    "Sort order cannot be negative.",
                ),
    });

function refineDestinationRanges<
    T extends {
        minAltitude:
            number | null;

        maxAltitude:
            number | null;

        durationMinDays:
            number | null;

        durationMaxDays:
            number | null;
    },
>(
    value: T,
    context:
    z.RefinementCtx,
) {
    const oneAltitudeMissing =
        (
            value.minAltitude ===
            null
        ) !==
        (
            value.maxAltitude ===
            null
        );

    if (
        oneAltitudeMissing
    ) {
        context.addIssue({
            code:
            z.ZodIssueCode.custom,

            path: [
                "maxAltitude",
            ],

            message:
                "Enter both minimum and maximum altitude, or leave both empty.",
        });
    }

    if (
        value.minAltitude !==
        null &&
        value.maxAltitude !==
        null &&
        value.maxAltitude <
        value.minAltitude
    ) {
        context.addIssue({
            code:
            z.ZodIssueCode.custom,

            path: [
                "maxAltitude",
            ],

            message:
                "Maximum altitude cannot be lower than minimum altitude.",
        });
    }

    const oneDurationMissing =
        (
            value.durationMinDays ===
            null
        ) !==
        (
            value.durationMaxDays ===
            null
        );

    if (
        oneDurationMissing
    ) {
        context.addIssue({
            code:
            z.ZodIssueCode.custom,

            path: [
                "durationMaxDays",
            ],

            message:
                "Enter both minimum and maximum duration.",
        });
    }

    if (
        value.durationMinDays !==
        null &&
        value.durationMaxDays !==
        null &&
        value.durationMaxDays <
        value.durationMinDays
    ) {
        context.addIssue({
            code:
            z.ZodIssueCode.custom,

            path: [
                "durationMaxDays",
            ],

            message:
                "Maximum duration cannot be lower than minimum duration.",
        });
    }
}

/*
|--------------------------------------------------------------------------
| Create
|--------------------------------------------------------------------------
*/

export const cmsDestinationCreateInputSchema =
    destinationStructuredFields
        .extend({
            bestSeasons:
                z
                    .array(
                        cmsDestinationBestSeasonSchema,
                    )
                    .max(
                        12,
                        "Too many best-season ranges.",
                    ),
        })
        .superRefine(
            refineDestinationRanges,
        );

/*
|--------------------------------------------------------------------------
| Edit core
|--------------------------------------------------------------------------
|
| replaceBestSeasons=false protects old existing destinations that still
| only have their legacy bestSeason text.
|
*/

export const cmsDestinationCoreUpdateInputSchema =
    destinationStructuredFields
        .extend({
            id:
                z
                    .string()
                    .uuid(),

            bestSeasons:
                z
                    .array(
                        cmsDestinationBestSeasonSchema,
                    )
                    .max(
                        12,
                        "Too many best-season ranges.",
                    ),

            replaceBestSeasons:
                z.boolean(),
        })
        .superRefine(
            refineDestinationRanges,
        );

export type CmsDestinationCreateInput =
    z.infer<
        typeof cmsDestinationCreateInputSchema
    >;

export type CmsDestinationCoreUpdateInput =
    z.infer<
        typeof cmsDestinationCoreUpdateInputSchema
    >;

export type CmsDestinationBestSeasonInput =
    z.infer<
        typeof cmsDestinationBestSeasonSchema
    >;