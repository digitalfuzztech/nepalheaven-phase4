import {
    eq,
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
} from "@/lib/cms-media.schema";

import {
    removeCmsMediaStoredFile,
} from "@/lib/cms-media-storage.server";

export async function deleteCmsMedia(
    inputId:
    string,
) {
    await requireAdmin();

    if (!db) {
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
            .select({
                id:
                media.id,

                storageProvider:
                media.storageProvider,

                storageKey:
                media.storageKey,
            })
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

    /*
     * Delete the DB record first.
     *
     * Existing Media foreign keys in the CMS use:
     *
     * ON DELETE SET NULL
     *
     * Therefore logos, favicon, page OG images, etc. safely lose the
     * deleted reference and their existing fallback behavior can take over.
     */

    await db
        .delete(
            media,
        )
        .where(
            eq(
                media.id,
                id,
            ),
        );

    let fileCleanupWarning:
        string | null =
        null;

    /*
     * Delete locally stored public Media only after the DB record has been
     * removed successfully.
     *
     * A disk-cleanup problem must not recreate or leave a broken DB
     * reference.
     */

    if (
        record.storageProvider ===
        "local-filesystem" &&
        record.storageKey
    ) {
        try {
            await removeCmsMediaStoredFile(
                record.storageKey,
            );
        } catch (
            error
            ) {
            console.error(
                "Media DB record was deleted but stored-file cleanup failed.",
                error,
            );

            fileCleanupWarning =
                "The Media record was deleted, but the stored file could not be cleaned up automatically.";
        }
    }

    return {
        id,

        deleted:
            true,

        fileCleanupWarning,
    };
}