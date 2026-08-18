import {
    and,
    desc,
    eq,
    inArray,
} from "drizzle-orm";

import {
    db,
} from "@/db";

import {
    media,
} from "@/db/schema/media";

import {
    requireAdmin,
} from "@/lib/auth.server";

import {
    cmsMediaIdSchema,
    cmsMediaMetadataUpdateSchema,
    type CmsMediaMetadataUpdateInput,
} from "@/lib/cms-media.schema";

import {
    resolveCmsMediaClassification,
} from "@/lib/cms-media-classification.server";

function emptyToNull(
    value:
    string,
) {
    const trimmed =
        value.trim();

    return trimmed.length >
    0
        ? trimmed
        : null;
}

function serializeDate(
    value:
        Date | string,
) {
    return value instanceof
    Date
        ? value.toISOString()
        : String(
            value,
        );
}

/*
|--------------------------------------------------------------------------
| List
|--------------------------------------------------------------------------
*/

export async function getCmsMediaList() {
    await requireAdmin();

    if (
        !db
    ) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    const rows =
        await db
            .select({
                id:
                media.id,

                type:
                media.type,

                url:
                media.url,

                thumbnailUrl:
                media.thumbnailUrl,

                altText:
                media.altText,

                title:
                media.title,

                caption:
                media.caption,

                provider:
                media.provider,

                originalFilename:
                media.originalFilename,

                storageProvider:
                media.storageProvider,

                mimeType:
                media.mimeType,

                fileSizeBytes:
                media.fileSizeBytes,

                width:
                media.width,

                height:
                media.height,

                durationSeconds:
                media.durationSeconds,

                category:
                media.category,

                categoryOptionId:
                media.categoryOptionId,

                associatedDestinationId:
                media.associatedDestinationId,

                associatedPackageId:
                media.associatedPackageId,

                associatedExperienceId:
                media.associatedExperienceId,

                generalSettingsTypeOptionId:
                media.generalSettingsTypeOptionId,

                lifecycleStatus:
                media.lifecycleStatus,

                createdAt:
                media.createdAt,

                updatedAt:
                media.updatedAt,
            })
            .from(
                media,
            )
            .orderBy(
                desc(
                    media.createdAt,
                ),
            );

    return rows.map(
        (
            row,
        ) => ({
            ...row,

            createdAt:
                serializeDate(
                    row.createdAt,
                ),

            updatedAt:
                serializeDate(
                    row.updatedAt,
                ),
        }),
    );
}

/*
|--------------------------------------------------------------------------
| Detail
|--------------------------------------------------------------------------
*/

export async function getCmsMedia(
    inputId:
    string,
) {
    await requireAdmin();

    if (
        !db
    ) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    const id =
        cmsMediaIdSchema.parse(
            inputId,
        );

    const [
        record,
    ] =
        await db
            .select()
            .from(
                media,
            )
            .where(
                eq(
                    media.id,
                    id,
                ),
            )
            .limit(
                1,
            );

    if (
        !record
    ) {
        throw new Error(
            "Media record was not found.",
        );
    }

    return {
        ...record,

        title:
            record.title ??
            "",

        altText:
            record.altText ??
            "",

        caption:
            record.caption ??
            "",

        category:
            record.category ??
            "",

        createdAt:
            serializeDate(
                record.createdAt,
            ),

        updatedAt:
            serializeDate(
                record.updatedAt,
            ),
    };
}

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

export async function updateCmsMediaMetadata(
    input:
    CmsMediaMetadataUpdateInput,
) {
    await requireAdmin();

    if (
        !db
    ) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    const data =
        cmsMediaMetadataUpdateSchema.parse(
            input,
        );

    const [
        record,
    ] =
        await db
            .select({
                id:
                media.id,
            })
            .from(
                media,
            )
            .where(
                eq(
                    media.id,
                    data.id,
                ),
            )
            .limit(
                1,
            );

    if (
        !record
    ) {
        throw new Error(
            "Media record was not found.",
        );
    }

    const classification =
        await resolveCmsMediaClassification(
            data.categoryOptionId,
            data.associatedToId,
        );

    await db
        .update(
            media,
        )
        .set({
            title:
                emptyToNull(
                    data.title,
                ),

            altText:
                emptyToNull(
                    data.altText,
                ),

            caption:
                emptyToNull(
                    data.caption,
                ),

            category:
            classification.categoryName,

            categoryOptionId:
            classification.categoryOptionId,

            associatedDestinationId:
            classification.associatedDestinationId,

            associatedPackageId:
            classification.associatedPackageId,

            associatedExperienceId:
            classification.associatedExperienceId,

            generalSettingsTypeOptionId:
            classification.generalSettingsTypeOptionId,

            updatedAt:
                new Date(),
        })
        .where(
            eq(
                media.id,
                data.id,
            ),
        );

    return getCmsMedia(
        data.id,
    );
}

/*
|--------------------------------------------------------------------------
| Selectable images
|--------------------------------------------------------------------------
|
| Leave the picker itself unchanged until M3.
|
*/

export async function getCmsSelectableImages() {
    await requireAdmin();

    if (
        !db
    ) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    return db
        .select({
            id:
            media.id,

            url:
            media.url,

            thumbnailUrl:
            media.thumbnailUrl,

            title:
            media.title,

            altText:
            media.altText,

            originalFilename:
            media.originalFilename,

            category:
            media.category,

            categoryOptionId:
            media.categoryOptionId,

            associatedDestinationId:
            media.associatedDestinationId,

            associatedPackageId:
            media.associatedPackageId,

            associatedExperienceId:
            media.associatedExperienceId,

            generalSettingsTypeOptionId:
            media.generalSettingsTypeOptionId,

            width:
            media.width,

            height:
            media.height,
        })
        .from(
            media,
        )
        .where(
            and(
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
        .orderBy(
            desc(
                media.createdAt,
            ),
        );
}

export async function validateCmsSelectableImageIds(
    ids:
    Array<
        string |
        null |
        undefined
    >,
) {
    if (
        !db
    ) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    const uniqueIds = [
        ...new Set(
            ids.filter(
                (
                    id,
                ): id is string =>
                    Boolean(
                        id,
                    ),
            ),
        ),
    ];

    if (
        uniqueIds.length ===
        0
    ) {
        return;
    }

    const rows =
        await db
            .select({
                id:
                media.id,
            })
            .from(
                media,
            )
            .where(
                and(
                    inArray(
                        media.id,
                        uniqueIds,
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
            );

    if (
        rows.length !==
        uniqueIds.length
    ) {
        throw new Error(
            "One or more selected media assets are unavailable or are not ready images.",
        );
    }
}