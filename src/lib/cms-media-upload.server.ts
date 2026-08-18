import {
    randomUUID,
} from "node:crypto";

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
    cmsMediaUploadMetadataSchema,
} from "@/lib/cms-media.schema";

import {
    getCmsMedia,
} from "@/lib/cms-media.server";

import {
    resolveCmsMediaClassification,
} from "@/lib/cms-media-classification.server";

import {
    removeCmsMediaStoredFile,
    storeCmsMediaUpload,
} from "@/lib/cms-media-storage.server";

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

function formNullableId(
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

function emptyToNull(
    value:
    string,
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
     * Authorize before file buffering.
     */
    const admin =
        await requireAdmin();

    if (
        !db
    ) {
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

                categoryOptionId:
                    formNullableId(
                        formData,
                        "categoryOptionId",
                    ),

                associatedToId:
                    formNullableId(
                        formData,
                        "associatedToId",
                    ),
            },
        );

    /*
     * Validate category + dependent
     * association before writing file.
     */
    const classification =
        await resolveCmsMediaClassification(
            metadata.categoryOptionId,
            metadata.associatedToId,
        );

    const stored =
        await storeCmsMediaUpload(
            fileEntry,
        );

    const id =
        randomUUID();

    try {
        await db
            .insert(
                media,
            )
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

                /*
                 * Legacy text remains populated
                 * temporarily for compatibility.
                 */
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
         * Prevent orphaned disk file.
         */
        await removeCmsMediaStoredFile(
            stored.storageKey,
        ).catch(
            () =>
                undefined,
        );

        throw error;
    }

    return getCmsMedia(
        id,
    );
}