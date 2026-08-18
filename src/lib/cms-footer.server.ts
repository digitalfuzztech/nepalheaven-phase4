import { eq } from "drizzle-orm";

import { db } from "@/db";

import {
    cmsFooterSettings,
} from "@/db/schema/cms-foundation";

import {
    requireAdmin,
} from "@/lib/auth.server";

import {
    cmsFooterSettingsInputSchema,
    type CmsFooterSettingsInput,
} from "@/lib/cms-footer.schema";
import {
    validateCmsSelectableImageIds,
} from "@/lib/cms-media.server";
function emptyToNull(
    value: string,
) {
    const trimmed =
        value.trim();

    return trimmed.length > 0
        ? trimmed
        : null;
}

/*
|--------------------------------------------------------------------------
| Read
|--------------------------------------------------------------------------
*/

export async function getCmsFooterSettings() {
    await requireAdmin();

    if (!db) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    const [footer] =
        await db
            .select({
                id:
                cmsFooterSettings.id,

                key:
                cmsFooterSettings.key,

                companyDescription:
                cmsFooterSettings.companyDescription,

                journalDescription:
                cmsFooterSettings.journalDescription,

                logoMediaId:
                cmsFooterSettings.logoMediaId,

                updatedByUserId:
                cmsFooterSettings.updatedByUserId,

                updatedAt:
                cmsFooterSettings.updatedAt,
            })
            .from(
                cmsFooterSettings,
            )
            .where(
                eq(
                    cmsFooterSettings.key,
                    "footer",
                ),
            )
            .limit(1);

    if (!footer) {
        throw new Error(
            "CMS Footer Settings have not been initialized. Run npm run db:seed:cms.",
        );
    }

    return {
        key:
        footer.key,

        companyDescription:
            footer.companyDescription ??
            "",

        journalDescription:
            footer.journalDescription ??
            "",

        logoMediaId:
        footer.logoMediaId,

        updatedByUserId:
        footer.updatedByUserId,

        updatedAt:
            footer.updatedAt instanceof
            Date
                ? footer.updatedAt.toISOString()
                : String(
                    footer.updatedAt,
                ),
    };
}

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

export async function updateCmsFooterSettings(
    input:
    CmsFooterSettingsInput,
) {
    const admin =
        await requireAdmin();

    if (!db) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    const data =
        cmsFooterSettingsInputSchema.parse(
            input,
        );
    await validateCmsSelectableImageIds(
        [
            data.logoMediaId,
        ],
    );
    const [footer] =
        await db
            .select({
                id:
                cmsFooterSettings.id,
            })
            .from(
                cmsFooterSettings,
            )
            .where(
                eq(
                    cmsFooterSettings.key,
                    "footer",
                ),
            )
            .limit(1);

    if (!footer) {
        throw new Error(
            "CMS Footer Settings have not been initialized.",
        );
    }

    await db
        .update(
            cmsFooterSettings,
        )
        .set({
            companyDescription:
                emptyToNull(
                    data.companyDescription,
                ),

            journalDescription:
                emptyToNull(
                    data.journalDescription,
                ),

            updatedByUserId:
            admin.id,

            updatedAt:
                new Date(),

            logoMediaId:
            data.logoMediaId,
        })
        .where(
            eq(
                cmsFooterSettings.id,
                footer.id,
            ),
        );

    return getCmsFooterSettings();
}