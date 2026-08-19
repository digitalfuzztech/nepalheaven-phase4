import {
    randomUUID,
} from "node:crypto";

import {
    and,
    asc,
    eq,
} from "drizzle-orm";

import {
    db,
} from "@/db";

import {
    cmsOtherSettingsOptions,
} from "@/db/schema/cms-other-settings";

import {
    destinationBestSeasons,
    destinationExclusions,
    destinationFaqs,
    destinationHighlights,
    destinationInclusions,
    destinationItineraries,
    destinations,
    destinationTips,
} from "@/db/schema/destinations";

import {
    requireAdmin,
} from "@/lib/auth.server";

import {
    cmsDestinationCreateInputSchema,
    type CmsDestinationCoreUpdateInput,
    type CmsDestinationCreateInput,
} from "@/lib/cms-destinations.schema";

import type {
    CmsDestinationContentUpdateInput,
} from "@/lib/cms-destination-content.schema";

import {
    formatDestinationAltitude,
    formatDestinationBestSeasons,
    formatDestinationDuration,
} from "@/lib/cms-destinations.constants";

import {
    removeCmsMediaStoredFile,
} from "@/lib/cms-media-storage.server";

import {
    storeCmsDestinationMainImage,
} from "@/lib/cms-destination-main-image.server";

import type {
    CmsDestinationItineraryUpdateInput,
} from "@/lib/cms-destination-itinerary.schema";

import {
    cmsDestinationItineraryItemSchema,
} from "@/lib/cms-destination-itinerary.schema";

import {
    cmsDestinationMapCoordinatesSchema,
    type CmsDestinationMapUpdateInput,
} from "@/lib/cms-destination-map.schema";

import {
    cmsDestinationFaqItemSchema,
    type CmsDestinationFaqUpdateInput,
} from "@/lib/cms-destination-faq.schema";


function requireCmsDb() {
    if (!db) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    return db;
}

export type CmsDestinationListItem = {
    id:
        string;

    name:
        string;

    slug:
        string;

    region:
        string | null;

    category:
        string | null;

    difficulty:
        string | null;

    duration:
        string | null;

    heroImage:
        string | null;

    status:
        boolean;

    sortOrder:
        number;
};

export type CmsDestinationDetail = {
    destination:
        typeof destinations.$inferSelect;

    bestSeasons:
        Array<
            typeof destinationBestSeasons.$inferSelect
        >;

    highlights:
        Array<
            typeof destinationHighlights.$inferSelect
        >;

    tips:
        Array<
            typeof destinationTips.$inferSelect
        >;

    itineraries:
        Array<
            typeof destinationItineraries.$inferSelect
        >;

    inclusions:
        Array<
            typeof destinationInclusions.$inferSelect
        >;
    exclusions:
        Array<
            typeof destinationExclusions.$inferSelect
        >;

    faqs:
        Array<
            typeof destinationFaqs.$inferSelect
        >;
};

/*
|--------------------------------------------------------------------------
| Option validation
|--------------------------------------------------------------------------
*/

async function getOtherSettingsOption(
    id:
        string | null,

    groupKey:
    string,
) {
    if (
        !id
    ) {
        return null;
    }

    const database =
        requireCmsDb();

    const [
        option,
    ] =
        await database
            .select({
                id:
                cmsOtherSettingsOptions.id,

                name:
                cmsOtherSettingsOptions.name,

                value:
                cmsOtherSettingsOptions.value,
            })
            .from(
                cmsOtherSettingsOptions,
            )
            .where(
                and(
                    eq(
                        cmsOtherSettingsOptions.id,
                        id,
                    ),

                    eq(
                        cmsOtherSettingsOptions.groupKey,
                        groupKey,
                    ),
                ),
            )
            .limit(1);

    if (
        !option
    ) {
        throw new Error(
            groupKey ===
            "destination_type"
                ? "The selected Destination Type no longer exists."
                : "The selected Difficulty no longer exists.",
        );
    }

    return option;
}

/*
|--------------------------------------------------------------------------
| FormData helpers
|--------------------------------------------------------------------------
*/

function formString(
    formData:
    FormData,

    key:
    string,
) {
    const value =
        formData.get(
            key,
        );

    return typeof value ===
    "string"
        ? value
        : "";
}

function formNullableString(
    formData:
    FormData,

    key:
    string,
) {
    const value =
        formString(
            formData,
            key,
        ).trim();

    return value
        ? value
        : null;
}

function formNullableNumber(
    formData:
    FormData,

    key:
    string,
) {
    const raw =
        formString(
            formData,
            key,
        ).trim();

    if (
        !raw
    ) {
        return null;
    }

    const value =
        Number(
            raw,
        );

    if (
        !Number.isFinite(
            value,
        )
    ) {
        return null;
    }

    return value;
}

function formNullableCoordinate(
    formData:
    FormData,

    key:
        "latitude" |
        "longitude",

    label:
    string,
) {
    const raw =
        formString(
            formData,
            key,
        ).trim();

    if (
        !raw
    ) {
        return null;
    }

    const value =
        Number(
            raw,
        );

    if (
        !Number.isFinite(
            value,
        )
    ) {
        throw new Error(
            `${label} must be a valid number.`,
        );
    }

    return value;
}

function parseBestSeasons(
    formData:
    FormData,
) {
    const raw =
        formString(
            formData,
            "bestSeasons",
        );

    if (
        !raw
    ) {
        return [];
    }

    try {
        const parsed =
            JSON.parse(
                raw,
            );

        return Array.isArray(
            parsed,
        )
            ? parsed
            : [];
    } catch {
        throw new Error(
            "Best Season data is invalid.",
        );
    }
}

function parseDestinationContentItems(
    formData:
    FormData,

    key:
        "highlights" |
        "inclusions" |
        "exclusions" |
        "tips",

    label:
    string,
) {
    const raw =
        formString(
            formData,
            key,
        );

    if (
        !raw
    ) {
        return [];
    }

    let parsed:
        unknown;

    try {
        parsed =
            JSON.parse(
                raw,
            );
    } catch {
        throw new Error(
            `${label} data is invalid.`,
        );
    }

    if (
        !Array.isArray(
            parsed,
        )
    ) {
        throw new Error(
            `${label} data is invalid.`,
        );
    }

    if (
        parsed.length >
        100
    ) {
        throw new Error(
            `${label} cannot contain more than 100 items.`,
        );
    }

    return parsed
        .map(
            (
                item,
            ) => {
                if (
                    typeof item !==
                    "string"
                ) {
                    throw new Error(
                        `${label} contains an invalid item.`,
                    );
                }

                const value =
                    item.trim();

                if (
                    value.length >
                    2000
                ) {
                    throw new Error(
                        `${label} contains an item that is too long.`,
                    );
                }

                return value;
            },
        )
        .filter(
            Boolean,
        );
}

function parseDestinationItineraries(
    formData:
    FormData,
) {
    const raw =
        formString(
            formData,
            "itineraries",
        );

    if (
        !raw
    ) {
        return [];
    }

    let parsed:
        unknown;

    try {
        parsed =
            JSON.parse(
                raw,
            );
    } catch {
        throw new Error(
            "Itinerary data is invalid.",
        );
    }

    if (
        !Array.isArray(
            parsed,
        )
    ) {
        throw new Error(
            "Itinerary data is invalid.",
        );
    }

    if (
        parsed.length >
        200
    ) {
        throw new Error(
            "Too many itinerary days.",
        );
    }

    return parsed.map(
        (
            item,
        ) =>
            cmsDestinationItineraryItemSchema.parse(
                item,
            ),
    );
}

function parseDestinationFaqs(
    formData:
    FormData,
) {
    const raw =
        formString(
            formData,
            "faqs",
        );

    if (
        !raw
    ) {
        return [];
    }

    let parsed:
        unknown;

    try {
        parsed =
            JSON.parse(
                raw,
            );
    } catch {
        throw new Error(
            "FAQ data is invalid.",
        );
    }

    if (
        !Array.isArray(
            parsed,
        )
    ) {
        throw new Error(
            "FAQ data is invalid.",
        );
    }

    if (
        parsed.length >
        100
    ) {
        throw new Error(
            "Too many FAQs.",
        );
    }

    return parsed.map(
        (
            faq,
        ) =>
            cmsDestinationFaqItemSchema.parse(
                faq,
            ),
    );
}

/*
|--------------------------------------------------------------------------
| List
|--------------------------------------------------------------------------
*/

export async function getCmsDestinations():
    Promise<
        CmsDestinationListItem[]
    > {
    await requireAdmin();

    const database =
        requireCmsDb();

    return database
        .select({
            id:
            destinations.id,

            name:
            destinations.name,

            slug:
            destinations.slug,

            region:
            destinations.region,

            category:
            destinations.category,

            difficulty:
            destinations.difficulty,

            duration:
            destinations.duration,

            heroImage:
            destinations.heroImage,

            status:
            destinations.status,

            sortOrder:
            destinations.sortOrder,
        })
        .from(
            destinations,
        )
        .orderBy(
            asc(
                destinations.sortOrder,
            ),

            asc(
                destinations.name,
            ),
        );
}

/*
|--------------------------------------------------------------------------
| Detail
|--------------------------------------------------------------------------
*/

export async function getCmsDestinationById(
    id:
    string,
): Promise<
    CmsDestinationDetail | null
> {
    await requireAdmin();

    const database =
        requireCmsDb();

    const [
        destination,
    ] =
        await database
            .select()
            .from(
                destinations,
            )
            .where(
                eq(
                    destinations.id,
                    id,
                ),
            )
            .limit(1);

    if (
        !destination
    ) {
        return null;
    }

    const [
        bestSeasons,
        highlights,
        tips,
        itineraries,
        inclusions,
        exclusions,
        faqs,
    ] =
        await Promise.all([
            database
                .select()
                .from(
                    destinationBestSeasons,
                )
                .where(
                    eq(
                        destinationBestSeasons.destinationId,
                        id,
                    ),
                )
                .orderBy(
                    asc(
                        destinationBestSeasons.sortOrder,
                    ),
                ),

            database
                .select()
                .from(
                    destinationHighlights,
                )
                .where(
                    eq(
                        destinationHighlights.destinationId,
                        id,
                    ),
                )
                .orderBy(
                    asc(
                        destinationHighlights.sortOrder,
                    ),
                ),

            database
                .select()
                .from(
                    destinationTips,
                )
                .where(
                    eq(
                        destinationTips.destinationId,
                        id,
                    ),
                )
                .orderBy(
                    asc(
                        destinationTips.sortOrder,
                    ),
                ),

            database
                .select()
                .from(
                    destinationItineraries,
                )
                .where(
                    eq(
                        destinationItineraries.destinationId,
                        id,
                    ),
                )
                .orderBy(
                    asc(
                        destinationItineraries.sortOrder,
                    ),
                ),

            database
                .select()
                .from(
                    destinationInclusions,
                )
                .where(
                    eq(
                        destinationInclusions.destinationId,
                        id,
                    ),
                )
                .orderBy(
                    asc(
                        destinationInclusions.sortOrder,
                    ),
                ),

            database
                .select()
                .from(
                    destinationExclusions,
                )
                .where(
                    eq(
                        destinationExclusions.destinationId,
                        id,
                    ),
                )
                .orderBy(
                    asc(
                        destinationExclusions.sortOrder,
                    ),
                ),
            database
                .select()
                .from(
                    destinationFaqs,
                )
                .where(
                    eq(
                        destinationFaqs.destinationId,
                        id,
                    ),
                )
                .orderBy(
                    asc(
                        destinationFaqs.sortOrder,
                    ),
                ),
        ]);

    return {
        destination,
        bestSeasons,
        highlights,
        tips,
        itineraries,
        inclusions,
        exclusions,
        faqs,
    };
}

/*
|--------------------------------------------------------------------------
| Create with optional DIRECT main image
|--------------------------------------------------------------------------
*/

export async function createCmsDestinationFromFormData(
    formData:
    FormData,
) {
    await requireAdmin();

    const database =
        requireCmsDb();

    const data =
        cmsDestinationCreateInputSchema.parse(
            {
                name:
                    formString(
                        formData,
                        "name",
                    ),

                slug:
                    formString(
                        formData,
                        "slug",
                    ),

                region:
                    formString(
                        formData,
                        "region",
                    ),

                subtitle:
                    formString(
                        formData,
                        "subtitle",
                    ),

                destinationTypeOptionId:
                    formNullableString(
                        formData,
                        "destinationTypeOptionId",
                    ),

                difficultyOptionId:
                    formNullableString(
                        formData,
                        "difficultyOptionId",
                    ),

                minAltitude:
                    formNullableNumber(
                        formData,
                        "minAltitude",
                    ),

                maxAltitude:
                    formNullableNumber(
                        formData,
                        "maxAltitude",
                    ),

                durationMinDays:
                    formNullableNumber(
                        formData,
                        "durationMinDays",
                    ),

                durationMaxDays:
                    formNullableNumber(
                        formData,
                        "durationMaxDays",
                    ),

                overview:
                    formString(
                        formData,
                        "overview",
                    ),

                sortOrder:
                    Number(
                        formString(
                            formData,
                            "sortOrder",
                        ) ||
                        0,
                    ),

                bestSeasons:
                    parseBestSeasons(
                        formData,
                    ),
            },
        );

    const highlights =
        parseDestinationContentItems(
            formData,
            "highlights",
            "Highlights",
        );

    const inclusions =
        parseDestinationContentItems(
            formData,
            "inclusions",
            "Inclusions",
        );

    const exclusions =
        parseDestinationContentItems(
            formData,
            "exclusions",
            "Exclusions",
        );

    const tips =
        parseDestinationContentItems(
            formData,
            "tips",
            "Travel Tips",
        );

    const itineraries =
        parseDestinationItineraries(
            formData,
        );

    const mapLocation =
        cmsDestinationMapCoordinatesSchema.parse({
            latitude:
                formNullableCoordinate(
                    formData,
                    "latitude",
                    "Latitude",
                ),

            longitude:
                formNullableCoordinate(
                    formData,
                    "longitude",
                    "Longitude",
                ),
        });

    const faqs =
        parseDestinationFaqs(
            formData,
        );

    const [
        existing,
    ] =
        await database
            .select({
                id:
                destinations.id,
            })
            .from(
                destinations,
            )
            .where(
                eq(
                    destinations.slug,
                    data.slug,
                ),
            )
            .limit(1);

    if (
        existing
    ) {
        throw new Error(
            "A destination with this slug already exists.",
        );
    }

    const [
        destinationType,
        difficulty,
    ] =
        await Promise.all([
            getOtherSettingsOption(
                data.destinationTypeOptionId,
                "destination_type",
            ),

            getOtherSettingsOption(
                data.difficultyOptionId,
                "difficulty",
            ),
        ]);

    const file =
        formData.get(
            "mainImage",
        );

    let storedImage:
        Awaited<
            ReturnType<
                typeof storeCmsDestinationMainImage
            >
        > | null =
        null;

    if (
        file &&
        typeof file !==
        "string" &&
        file.size >
        0
    ) {
        storedImage =
            await storeCmsDestinationMainImage(
                file,
            );
    }

    const id =
        randomUUID();

    try {
        await database.transaction(
            async (
                tx,
            ) => {
                await tx
                    .insert(
                        destinations,
                    )
                    .values({
                        id,

                        name:
                        data.name,

                        slug:
                        data.slug,

                        region:
                        data.region,

                        latitude:
                        mapLocation.latitude,

                        longitude:
                        mapLocation.longitude,

                        subtitle:
                        data.subtitle,

                        /*
                         * Existing public pages currently read
                         * shortDescription.
                         */
                        shortDescription:
                        data.subtitle,

                        description:
                        data.overview,

                        destinationTypeOptionId:
                            destinationType?.id ??
                            null,

                        category:
                            destinationType?.name ??
                            null,

                        difficultyOptionId:
                            difficulty?.id ??
                            null,

                        difficulty:
                            difficulty?.name ??
                            null,

                        minAltitude:
                        data.minAltitude,

                        maxAltitude:
                        data.maxAltitude,

                        altitudeLabel:
                            formatDestinationAltitude(
                                data.minAltitude,
                                data.maxAltitude,
                            ),

                        durationMinDays:
                        data.durationMinDays,

                        durationMaxDays:
                        data.durationMaxDays,

                        duration:
                            formatDestinationDuration(
                                data.durationMinDays,
                                data.durationMaxDays,
                            ),

                        bestSeason:
                            formatDestinationBestSeasons(
                                data.bestSeasons,
                            ) ||
                            null,

                        heroImage:
                            storedImage?.url ??
                            null,

                        heroImageStorageKey:
                            storedImage?.storageKey ??
                            null,

                        sortOrder:
                        data.sortOrder,

                        /*
                         * New destinations remain drafts.
                         */
                        status:
                            false,
                    });

                if (
                    data.bestSeasons.length
                ) {
                    await tx
                        .insert(
                            destinationBestSeasons,
                        )
                        .values(
                            data.bestSeasons.map(
                                (
                                    season,
                                    index,
                                ) => ({
                                    id:
                                        randomUUID(),

                                    destinationId:
                                    id,

                                    fromMonth:
                                    season.fromMonth,

                                    toMonth:
                                    season.toMonth,

                                    sortOrder:
                                    index,
                                }),
                            ),
                        );
                }
                /*
|--------------------------------------------------------------------------
| K6 - Highlights
|--------------------------------------------------------------------------
*/

                if (
                    highlights.length
                ) {
                    await tx
                        .insert(
                            destinationHighlights,
                        )
                        .values(
                            highlights.map(
                                (
                                    item,
                                    index,
                                ) => ({
                                    id:
                                        randomUUID(),

                                    destinationId:
                                    id,

                                    item,

                                    sortOrder:
                                    index,
                                }),
                            ),
                        );
                }

                /*
                |--------------------------------------------------------------------------
                | K6 - Inclusions
                |--------------------------------------------------------------------------
                */

                if (
                    inclusions.length
                ) {
                    await tx
                        .insert(
                            destinationInclusions,
                        )
                        .values(
                            inclusions.map(
                                (
                                    item,
                                    index,
                                ) => ({
                                    id:
                                        randomUUID(),

                                    destinationId:
                                    id,

                                    item,

                                    sortOrder:
                                    index,
                                }),
                            ),
                        );
                }

                /*
                |--------------------------------------------------------------------------
                | K6 - Exclusions
                |--------------------------------------------------------------------------
                */

                if (
                    exclusions.length
                ) {
                    await tx
                        .insert(
                            destinationExclusions,
                        )
                        .values(
                            exclusions.map(
                                (
                                    item,
                                    index,
                                ) => ({
                                    id:
                                        randomUUID(),

                                    destinationId:
                                    id,

                                    item,

                                    sortOrder:
                                    index,
                                }),
                            ),
                        );
                }

                /*
                |--------------------------------------------------------------------------
                | K6 - Travel Tips
                |--------------------------------------------------------------------------
                */

                if (
                    tips.length
                ) {
                    await tx
                        .insert(
                            destinationTips,
                        )
                        .values(
                            tips.map(
                                (
                                    item,
                                    index,
                                ) => ({
                                    id:
                                        randomUUID(),

                                    destinationId:
                                    id,

                                    item,

                                    sortOrder:
                                    index,
                                }),
                            ),
                        );
                }


                /*
                |--------------------------------------------------------------------------
                | K7 - Itinerary
                |--------------------------------------------------------------------------
                */

                if (
                    itineraries.length
                ) {
                    await tx
                        .insert(
                            destinationItineraries,
                        )
                        .values(
                            itineraries.map(
                                (
                                    item,
                                    index,
                                ) => ({
                                    id:
                                        randomUUID(),

                                    destinationId:
                                    id,

                                    dayLabel:
                                        `Day ${item.dayNo}`,

                                    title:
                                    item.title,

                                    description:
                                        item.description ||
                                        null,

                                    sortOrder:
                                    index,
                                }),
                            ),
                        );
                }
                /*
|--------------------------------------------------------------------------
| K9 - Destination FAQs
|--------------------------------------------------------------------------
*/

                if (
                    faqs.length
                ) {
                    await tx
                        .insert(
                            destinationFaqs,
                        )
                        .values(
                            faqs.map(
                                (
                                    faq,
                                    index,
                                ) => ({
                                    id:
                                        randomUUID(),

                                    destinationId:
                                    id,

                                    question:
                                    faq.question,

                                    answer:
                                    faq.answer,

                                    sortOrder:
                                    index,
                                }),
                            ),
                        );
                }
            },
        );
    } catch (
        error
        ) {
        if (
            storedImage
        ) {
            await removeCmsMediaStoredFile(
                storedImage.storageKey,
            ).catch(
                () =>
                    undefined,
            );
        }

        throw error;
    }

    return {
        id,

        slug:
        data.slug,
    };
}

/*
|--------------------------------------------------------------------------
| Update structured core
|--------------------------------------------------------------------------
*/

export async function updateCmsDestinationCore(
    input:
    CmsDestinationCoreUpdateInput,
) {
    await requireAdmin();

    const database =
        requireCmsDb();

    const [
        existingDestination,
    ] =
        await database
            .select()
            .from(
                destinations,
            )
            .where(
                eq(
                    destinations.id,
                    input.id,
                ),
            )
            .limit(1);

    if (
        !existingDestination
    ) {
        throw new Error(
            "Destination could not be found.",
        );
    }

    const [
        slugOwner,
    ] =
        await database
            .select({
                id:
                destinations.id,
            })
            .from(
                destinations,
            )
            .where(
                eq(
                    destinations.slug,
                    input.slug,
                ),
            )
            .limit(1);

    if (
        slugOwner &&
        slugOwner.id !==
        input.id
    ) {
        throw new Error(
            "A destination with this slug already exists.",
        );
    }

    const [
        destinationType,
        difficulty,
    ] =
        await Promise.all([
            getOtherSettingsOption(
                input.destinationTypeOptionId,
                "destination_type",
            ),

            getOtherSettingsOption(
                input.difficultyOptionId,
                "difficulty",
            ),
        ]);

    /*
     * Blank dropdown preserves an unmatched legacy value instead of
     * silently destroying old content.
     */
    const nextDestinationTypeId =
        destinationType?.id ??
        existingDestination.destinationTypeOptionId;

    const nextDestinationTypeName =
        destinationType?.name ??
        existingDestination.category;

    const nextDifficultyId =
        difficulty?.id ??
        existingDestination.difficultyOptionId;

    const nextDifficultyName =
        difficulty?.name ??
        existingDestination.difficulty;

    await database.transaction(
        async (
            tx,
        ) => {
            const updateValues: {
                name:
                    string;

                slug:
                    string;

                region:
                    string | null;

                subtitle:
                    string | null;

                shortDescription:
                    string | null;

                description:
                    string | null;

                destinationTypeOptionId:
                    string | null;

                category:
                    string | null;

                difficultyOptionId:
                    string | null;

                difficulty:
                    string | null;

                minAltitude:
                    number | null;

                maxAltitude:
                    number | null;

                altitudeLabel:
                    string | null;

                durationMinDays:
                    number | null;

                durationMaxDays:
                    number | null;

                duration:
                    string | null;

                sortOrder:
                    number;

                updatedAt:
                    Date;

                bestSeason?:
                    string | null;
            } = {
                name:
                input.name,

                slug:
                input.slug,

                region:
                input.region,

                subtitle:
                input.subtitle,

                /*
                 * Current public pages still use this.
                 */
                shortDescription:
                input.subtitle,

                description:
                input.overview,

                destinationTypeOptionId:
                nextDestinationTypeId,

                category:
                nextDestinationTypeName,

                difficultyOptionId:
                nextDifficultyId,

                difficulty:
                nextDifficultyName,

                minAltitude:
                input.minAltitude,

                maxAltitude:
                input.maxAltitude,

                altitudeLabel:
                    formatDestinationAltitude(
                        input.minAltitude,
                        input.maxAltitude,
                    ),

                durationMinDays:
                input.durationMinDays,

                durationMaxDays:
                input.durationMaxDays,

                duration:
                    formatDestinationDuration(
                        input.durationMinDays,
                        input.durationMaxDays,
                    ),

                sortOrder:
                input.sortOrder,

                updatedAt:
                    new Date(),
            };

            if (
                input.replaceBestSeasons
            ) {
                updateValues.bestSeason =
                    formatDestinationBestSeasons(
                        input.bestSeasons,
                    ) ||
                    null;
            }

            await tx
                .update(
                    destinations,
                )
                .set(
                    updateValues,
                )
                .where(
                    eq(
                        destinations.id,
                        input.id,
                    ),
                );

            if (
                input.replaceBestSeasons
            ) {
                await tx
                    .delete(
                        destinationBestSeasons,
                    )
                    .where(
                        eq(
                            destinationBestSeasons.destinationId,
                            input.id,
                        ),
                    );

                if (
                    input.bestSeasons.length
                ) {
                    await tx
                        .insert(
                            destinationBestSeasons,
                        )
                        .values(
                            input.bestSeasons.map(
                                (
                                    season,
                                    index,
                                ) => ({
                                    id:
                                        randomUUID(),

                                    destinationId:
                                    input.id,

                                    fromMonth:
                                    season.fromMonth,

                                    toMonth:
                                    season.toMonth,

                                    sortOrder:
                                    index,
                                }),
                            ),
                        );
                }
            }
        },
    );

    return {
        id:
        input.id,

        slug:
        input.slug,
    };
}
/*
|--------------------------------------------------------------------------
| K6 - Destination structured content
|--------------------------------------------------------------------------
|
| Highlights, inclusions, exclusions and travel tips.
|
| Each collection is replaced atomically inside one transaction.
| Existing rows are deleted only for this destination.
|
*/

export async function updateCmsDestinationContent(
    input:
    CmsDestinationContentUpdateInput,
) {
    await requireAdmin();

    const database =
        requireCmsDb();

    const [
        destination,
    ] =
        await database
            .select({
                id:
                destinations.id,
            })
            .from(
                destinations,
            )
            .where(
                eq(
                    destinations.id,
                    input.id,
                ),
            )
            .limit(1);

    if (
        !destination
    ) {
        throw new Error(
            "Destination could not be found.",
        );
    }

    await database.transaction(
        async (
            tx,
        ) => {
            /*
            |--------------------------------------------------------------------------
            | Highlights
            |--------------------------------------------------------------------------
            */

            await tx
                .delete(
                    destinationHighlights,
                )
                .where(
                    eq(
                        destinationHighlights.destinationId,
                        input.id,
                    ),
                );

            if (
                input.highlights.length
            ) {
                await tx
                    .insert(
                        destinationHighlights,
                    )
                    .values(
                        input.highlights.map(
                            (
                                item,
                                index,
                            ) => ({
                                id:
                                    randomUUID(),

                                destinationId:
                                input.id,

                                item,

                                sortOrder:
                                index,
                            }),
                        ),
                    );
            }

            /*
            |--------------------------------------------------------------------------
            | Inclusions
            |--------------------------------------------------------------------------
            */

            await tx
                .delete(
                    destinationInclusions,
                )
                .where(
                    eq(
                        destinationInclusions.destinationId,
                        input.id,
                    ),
                );

            if (
                input.inclusions.length
            ) {
                await tx
                    .insert(
                        destinationInclusions,
                    )
                    .values(
                        input.inclusions.map(
                            (
                                item,
                                index,
                            ) => ({
                                id:
                                    randomUUID(),

                                destinationId:
                                input.id,

                                item,

                                sortOrder:
                                index,
                            }),
                        ),
                    );
            }

            /*
            |--------------------------------------------------------------------------
            | Exclusions
            |--------------------------------------------------------------------------
            */

            await tx
                .delete(
                    destinationExclusions,
                )
                .where(
                    eq(
                        destinationExclusions.destinationId,
                        input.id,
                    ),
                );

            if (
                input.exclusions.length
            ) {
                await tx
                    .insert(
                        destinationExclusions,
                    )
                    .values(
                        input.exclusions.map(
                            (
                                item,
                                index,
                            ) => ({
                                id:
                                    randomUUID(),

                                destinationId:
                                input.id,

                                item,

                                sortOrder:
                                index,
                            }),
                        ),
                    );
            }

            /*
            |--------------------------------------------------------------------------
            | Travel Tips
            |--------------------------------------------------------------------------
            */

            await tx
                .delete(
                    destinationTips,
                )
                .where(
                    eq(
                        destinationTips.destinationId,
                        input.id,
                    ),
                );

            if (
                input.tips.length
            ) {
                await tx
                    .insert(
                        destinationTips,
                    )
                    .values(
                        input.tips.map(
                            (
                                item,
                                index,
                            ) => ({
                                id:
                                    randomUUID(),

                                destinationId:
                                input.id,

                                item,

                                sortOrder:
                                index,
                            }),
                        ),
                    );
            }
        },
    );

    return {
        id:
        input.id,
    };
}
/*
|--------------------------------------------------------------------------
| K7 - Destination itinerary
|--------------------------------------------------------------------------
*/

export async function updateCmsDestinationItinerary(
    input:
    CmsDestinationItineraryUpdateInput,
) {
    await requireAdmin();

    const database =
        requireCmsDb();

    const [
        destination,
    ] =
        await database
            .select({
                id:
                destinations.id,
            })
            .from(
                destinations,
            )
            .where(
                eq(
                    destinations.id,
                    input.id,
                ),
            )
            .limit(1);

    if (
        !destination
    ) {
        throw new Error(
            "Destination could not be found.",
        );
    }

    await database.transaction(
        async (
            tx,
        ) => {
            await tx
                .delete(
                    destinationItineraries,
                )
                .where(
                    eq(
                        destinationItineraries.destinationId,
                        input.id,
                    ),
                );

            if (
                input.itineraries.length
            ) {
                await tx
                    .insert(
                        destinationItineraries,
                    )
                    .values(
                        input.itineraries.map(
                            (
                                item,
                                index,
                            ) => ({
                                id:
                                    randomUUID(),

                                destinationId:
                                input.id,

                                dayLabel:
                                    `Day ${item.dayNo}`,

                                title:
                                item.title,

                                description:
                                    item.description ||
                                    null,

                                sortOrder:
                                index,
                            }),
                        ),
                    );
            }
        },
    );

    return {
        id:
        input.id,
    };
}

/*
|--------------------------------------------------------------------------
| K8 - Destination map location
|--------------------------------------------------------------------------
*/

export async function updateCmsDestinationMap(
    input:
    CmsDestinationMapUpdateInput,
) {
    await requireAdmin();

    const database =
        requireCmsDb();

    const [
        destination,
    ] =
        await database
            .select({
                id:
                destinations.id,
            })
            .from(
                destinations,
            )
            .where(
                eq(
                    destinations.id,
                    input.id,
                ),
            )
            .limit(1);

    if (
        !destination
    ) {
        throw new Error(
            "Destination could not be found.",
        );
    }

    await database
        .update(
            destinations,
        )
        .set({
            latitude:
            input.latitude,

            longitude:
            input.longitude,

            updatedAt:
                new Date(),
        })
        .where(
            eq(
                destinations.id,
                input.id,
            ),
        );

    return {
        id:
        input.id,
    };
}

/*
|--------------------------------------------------------------------------
| K9 - Destination FAQs
|--------------------------------------------------------------------------
*/

export async function updateCmsDestinationFaqs(
    input:
    CmsDestinationFaqUpdateInput,
) {
    await requireAdmin();

    const database =
        requireCmsDb();

    const [
        destination,
    ] =
        await database
            .select({
                id:
                destinations.id,
            })
            .from(
                destinations,
            )
            .where(
                eq(
                    destinations.id,
                    input.id,
                ),
            )
            .limit(1);

    if (
        !destination
    ) {
        throw new Error(
            "Destination could not be found.",
        );
    }

    await database.transaction(
        async (
            tx,
        ) => {
            await tx
                .delete(
                    destinationFaqs,
                )
                .where(
                    eq(
                        destinationFaqs.destinationId,
                        input.id,
                    ),
                );

            if (
                input.faqs.length
            ) {
                await tx
                    .insert(
                        destinationFaqs,
                    )
                    .values(
                        input.faqs.map(
                            (
                                faq,
                                index,
                            ) => ({
                                id:
                                    randomUUID(),

                                destinationId:
                                input.id,

                                question:
                                faq.question,

                                answer:
                                faq.answer,

                                sortOrder:
                                index,
                            }),
                        ),
                    );
            }
        },
    );

    return {
        id:
        input.id,
    };
}