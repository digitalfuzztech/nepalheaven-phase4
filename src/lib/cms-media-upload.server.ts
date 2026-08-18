import {
    randomUUID,
} from "node:crypto";

import { db } from "@/db";

import {
    media,
} from "@/db/schema/media";

import {
    requireAdmin,
} from "@/lib/auth.server";

import {
    cmsMediaUploadMetadataSchema,
} from "@/lib/cms-media.schema";

import {
    getCmsMedia,
} from "@/lib/cms-media.server";

import {
    removeCmsMediaStoredFile,
    storeCmsMediaUpload,
} from "@/lib/cms-media-storage.server";

function formString(
    formData:
    FormData,
    key: string,
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

function emptyToNull(
    value: string,
) {
    const trimmed =
        value.trim();

    return trimmed
        ? trimmed
        : null;
}

export async function uploadCmsMedia(
    formData:
    FormData,
) {
    /*
     * Authorize BEFORE reading and
     * buffering the uploaded file.
     */
    const admin =
        await requireAdmin();

    if (!db) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    const fileEntry =
        formData.get(
            "file",
        );

    if (
        !fileEntry ||
        typeof fileEntry ===
        "string"
    ) {
        throw new Error(
            "Select a media file to upload.",
        );
    }

    const metadata =
        cmsMediaUploadMetadataSchema.parse(
            {
                title:
                    formString(
                        formData,
                        "title",
                    ),

                altText:
                    formString(
                        formData,
                        "altText",
                    ),

                caption:
                    formString(
                        formData,
                        "caption",
                    ),

                category:
                    formString(
                        formData,
                        "category",
                    ),
            },
        );

    const stored =
        await storeCmsMediaUpload(
            fileEntry,
        );

    const id =
        randomUUID();

    try {
        await db
            .insert(media)
            .values({
                id,

                type:
                stored.type,

                url:
                stored.url,

                originalFilename:
                stored.originalFilename,

                storageProvider:
                stored.storageProvider,

                storageKey:
                stored.storageKey,

                mimeType:
                stored.mimeType,

                fileSizeBytes:
                stored.fileSizeBytes,

                title:
                    emptyToNull(
                        metadata.title,
                    ),

                altText:
                    emptyToNull(
                        metadata.altText,
                    ),

                caption:
                    emptyToNull(
                        metadata.caption,
                    ),

                category:
                    emptyToNull(
                        metadata.category,
                    ),

                lifecycleStatus:
                    "ready",

                processingError:
                    null,

                createdByUserId:
                admin.id,
            });
    } catch (
        error
        ) {
        /*
         * Avoid orphaning a disk file if
         * the database insert fails.
         */
        await removeCmsMediaStoredFile(
            stored.storageKey,
        ).catch(
            () => undefined,
        );

        throw error;
    }

    return getCmsMedia(
        id,
    );
}