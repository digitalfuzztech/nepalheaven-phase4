import {
    z,
} from "zod";

export const cmsDestinationItineraryItemSchema =
    z.object({
        dayNo:
            z
                .number()
                .int()
                .min(
                    1,
                    "Day No. must be at least 1.",
                )
                .max(
                    999,
                    "Day No. is too large.",
                ),

        title:
            z
                .string()
                .trim()
                .min(
                    1,
                    "Itinerary title is required.",
                )
                .max(
                    500,
                    "Itinerary title is too long.",
                ),

        description:
            z
                .string()
                .trim()
                .max(
                    5000,
                    "Itinerary description is too long.",
                ),
    });

export const cmsDestinationItineraryUpdateInputSchema =
    z.object({
        id:
            z
                .string()
                .uuid(),

        itineraries:
            z
                .array(
                    cmsDestinationItineraryItemSchema,
                )
                .max(
                    200,
                    "Too many itinerary days.",
                ),
    });

export type CmsDestinationItineraryUpdateInput =
    z.infer<
        typeof cmsDestinationItineraryUpdateInputSchema
    >;