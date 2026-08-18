import {
    and,
    asc,
    eq,
    inArray,
} from "drizzle-orm";

import { db } from "@/db";

import {
    cmsGeneralSettings,
    cmsNavigationItems,
    cmsNavigationMenus,
} from "@/db/schema/cms-foundation";

import {
    media,
} from "@/db/schema/media";

import type {
    Company,
    PublicBranding,
    PublicNavigationItem,
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
function validExternalUrl(
    value: string,
) {
    try {
        const url =
            new URL(value);

        return (
            url.protocol ===
            "http:" ||
            url.protocol ===
            "https:"
        );
    } catch {
        return false;
    }
}

export async function getPublicCmsPrimaryNavigation():
    Promise<
        PublicNavigationItem[] |
        null
    > {
    if (!db) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    const [menu] =
        await db
            .select({
                id:
                cmsNavigationMenus.id,
            })
            .from(
                cmsNavigationMenus,
            )
            .where(
                eq(
                    cmsNavigationMenus.key,
                    "primary",
                ),
            )
            .limit(1);

    if (!menu) {
        return null;
    }

    const rows =
        await db
            .select({
                label:
                cmsNavigationItems.label,

                linkType:
                cmsNavigationItems.linkType,

                path:
                cmsNavigationItems.path,

                url:
                cmsNavigationItems.url,

                openNewTab:
                cmsNavigationItems.openNewTab,
            })
            .from(
                cmsNavigationItems,
            )
            .where(
                and(
                    eq(
                        cmsNavigationItems.menuId,
                        menu.id,
                    ),

                    eq(
                        cmsNavigationItems.enabled,
                        true,
                    ),
                ),
            )
            .orderBy(
                asc(
                    cmsNavigationItems.sortOrder,
                ),
            );

    const items:
        PublicNavigationItem[] =
        [];

    for (
        const row of rows
        ) {
        if (
            row.linkType ===
            "internal"
        ) {
            const path =
                row.path?.trim();

            if (
                !path ||
                !path.startsWith("/")
            ) {
                continue;
            }

            items.push({
                label:
                row.label,

                href:
                path,

                external:
                    false,

                openNewTab:
                row.openNewTab,
            });

            continue;
        }

        const url =
            row.url?.trim();

        if (
            !url ||
            !validExternalUrl(
                url,
            )
        ) {
            continue;
        }

        items.push({
            label:
            row.label,

            href:
            url,

            external:
                true,

            openNewTab:
            row.openNewTab,
        });
    }

    return items;
}