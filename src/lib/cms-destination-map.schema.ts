import {
    z,
} from "zod";

const coordinateShape = {
    latitude:
        z
            .number()
            .min(
                -90,
                "Latitude cannot be lower than -90.",
            )
            .max(
                90,
                "Latitude cannot be greater than 90.",
            )
            .nullable(),

    longitude:
        z
            .number()
            .min(
                -180,
                "Longitude cannot be lower than -180.",
            )
            .max(
                180,
                "Longitude cannot be greater than 180.",
            )
            .nullable(),
};

function coordinatesAreComplete(
    data: {
        latitude:
            number | null;

        longitude:
            number | null;
    },
) {
    return (
        (
            data.latitude ===
            null
        ) ===
        (
            data.longitude ===
            null
        )
    );
}

export const cmsDestinationMapCoordinatesSchema =
    z
        .object(
            coordinateShape,
        )
        .refine(
            coordinatesAreComplete,
            {
                message:
                    "Latitude and longitude must both be provided, or both be empty.",
            },
        );

export const cmsDestinationMapUpdateInputSchema =
    z
        .object({
            id:
                z
                    .string()
                    .uuid(),

            ...coordinateShape,
        })
        .refine(
            coordinatesAreComplete,
            {
                message:
                    "Latitude and longitude must both be provided, or both be empty.",
            },
        );

export type CmsDestinationMapUpdateInput =
    z.infer<
        typeof cmsDestinationMapUpdateInputSchema
    >;