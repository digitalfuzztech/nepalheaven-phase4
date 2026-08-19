import {
    eq,
} from "drizzle-orm";

import {
    db,
} from "@/db";

import {
    destinations,
} from "@/db/schema/destinations";

import {
    requireAdmin,
} from "@/lib/auth.server";

import {
    cmsDestinationIdInputSchema,
} from "@/lib/cms-destinations.schema";

import {
    removeCmsMediaStoredFile,
    storeCmsMediaUpload,
} from "@/lib/cms-media-storage.server";

function requireCmsDb() {
    if (!db) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    return db;
}

export async function storeCmsDestinationMainImage(
    file:
    File,
) {
    const stored =
        await storeCmsMediaUpload(
            file,
        );

    if (
        stored.type !==
        "image"
    ) {
        await removeCmsMediaStoredFile(
            stored.storageKey,
        ).catch(
            () =>
                undefined,
        );

        throw new Error(
            "Destination main image must be JPEG, PNG, WebP or GIF.",
        );
    }

    return stored;
}

export async function uploadCmsDestinationMainImage(
    formData:
    FormData,
) {
    await requireAdmin();

    const database =
        requireCmsDb();

    const rawId =
        formData.get(
            "id",
        );

    if (
        typeof rawId !==
        "string"
    ) {
        throw new Error(
            "Destination ID is required.",
        );
    }

    const {
        id,
    } =
        cmsDestinationIdInputSchema.parse(
            {
                id:
                rawId,
            },
        );

    const file =
        formData.get(
            "mainImage",
        );

    if (
        !file ||
        typeof file ===
        "string" ||
        file.size <=
        0
    ) {
        throw new Error(
            "Select an image to upload.",
        );
    }

    const [
        existing,
    ] =
        await database
            .select({
                id:
                destinations.id,

                oldStorageKey:
                destinations.heroImageStorageKey,
            })
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
        !existing
    ) {
        throw new Error(
            "Destination could not be found.",
        );
    }

    const stored =
        await storeCmsDestinationMainImage(
            file,
        );

    try {
        await database
            .update(
                destinations,
            )
            .set({
                heroImage:
                stored.url,

                heroImageStorageKey:
                stored.storageKey,

                updatedAt:
                    new Date(),
            })
            .where(
                eq(
                    destinations.id,
                    id,
                ),
            );
    } catch (
        error
        ) {
        await removeCmsMediaStoredFile(
            stored.storageKey,
        ).catch(
            () =>
                undefined,
        );

        throw error;
    }

    /*
     * Only remove old files that we KNOW were direct Destination uploads.
     *
     * Old legacy heroImage URLs have no heroImageStorageKey and are never
     * deleted automatically.
     */
    if (
        existing.oldStorageKey
    ) {
        await removeCmsMediaStoredFile(
            existing.oldStorageKey,
        ).catch(
            (error) => {
                console.error(
                    "Old Destination main image cleanup failed.",
                    error,
                );
            },
        );
    }

    return {
        id,

        url:
        stored.url,

        storageKey:
        stored.storageKey,
    };
}