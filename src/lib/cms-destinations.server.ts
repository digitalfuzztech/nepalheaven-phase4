import {
    randomUUID,
} from "node:crypto";

import {
    asc,
    eq,
} from "drizzle-orm";

import {
    db,
} from "@/db";

import {
    destinationExclusions,
    destinationHighlights,
    destinationInclusions,
    destinationItineraries,
    destinations,
    destinationTips,
} from "@/db/schema/destinations";

import {
    requireAdmin,
} from "@/lib/auth.server";

import type {
    CmsDestinationCoreUpdateInput,
    CmsDestinationCreateInput,
} from "@/lib/cms-destinations.schema";

function requireCmsDb() {
    if (!db) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    return db;
}

export type CmsDestinationListItem = {
    id: string;

    name: string;

    slug: string;

    region: string | null;

    category: string | null;

    difficulty: string | null;

    duration: string | null;

    heroImage: string | null;

    status: boolean;

    sortOrder: number;
};

export type CmsDestinationDetail = {
    destination:
        typeof destinations.$inferSelect;

    highlights: Array<
        typeof destinationHighlights.$inferSelect
    >;

    tips: Array<
        typeof destinationTips.$inferSelect
    >;

    itineraries: Array<
        typeof destinationItineraries.$inferSelect
    >;

    inclusions: Array<
        typeof destinationInclusions.$inferSelect
    >;

    exclusions: Array<
        typeof destinationExclusions.$inferSelect
    >;
};

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
        .from(destinations)
        .orderBy(
            asc(
                destinations.sortOrder,
            ),

            asc(
                destinations.name,
            ),
        );
}

export async function getCmsDestinationById(
    id: string,
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
            .from(destinations)
            .where(
                eq(
                    destinations.id,
                    id,
                ),
            )
            .limit(1);

    if (!destination) {
        return null;
    }

    const [
        highlights,
        tips,
        itineraries,
        inclusions,
        exclusions,
    ] =
        await Promise.all([
            database
                .select()
                .from(
                    destinationHighlights,
                )
                .where(
                    eq(
                        destinationHighlights
                            .destinationId,
                        id,
                    ),
                )
                .orderBy(
                    asc(
                        destinationHighlights
                            .sortOrder,
                    ),
                ),

            database
                .select()
                .from(
                    destinationTips,
                )
                .where(
                    eq(
                        destinationTips
                            .destinationId,
                        id,
                    ),
                )
                .orderBy(
                    asc(
                        destinationTips
                            .sortOrder,
                    ),
                ),

            database
                .select()
                .from(
                    destinationItineraries,
                )
                .where(
                    eq(
                        destinationItineraries
                            .destinationId,
                        id,
                    ),
                )
                .orderBy(
                    asc(
                        destinationItineraries
                            .sortOrder,
                    ),
                ),

            database
                .select()
                .from(
                    destinationInclusions,
                )
                .where(
                    eq(
                        destinationInclusions
                            .destinationId,
                        id,
                    ),
                )
                .orderBy(
                    asc(
                        destinationInclusions
                            .sortOrder,
                    ),
                ),

            database
                .select()
                .from(
                    destinationExclusions,
                )
                .where(
                    eq(
                        destinationExclusions
                            .destinationId,
                        id,
                    ),
                )
                .orderBy(
                    asc(
                        destinationExclusions
                            .sortOrder,
                    ),
                ),
        ]);

    return {
        destination,
        highlights,
        tips,
        itineraries,
        inclusions,
        exclusions,
    };
}

export async function createCmsDestination(
    input:
    CmsDestinationCreateInput,
) {
    await requireAdmin();

    const database =
        requireCmsDb();

    const [
        existing,
    ] =
        await database
            .select({
                id:
                destinations.id,
            })
            .from(destinations)
            .where(
                eq(
                    destinations.slug,
                    input.slug,
                ),
            )
            .limit(1);

    if (existing) {
        throw new Error(
            "A destination with this slug already exists.",
        );
    }

    const id =
        randomUUID();

    await database
        .insert(
            destinations,
        )
        .values({
            id,

            name:
            input.name,

            slug:
            input.slug,

            region:
            input.region,

            category:
            input.category,

            difficulty:
            input.difficulty,

            duration:
            input.duration,

            sortOrder:
            input.sortOrder,

            /*
             * New destinations always
             * begin life as drafts.
             */
            status:
                false,
        });

    return {
        id,
        slug:
        input.slug,
    };
}

export async function updateCmsDestinationCore(
    input:
    CmsDestinationCoreUpdateInput,
) {
    await requireAdmin();

    const database =
        requireCmsDb();

    /*
     * Make sure the destination still exists.
     */
    const [
        existingDestination,
    ] =
        await database
            .select({
                id:
                destinations.id,
            })
            .from(destinations)
            .where(
                eq(
                    destinations.id,
                    input.id,
                ),
            )
            .limit(1);

    if (!existingDestination) {
        throw new Error(
            "Destination could not be found.",
        );
    }

    /*
     * Prevent duplicate public URLs.
     */
    const [
        slugOwner,
    ] =
        await database
            .select({
                id:
                destinations.id,
            })
            .from(destinations)
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

    await database
        .update(
            destinations,
        )
        .set({
            name:
            input.name,

            slug:
            input.slug,

            shortDescription:
            input.shortDescription,

            description:
            input.description,

            region:
            input.region,

            category:
            input.category,

            difficulty:
            input.difficulty,

            duration:
            input.duration,

            bestSeason:
            input.bestSeason,

            altitudeLabel:
            input.altitudeLabel,

            minAltitude:
            input.minAltitude,

            maxAltitude:
            input.maxAltitude,

            cancellationFeePercentage:
            input
                .cancellationFeePercentage,

            sortOrder:
            input.sortOrder,
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

        slug:
        input.slug,
    };
}