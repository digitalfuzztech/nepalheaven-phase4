import {
    randomUUID,
} from "node:crypto";

import {
    and,
    asc,
    eq,
    inArray,
} from "drizzle-orm";

import {
    db,
} from "@/db";

import {
    cmsPages,
    cmsPageSections,
} from "@/db/schema/cms-foundation";

import {
    cmsOtherSettingsOptions,
} from "@/db/schema/cms-other-settings";

import {
    media,
} from "@/db/schema/media";

import {
    requireAdmin,
} from "@/lib/auth.server";

import {
    cmsDestinationListingPageInputSchema,
    type CmsDestinationListingPageInput,
} from "@/lib/cms-destination-listing.schema";

import {
    validateCmsSelectableImageIds,
} from "@/lib/cms-media.server";

import {
    resolveAssetReference,
} from "@/lib/asset-resolver";


const PAGE_KEY =
    "destinations-index";

const SECTION_KEY =
    "listing-page";


const defaultSettings:
    CmsDestinationListingPageInput = {
    heroMediaId:
        null,

    subtitle:
        "Explore Nepal",

    title:
        "Every region, honestly described",

    description:
        "Altitude, season, duration and difficulty for each of the places we know best.",

    searchTitle:
        "Refine",

    searchPlaceholder:
        "Search regions…",
};


function requireCmsDb() {
    if (
        !db
    ) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    return db;
}


/*
|--------------------------------------------------------------------------
| Read stored listing-page section
|--------------------------------------------------------------------------
*/

async function readStoredDestinationListingPage():
    Promise<
        CmsDestinationListingPageInput
    > {
    const database =
        requireCmsDb();

    const [
        page,
    ] =
        await database
            .select({
                id:
                cmsPages.id,
            })
            .from(
                cmsPages,
            )
            .where(
                eq(
                    cmsPages.key,
                    PAGE_KEY,
                ),
            )
            .limit(1);

    /*
     * Public page must never break simply
     * because the CMS foundation row is missing.
     */
    if (
        !page
    ) {
        return {
            ...defaultSettings,
        };
    }

    const [
        section,
    ] =
        await database
            .select({
                content:
                cmsPageSections.content,
            })
            .from(
                cmsPageSections,
            )
            .where(
                and(
                    eq(
                        cmsPageSections.pageId,
                        page.id,
                    ),

                    eq(
                        cmsPageSections.sectionKey,
                        SECTION_KEY,
                    ),
                ),
            )
            .limit(1);

    if (
        !section
    ) {
        return {
            ...defaultSettings,
        };
    }

    try {
        const parsed =
            cmsDestinationListingPageInputSchema
                .safeParse(
                    JSON.parse(
                        section.content,
                    ),
                );

        if (
            parsed.success
        ) {
            return parsed.data;
        }
    } catch {
        /*
         * Invalid CMS JSON must fall back
         * safely rather than break /destinations.
         */
    }

    return {
        ...defaultSettings,
    };
}


/*
|--------------------------------------------------------------------------
| ADMIN - Read
|--------------------------------------------------------------------------
*/

export async function getCmsDestinationListingPage() {
    await requireAdmin();

    return readStoredDestinationListingPage();
}


/*
|--------------------------------------------------------------------------
| ADMIN - Update
|--------------------------------------------------------------------------
*/

export async function updateCmsDestinationListingPage(
    input:
    CmsDestinationListingPageInput,
) {
    const admin =
        await requireAdmin();

    const database =
        requireCmsDb();

    const data =
        cmsDestinationListingPageInputSchema
            .parse(
                input,
            );

    /*
     * Hero MUST point to an existing READY image
     * in Media Library.
     */
    await validateCmsSelectableImageIds(
        [
            data.heroMediaId,
        ],
    );

    const [
        page,
    ] =
        await database
            .select({
                id:
                cmsPages.id,
            })
            .from(
                cmsPages,
            )
            .where(
                eq(
                    cmsPages.key,
                    PAGE_KEY,
                ),
            )
            .limit(1);

    if (
        !page
    ) {
        throw new Error(
            "Destinations Listing CMS page has not been initialized. Run npm run db:seed:cms.",
        );
    }

    const content =
        JSON.stringify(
            data,
        );

    /*
     * First save:
     * creates the section.
     *
     * Later saves:
     * updates the same section.
     */
    await database
        .insert(
            cmsPageSections,
        )
        .values({
            id:
                randomUUID(),

            pageId:
            page.id,

            sectionKey:
            SECTION_KEY,

            schemaVersion:
                1,

            content,

            enabled:
                true,

            sortOrder:
                0,

            updatedByUserId:
            admin.id,
        })
        .onDuplicateKeyUpdate({
            set: {
                schemaVersion:
                    1,

                content,

                enabled:
                    true,

                updatedByUserId:
                admin.id,

                updatedAt:
                    new Date(),
            },
        });

    return readStoredDestinationListingPage();
}


/*
|--------------------------------------------------------------------------
| PUBLIC - Read listing page
|--------------------------------------------------------------------------
|
| No admin authentication here.
|
| This is consumed by /destinations.
|
*/

export async function getPublicDestinationListingPage() {
    const database =
        requireCmsDb();

    const settings =
        await readStoredDestinationListingPage();

    /*
     * Resolve selected Media Library hero.
     *
     * If the media item was deleted or is no longer ready,
     * heroImageUrl stays NULL and /destinations uses its
     * existing safe fallback.
     */
    let heroImageUrl:
        string |
        null =
        null;

    if (
        settings.heroMediaId
    ) {
        const [
            hero,
        ] =
            await database
                .select({
                    url:
                    media.url,
                })
                .from(
                    media,
                )
                .where(
                    and(
                        eq(
                            media.id,
                            settings.heroMediaId,
                        ),

                        eq(
                            media.type,
                            "image",
                        ),

                        eq(
                            media.lifecycleStatus,
                            "ready",
                        ),
                    ),
                )
                .limit(1);

        if (
            hero
        ) {
            heroImageUrl =
                hero.url.startsWith("/")
                    ? hero.url
                    : resolveAssetReference(
                        hero.url,
                    ) ||
                    hero.url;
        }
    }

    /*
     * Filters always come LIVE from Other Settings.
     *
     * Admin adds/removes/renames options there
     * and /destinations immediately reflects them.
     */
    const optionRows =
        await database
            .select({
                id:
                cmsOtherSettingsOptions.id,

                groupKey:
                cmsOtherSettingsOptions.groupKey,

                name:
                cmsOtherSettingsOptions.name,

                sortOrder:
                cmsOtherSettingsOptions.sortOrder,
            })
            .from(
                cmsOtherSettingsOptions,
            )
            .where(
                inArray(
                    cmsOtherSettingsOptions.groupKey,
                    [
                        "destination_type",
                        "difficulty",
                    ],
                ),
            )
            .orderBy(
                asc(
                    cmsOtherSettingsOptions.groupKey,
                ),

                asc(
                    cmsOtherSettingsOptions.sortOrder,
                ),

                asc(
                    cmsOtherSettingsOptions.name,
                ),
            );

    const destinationTypes =
        optionRows
            .filter(
                (
                    option,
                ) =>
                    option.groupKey ===
                    "destination_type",
            )
            .map(
                (
                    option,
                ) => ({
                    id:
                    option.id,

                    name:
                    option.name,
                }),
            );

    const difficulties =
        optionRows
            .filter(
                (
                    option,
                ) =>
                    option.groupKey ===
                    "difficulty",
            )
            .map(
                (
                    option,
                ) => ({
                    id:
                    option.id,

                    name:
                    option.name,
                }),
            );

    return {
        subtitle:
        settings.subtitle,

        title:
        settings.title,

        description:
        settings.description,

        searchTitle:
        settings.searchTitle,

        searchPlaceholder:
        settings.searchPlaceholder,

        heroImageUrl,

        destinationTypes,

        difficulties,
    };
}