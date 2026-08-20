import {
    createServerFn,
} from "@tanstack/react-start";

import {
    cmsDestinationListingPageInputSchema,
} from "@/lib/cms-destination-listing.schema";


/*
|--------------------------------------------------------------------------
| ADMIN - Read
|--------------------------------------------------------------------------
*/

export const getCmsDestinationListingPageFn =
    createServerFn({
        method:
            "GET",
    }).handler(
        async () => {
            const server =
                await import(
                    "@/lib/cms-destination-listing.server"
                    );

            return server
                .getCmsDestinationListingPage();
        },
    );


/*
|--------------------------------------------------------------------------
| ADMIN - Update
|--------------------------------------------------------------------------
*/

export const updateCmsDestinationListingPageFn =
    createServerFn({
        method:
            "POST",
    })
        .validator(
            cmsDestinationListingPageInputSchema,
        )
        .handler(
            async ({
                       data,
                   }) => {
                const server =
                    await import(
                        "@/lib/cms-destination-listing.server"
                        );

                return server
                    .updateCmsDestinationListingPage(
                        data,
                    );
            },
        );


/*
|--------------------------------------------------------------------------
| PUBLIC - /destinations
|--------------------------------------------------------------------------
*/

export const getPublicDestinationListingPageFn =
    createServerFn({
        method:
            "GET",
    }).handler(
        async () => {
            const server =
                await import(
                    "@/lib/cms-destination-listing.server"
                    );

            return server
                .getPublicDestinationListingPage();
        },
    );