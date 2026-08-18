import {
    and,
    eq,
    inArray,
} from "drizzle-orm";

import { db } from "@/db";

import {
    cmsGeneralSettings,
} from "@/db/schema/cms-foundation";

import {
    media,
} from "@/db/schema/media";

import type {
    Company,
    PublicBranding,
} from "@/lib/content.types";

function parseOfficeHours(
    value: string | null,
):
    | Company["hours"]
    | null {
    if (!value) {
        return null;
    }

    try {
        const parsed:
            unknown =
            JSON.parse(value);

        if (
            !Array.isArray(
                parsed,
            )
        ) {
            return null;
        }

        const rows =
            parsed.filter(
                (
                    item,
                ): item is {
                    day: string;
                    time: string;
                } =>
                    Boolean(
                        item,
                    ) &&
                    typeof item ===
                    "object" &&
                    typeof (
                        item as {
                            day?: unknown;
                        }
                    ).day ===
                    "string" &&
                    typeof (
                        item as {
                            time?: unknown;
                        }
                    ).time ===
                    "string",
            );

        return rows;
    } catch {
        return null;
    }
}

export async function getPublicCmsGlobalSettings() {
    if (!db) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    const [settings] =
        await db
            .select()
            .from(
                cmsGeneralSettings,
            )
            .where(
                eq(
                    cmsGeneralSettings.key,
                    "general",
                ),
            )
            .limit(1);

    /*
     * Missing CMS row means the public
     * content layer should continue using
     * the legacy Phase 3 fallback.
     */
    if (!settings) {
        return null;
    }

    const mediaIds = [
        settings.mainLogoMediaId,
        settings.lightLogoMediaId,
        settings.faviconMediaId,
        settings.defaultOgImageMediaId,
    ].filter(
        (
            value,
        ): value is string =>
            Boolean(value),
    );

    const mediaRows =
        mediaIds.length ===
        0
            ? []
            : await db
                .select({
                    id:
                    media.id,

                    url:
                    media.url,
                })
                .from(media)
                .where(
                    and(
                        inArray(
                            media.id,
                            mediaIds,
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

    const mediaUrls =
        new Map(
            mediaRows.map(
                (item) => [
                    item.id,
                    item.url,
                ],
            ),
        );

    function mediaUrl(
        id:
            | string
            | null,
    ) {
        if (!id) {
            return null;
        }

        return (
            mediaUrls.get(
                id,
            ) ?? null
        );
    }

    const company: Company = {
        name:
        settings.websiteName,

        tagline:
            settings.tagline ??
            "",

        phone:
            settings.phone ??
            "",

        whatsapp:
            settings.whatsapp ??
            "",

        email:
            settings.email ??
            "",

        address:
            settings.address ??
            "",

        hours:
            parseOfficeHours(
                settings.officeHours,
            ) ?? [],
    };

    const branding:
        PublicBranding = {
        companyName:
        settings.companyName,

        mainLogoUrl:
            mediaUrl(
                settings.mainLogoMediaId,
            ),

        lightLogoUrl:
            mediaUrl(
                settings.lightLogoMediaId,
            ),

        faviconUrl:
            mediaUrl(
                settings.faviconMediaId,
            ),

        defaultOgImageUrl:
            mediaUrl(
                settings.defaultOgImageMediaId,
            ),

        defaultSeoTitle:
            settings.defaultSeoTitle ??
            "",

        defaultSeoDescription:
            settings.defaultSeoDescription ??
            "",

        copyrightText:
            settings.copyrightText ??
            "",

        socialLinks: {
            facebook:
                settings.facebookUrl ??
                "",

            instagram:
                settings.instagramUrl ??
                "",

            youtube:
                settings.youtubeUrl ??
                "",

            tiktok:
                settings.tiktokUrl ??
                "",

            linkedin:
                settings.linkedinUrl ??
                "",

            x:
                settings.xUrl ??
                "",
        },
    };

    return {
        company,
        branding,
    };
}