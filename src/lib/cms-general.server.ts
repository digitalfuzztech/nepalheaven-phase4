import { eq } from "drizzle-orm";

import { db } from "@/db";

import {
    cmsGeneralSettings,
} from "@/db/schema/cms-foundation";

import {
    requireAdmin,
} from "@/lib/auth.server";

import {
    cmsGeneralSettingsInputSchema,
    cmsOfficeHoursSchema,
    type CmsGeneralSettingsInput,
} from "@/lib/cms-general.schema";

function emptyToNull(
    value: string,
) {
    const trimmed = value.trim();

    return trimmed.length > 0
        ? trimmed
        : null;
}

function parseOfficeHours(
    raw: string | null,
) {
    if (!raw) return [];

    try {
        const parsed: unknown =
            JSON.parse(raw);

        const result =
            cmsOfficeHoursSchema.safeParse(
                parsed,
            );

        return result.success
            ? result.data
            : [];
    } catch {
        return [];
    }
}

async function readGeneralSettings() {
    if (!db) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    const [settings] = await db
        .select()
        .from(cmsGeneralSettings)
        .where(
            eq(
                cmsGeneralSettings.key,
                "general",
            ),
        )
        .limit(1);

    if (!settings) {
        throw new Error(
            "CMS General Settings have not been initialized. Run npm run db:seed:cms.",
        );
    }

    return {
        websiteName:
        settings.websiteName,

        companyName:
        settings.companyName,

        tagline:
            settings.tagline ?? "",

        address:
            settings.address ?? "",

        country:
            settings.country ?? "",

        phone:
            settings.phone ?? "",

        whatsapp:
            settings.whatsapp ?? "",

        email:
            settings.email ?? "",

        officeHours:
            parseOfficeHours(
                settings.officeHours,
            ),

        facebookUrl:
            settings.facebookUrl ?? "",

        instagramUrl:
            settings.instagramUrl ?? "",

        youtubeUrl:
            settings.youtubeUrl ?? "",

        tiktokUrl:
            settings.tiktokUrl ?? "",

        linkedinUrl:
            settings.linkedinUrl ?? "",

        xUrl:
            settings.xUrl ?? "",

        copyrightText:
            settings.copyrightText ?? "",

        defaultSeoTitle:
            settings.defaultSeoTitle ??
            "",

        defaultSeoDescription:
            settings.defaultSeoDescription ??
            "",
    } satisfies CmsGeneralSettingsInput;
}

/*
|--------------------------------------------------------------------------
| Read
|--------------------------------------------------------------------------
*/

export async function getCmsGeneralSettings() {
    await requireAdmin();

    return readGeneralSettings();
}

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

export async function updateCmsGeneralSettings(
    input: CmsGeneralSettingsInput,
) {
    const admin =
        await requireAdmin();

    if (!db) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    const data =
        cmsGeneralSettingsInputSchema.parse(
            input,
        );

    const [current] = await db
        .select({
            id: cmsGeneralSettings.id,
        })
        .from(cmsGeneralSettings)
        .where(
            eq(
                cmsGeneralSettings.key,
                "general",
            ),
        )
        .limit(1);

    if (!current) {
        throw new Error(
            "CMS General Settings have not been initialized. Run npm run db:seed:cms.",
        );
    }

    await db
        .update(cmsGeneralSettings)
        .set({
            websiteName:
            data.websiteName,

            companyName:
            data.companyName,

            tagline:
                emptyToNull(
                    data.tagline,
                ),

            address:
                emptyToNull(
                    data.address,
                ),

            country:
                emptyToNull(
                    data.country,
                ),

            phone:
                emptyToNull(
                    data.phone,
                ),

            whatsapp:
                emptyToNull(
                    data.whatsapp,
                ),

            email:
                emptyToNull(
                    data.email,
                ),

            officeHours:
                JSON.stringify(
                    data.officeHours,
                ),

            facebookUrl:
                emptyToNull(
                    data.facebookUrl,
                ),

            instagramUrl:
                emptyToNull(
                    data.instagramUrl,
                ),

            youtubeUrl:
                emptyToNull(
                    data.youtubeUrl,
                ),

            tiktokUrl:
                emptyToNull(
                    data.tiktokUrl,
                ),

            linkedinUrl:
                emptyToNull(
                    data.linkedinUrl,
                ),

            xUrl:
                emptyToNull(
                    data.xUrl,
                ),

            copyrightText:
                emptyToNull(
                    data.copyrightText,
                ),

            defaultSeoTitle:
                emptyToNull(
                    data.defaultSeoTitle,
                ),

            defaultSeoDescription:
                emptyToNull(
                    data.defaultSeoDescription,
                ),

            updatedByUserId:
            admin.id,

            updatedAt:
                new Date(),
        })
        .where(
            eq(
                cmsGeneralSettings.id,
                current.id,
            ),
        );

    return readGeneralSettings();
}