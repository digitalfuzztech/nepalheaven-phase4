import {
    createServerFn,
} from "@tanstack/react-start";

import {
    cmsDestinationCoreUpdateInputSchema,
    cmsDestinationIdInputSchema,
    cmsDestinationStatusInputSchema,
} from "@/lib/cms-destinations.schema";

import {
    cmsDestinationContentUpdateInputSchema,
} from "@/lib/cms-destination-content.schema";

import {
    cmsDestinationItineraryUpdateInputSchema,
} from "@/lib/cms-destination-itinerary.schema";

import {
    cmsDestinationMapUpdateInputSchema,
} from "@/lib/cms-destination-map.schema";

import {
    cmsDestinationFaqUpdateInputSchema,
} from "@/lib/cms-destination-faq.schema";
export const getCmsDestinationsFn =
    createServerFn({
        method: "GET",
    }).handler(
        async () => {
            const server =
                await import(
                    "@/lib/cms-destinations.server"
                    );

            return server
                .getCmsDestinations();
        },
    );

export const getCmsDestinationByIdFn =
    createServerFn({
        method: "GET",
    })
        .validator(
            cmsDestinationIdInputSchema,
        )
        .handler(
            async ({
                       data,
                   }) => {
                const server =
                    await import(
                        "@/lib/cms-destinations.server"
                        );

                return server
                    .getCmsDestinationById(
                        data.id,
                    );
            },
        );

/*
|--------------------------------------------------------------------------
| Create Destination
|--------------------------------------------------------------------------
|
| FormData is required because the Destination main image is a DIRECT
| upload and must not go through Media Picker.
|
*/

export const createCmsDestinationFn =
    createServerFn({
        method: "POST",
    })
        .validator(
            (
                data,
            ) => {
                if (
                    !(
                        data instanceof
                        FormData
                    )
                ) {
                    throw new Error(
                        "Expected Destination form data.",
                    );
                }

                return data;
            },
        )
        .handler(
            async ({
                       data,
                   }) => {
                const server =
                    await import(
                        "@/lib/cms-destinations.server"
                        );

                return server
                    .createCmsDestinationFromFormData(
                        data,
                    );
            },
        );

export const updateCmsDestinationCoreFn =
    createServerFn({
        method: "POST",
    })
        .validator(
            cmsDestinationCoreUpdateInputSchema,
        )
        .handler(
            async ({
                       data,
                   }) => {
                const server =
                    await import(
                        "@/lib/cms-destinations.server"
                        );

                return server
                    .updateCmsDestinationCore(
                        data,
                    );
            },
        );

/*
|--------------------------------------------------------------------------
| K12 - Publish / Unpublish
|--------------------------------------------------------------------------
*/

export const updateCmsDestinationStatusFn =
    createServerFn({
        method:
            "POST",
    })
        .validator(
            cmsDestinationStatusInputSchema,
        )
        .handler(
            async ({
                       data,
                   }) => {
                const server =
                    await import(
                        "@/lib/cms-destinations.server"
                        );

                return server
                    .updateCmsDestinationStatus(
                        data,
                    );
            },
        );


/*
|--------------------------------------------------------------------------
| K12 - Delete
|--------------------------------------------------------------------------
*/

export const deleteCmsDestinationFn =
    createServerFn({
        method:
            "POST",
    })
        .validator(
            cmsDestinationIdInputSchema,
        )
        .handler(
            async ({
                       data,
                   }) => {
                const server =
                    await import(
                        "@/lib/cms-destinations.server"
                        );

                return server
                    .deleteCmsDestination(
                        data.id,
                    );
            },
        );




/*
|--------------------------------------------------------------------------
| K6 - Destination structured content
|--------------------------------------------------------------------------
*/

export const updateCmsDestinationContentFn =
    createServerFn({
        method:
            "POST",
    })
        .validator(
            cmsDestinationContentUpdateInputSchema,
        )
        .handler(
            async ({
                       data,
                   }) => {
                const server =
                    await import(
                        "@/lib/cms-destinations.server"
                        );

                return server
                    .updateCmsDestinationContent(
                        data,
                    );
            },
        );

/*
|--------------------------------------------------------------------------
| K7 - Destination itinerary
|--------------------------------------------------------------------------
*/

export const updateCmsDestinationItineraryFn =
    createServerFn({
        method:
            "POST",
    })
        .validator(
            cmsDestinationItineraryUpdateInputSchema,
        )
        .handler(
            async ({
                       data,
                   }) => {
                const server =
                    await import(
                        "@/lib/cms-destinations.server"
                        );

                return server
                    .updateCmsDestinationItinerary(
                        data,
                    );
            },
        );


/*
|--------------------------------------------------------------------------
| K8 - Destination map location
|--------------------------------------------------------------------------
*/

export const updateCmsDestinationMapFn =
    createServerFn({
        method:
            "POST",
    })
        .validator(
            cmsDestinationMapUpdateInputSchema,
        )
        .handler(
            async ({
                       data,
                   }) => {
                const server =
                    await import(
                        "@/lib/cms-destinations.server"
                        );

                return server
                    .updateCmsDestinationMap(
                        data,
                    );
            },
        );

/*
|--------------------------------------------------------------------------
| K9 - Destination FAQs
|--------------------------------------------------------------------------
*/

export const updateCmsDestinationFaqsFn =
    createServerFn({
        method:
            "POST",
    })
        .validator(
            cmsDestinationFaqUpdateInputSchema,
        )
        .handler(
            async ({
                       data,
                   }) => {
                const server =
                    await import(
                        "@/lib/cms-destinations.server"
                        );

                return server
                    .updateCmsDestinationFaqs(
                        data,
                    );
            },
        );


/*
|--------------------------------------------------------------------------
| Replace direct main image
|--------------------------------------------------------------------------
*/

export const uploadCmsDestinationMainImageFn =
    createServerFn({
        method: "POST",
    })
        .validator(
            (
                data,
            ) => {
                if (
                    !(
                        data instanceof
                        FormData
                    )
                ) {
                    throw new Error(
                        "Expected Destination image form data.",
                    );
                }

                return data;
            },
        )
        .handler(
            async ({
                       data,
                   }) => {
                const server =
                    await import(
                        "@/lib/cms-destination-main-image.server"
                        );

                return server
                    .uploadCmsDestinationMainImage(
                        data,
                    );
            },
        );