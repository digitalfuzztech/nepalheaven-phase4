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
    destinations,
} from "@/db/schema/destinations";

import {
    packages,
} from "@/db/schema/packages";

import {
    experienceCategories,
} from "@/db/schema/experiences";

import {
    requireAdmin,
} from "@/lib/auth.server";

import {
    getCmsMediaAssociationKind,
    type CmsMediaClassificationOptions,
} from "@/lib/cms-media-classification";

function requireCmsDb() {
    if (!db) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    return db;
}

export async function getCmsMediaClassificationOptions():
    Promise<
        CmsMediaClassificationOptions
    > {
    await requireAdmin();

    const database =
        requireCmsDb();

    const [
        categoryRows,
        generalTypeRows,
        destinationRows,
        packageRows,
        experienceRows,
    ] =
        await Promise.all([
            database
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
                    eq(
                        cmsOtherSettingsOptions.groupKey,
                        "category",
                    ),
                )
                .orderBy(
                    asc(
                        cmsOtherSettingsOptions.sortOrder,
                    ),

                    asc(
                        cmsOtherSettingsOptions.name,
                    ),
                ),

            database
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
                    eq(
                        cmsOtherSettingsOptions.groupKey,
                        "general_settings_type",
                    ),
                )
                .orderBy(
                    asc(
                        cmsOtherSettingsOptions.sortOrder,
                    ),

                    asc(
                        cmsOtherSettingsOptions.name,
                    ),
                ),

            database
                .select({
                    id:
                    destinations.id,

                    name:
                    destinations.name,

                    slug:
                    destinations.slug,
                })
                .from(
                    destinations,
                )
                .orderBy(
                    asc(
                        destinations.name,
                    ),
                ),

            database
                .select({
                    id:
                    packages.id,

                    name:
                    packages.title,

                    slug:
                    packages.slug,
                })
                .from(
                    packages,
                )
                .orderBy(
                    asc(
                        packages.title,
                    ),
                ),

            database
                .select({
                    id:
                    experienceCategories.id,

                    name:
                    experienceCategories.name,

                    slug:
                    experienceCategories.slug,
                })
                .from(
                    experienceCategories,
                )
                .orderBy(
                    asc(
                        experienceCategories.name,
                    ),
                ),
        ]);

    return {
        categories:
        categoryRows,

        generalSettingsTypes:
        generalTypeRows,

        destinations:
        destinationRows,

        packages:
        packageRows,

        experiences:
        experienceRows,
    };
}

export async function resolveCmsMediaClassification(
    categoryOptionId:
        string | null,

    associatedToId:
        string | null,
) {
    const database =
        requireCmsDb();

    /*
     * None / Uncategorized
     */
    if (
        !categoryOptionId
    ) {
        if (
            associatedToId
        ) {
            throw new Error(
                "Uncategorised media cannot have an Associated To value.",
            );
        }

        return {
            categoryOptionId:
                null,

            categoryName:
                null,

            associatedDestinationId:
                null,

            associatedPackageId:
                null,

            associatedExperienceId:
                null,

            generalSettingsTypeOptionId:
                null,
        };
    }

    const [
        category,
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
                        categoryOptionId,
                    ),

                    eq(
                        cmsOtherSettingsOptions.groupKey,
                        "category",
                    ),
                ),
            )
            .limit(
                1,
            );

    if (
        !category
    ) {
        throw new Error(
            "The selected Media category no longer exists.",
        );
    }

    const kind =
        getCmsMediaAssociationKind(
            category.value,
        );

    /*
     * Blog and arbitrary categories do not
     * currently use a second association.
     */
    if (
        kind ===
        "none"
    ) {
        if (
            associatedToId
        ) {
            throw new Error(
                "This category does not use an Associated To value.",
            );
        }

        return {
            categoryOptionId:
            category.id,

            categoryName:
            category.name,

            associatedDestinationId:
                null,

            associatedPackageId:
                null,

            associatedExperienceId:
                null,

            generalSettingsTypeOptionId:
                null,
        };
    }

    if (
        !associatedToId
    ) {
        throw new Error(
            "Select what this Media item is associated to.",
        );
    }

    if (
        kind ===
        "destination"
    ) {
        const [
            record,
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
                        associatedToId,
                    ),
                )
                .limit(
                    1,
                );

        if (
            !record
        ) {
            throw new Error(
                "The selected destination no longer exists.",
            );
        }

        return {
            categoryOptionId:
            category.id,

            categoryName:
            category.name,

            associatedDestinationId:
            record.id,

            associatedPackageId:
                null,

            associatedExperienceId:
                null,

            generalSettingsTypeOptionId:
                null,
        };
    }

    if (
        kind ===
        "package"
    ) {
        const [
            record,
        ] =
            await database
                .select({
                    id:
                    packages.id,
                })
                .from(
                    packages,
                )
                .where(
                    eq(
                        packages.id,
                        associatedToId,
                    ),
                )
                .limit(
                    1,
                );

        if (
            !record
        ) {
            throw new Error(
                "The selected package no longer exists.",
            );
        }

        return {
            categoryOptionId:
            category.id,

            categoryName:
            category.name,

            associatedDestinationId:
                null,

            associatedPackageId:
            record.id,

            associatedExperienceId:
                null,

            generalSettingsTypeOptionId:
                null,
        };
    }

    if (
        kind ===
        "experience"
    ) {
        const [
            record,
        ] =
            await database
                .select({
                    id:
                    experienceCategories.id,
                })
                .from(
                    experienceCategories,
                )
                .where(
                    eq(
                        experienceCategories.id,
                        associatedToId,
                    ),
                )
                .limit(
                    1,
                );

        if (
            !record
        ) {
            throw new Error(
                "The selected experience no longer exists.",
            );
        }

        return {
            categoryOptionId:
            category.id,

            categoryName:
            category.name,

            associatedDestinationId:
                null,

            associatedPackageId:
                null,

            associatedExperienceId:
            record.id,

            generalSettingsTypeOptionId:
                null,
        };
    }

    /*
     * General
     */
    const [
        generalType,
    ] =
        await database
            .select({
                id:
                cmsOtherSettingsOptions.id,
            })
            .from(
                cmsOtherSettingsOptions,
            )
            .where(
                and(
                    eq(
                        cmsOtherSettingsOptions.id,
                        associatedToId,
                    ),

                    eq(
                        cmsOtherSettingsOptions.groupKey,
                        "general_settings_type",
                    ),
                ),
            )
            .limit(
                1,
            );

    if (
        !generalType
    ) {
        throw new Error(
            "The selected General Settings Type no longer exists.",
        );
    }

    return {
        categoryOptionId:
        category.id,

        categoryName:
        category.name,

        associatedDestinationId:
            null,

        associatedPackageId:
            null,

        associatedExperienceId:
            null,

        generalSettingsTypeOptionId:
        generalType.id,
    };
}