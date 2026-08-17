import { randomUUID } from "node:crypto";

import {
    eq,
    inArray,
    sql,
} from "drizzle-orm";

import { db } from "../src/db/index.ts";

import {
    cmsFooterSettings,
    cmsGeneralSettings,
    cmsNavigationItems,
    cmsNavigationMenus,
    cmsPages,
} from "../src/db/schema/cms-foundation.ts";

import { siteSettings } from "../src/db/schema/cms.ts";

import {
    cmsNavigationMenuDefinitions,
    cmsPageDefinitions,
    cmsPrimaryNavigationDefaults,
} from "../src/lib/cms-config.ts";

if (!db) {
    throw new Error(
        "DATABASE_URL is required to initialize the CMS foundation.",
    );
}

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function parseJsonObject(
    raw: string | null | undefined,
): Record<string, unknown> {
    if (!raw) return {};

    try {
        const value: unknown = JSON.parse(raw);

        if (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value)
        ) {
            return value as Record<string, unknown>;
        }
    } catch {
        // Legacy setting is malformed; use safe defaults below.
    }

    return {};
}

function normalizeJsonArray(
    raw: string | null | undefined,
): string | null {
    if (!raw) return null;

    try {
        const value: unknown = JSON.parse(raw);

        if (Array.isArray(value)) {
            return JSON.stringify(value);
        }
    } catch {
        // Ignore malformed legacy data.
    }

    return null;
}

function stringValue(
    value: unknown,
    fallback: string | null = null,
) {
    return typeof value === "string"
        ? value
        : fallback;
}

/*
|--------------------------------------------------------------------------
| Read current legacy company settings
|--------------------------------------------------------------------------
|
| We COPY the current values into the new CMS foundation.
|
| We do NOT delete or modify site_settings.
|
*/

const legacyRows = await db
    .select({
        key: siteSettings.key,
        value: siteSettings.value,
    })
    .from(siteSettings)
    .where(
        inArray(siteSettings.key, [
            "company.profile",
            "company.hours",
        ]),
    );

const legacyMap = new Map(
    legacyRows.map((row) => [
        row.key,
        row.value,
    ]),
);

const companyProfile = parseJsonObject(
    legacyMap.get("company.profile"),
);

const companyHours = normalizeJsonArray(
    legacyMap.get("company.hours"),
);

const companyName =
    stringValue(
        companyProfile["name"],
        "Nepal Heaven",
    ) ?? "Nepal Heaven";

/*
|--------------------------------------------------------------------------
| CMS Pages
|--------------------------------------------------------------------------
|
| INSERT-ONLY.
|
| Existing CMS pages are never overwritten by this initializer.
|
*/

for (const page of cmsPageDefinitions) {
    await db
        .insert(cmsPages)
        .values({
            id: randomUUID(),
            key: page.key,
            name: page.name,
            routePath: page.routePath,
            status: "published",
            noIndex: false,
        })
        .onDuplicateKeyUpdate({
            set: {
                id: sql`${cmsPages.id}`,
            },
        });
}

/*
|--------------------------------------------------------------------------
| General Settings
|--------------------------------------------------------------------------
*/

await db
    .insert(cmsGeneralSettings)
    .values({
        id: randomUUID(),

        key: "general",

        websiteName: companyName,

        companyName,

        tagline: stringValue(
            companyProfile["tagline"],
            "Heaven on Earth Awaits.",
        ),

        address: stringValue(
            companyProfile["address"],
        ),

        phone: stringValue(
            companyProfile["phone"],
        ),

        whatsapp: stringValue(
            companyProfile["whatsapp"],
        ),

        email: stringValue(
            companyProfile["email"],
        ),

        officeHours: companyHours,

        copyrightText:
            "Nepal Heaven Travels & Tours Pvt. Ltd. All rights reserved.",

        defaultSeoTitle:
            "Nepal Heaven — Luxury Himalayan Travel & Trekking",

        defaultSeoDescription:
            "Private, expertly crafted journeys across Nepal — Everest, Annapurna, Mustang and beyond. Heaven on Earth Awaits.",
    })
    .onDuplicateKeyUpdate({
        set: {
            id: sql`${cmsGeneralSettings.id}`,
        },
    });

/*
|--------------------------------------------------------------------------
| Footer Settings
|--------------------------------------------------------------------------
|
| These values match the current Phase 3 Footer.
|
*/

await db
    .insert(cmsFooterSettings)
    .values({
        id: randomUUID(),

        key: "footer",

        companyDescription:
            "Fifteen years designing private Himalayan journeys — from the Khumbu icefall to the walled lanes of Lo Manthang. Licensed, insured and locally owned in Kathmandu.",

        journalDescription:
            "Seasonal route notes, permit changes and quiet-season offers. One considered email a month.",
    })
    .onDuplicateKeyUpdate({
        set: {
            id: sql`${cmsFooterSettings.id}`,
        },
    });

/*
|--------------------------------------------------------------------------
| Navigation Menus
|--------------------------------------------------------------------------
*/

for (const menu of cmsNavigationMenuDefinitions) {
    await db
        .insert(cmsNavigationMenus)
        .values({
            id: randomUUID(),
            key: menu.key,
            name: menu.name,
            description: menu.description,
        })
        .onDuplicateKeyUpdate({
            set: {
                id: sql`${cmsNavigationMenus.id}`,
            },
        });
}

/*
|--------------------------------------------------------------------------
| Primary Navigation Items
|--------------------------------------------------------------------------
|
| Only seed the current primary navigation if that menu has no items yet.
|
| This prevents rerunning the seed from overwriting/recreating an
| administrator-customized navigation.
|
*/

const [primaryMenu] = await db
    .select({
        id: cmsNavigationMenus.id,
    })
    .from(cmsNavigationMenus)
    .where(
        eq(
            cmsNavigationMenus.key,
            "primary",
        ),
    )
    .limit(1);

if (!primaryMenu) {
    throw new Error(
        "Primary CMS navigation menu was not created.",
    );
}

const existingPrimaryItems = await db
    .select({
        id: cmsNavigationItems.id,
    })
    .from(cmsNavigationItems)
    .where(
        eq(
            cmsNavigationItems.menuId,
            primaryMenu.id,
        ),
    )
    .limit(1);

if (existingPrimaryItems.length === 0) {
    await db
        .insert(cmsNavigationItems)
        .values(
            cmsPrimaryNavigationDefaults.map(
                (item) => ({
                    id: randomUUID(),

                    menuId: primaryMenu.id,

                    label: item.label,

                    linkType:
                        "internal" as const,

                    path: item.path,

                    sortOrder:
                    item.sortOrder,

                    enabled: true,

                    openNewTab: false,
                }),
            ),
        );
}

/*
|--------------------------------------------------------------------------
| Final verification
|--------------------------------------------------------------------------
*/

const pages = await db
    .select({
        id: cmsPages.id,
    })
    .from(cmsPages);

const generalSettings = await db
    .select({
        id: cmsGeneralSettings.id,
    })
    .from(cmsGeneralSettings);

const footerSettings = await db
    .select({
        id: cmsFooterSettings.id,
    })
    .from(cmsFooterSettings);

const menus = await db
    .select({
        id: cmsNavigationMenus.id,
    })
    .from(cmsNavigationMenus);

const primaryItems = await db
    .select({
        id: cmsNavigationItems.id,
    })
    .from(cmsNavigationItems)
    .where(
        eq(
            cmsNavigationItems.menuId,
            primaryMenu.id,
        ),
    );

console.log(
    [
        "CMS foundation initialized.",
        `Pages: ${pages.length}`,
        `General settings rows: ${generalSettings.length}`,
        `Footer settings rows: ${footerSettings.length}`,
        `Navigation menus: ${menus.length}`,
        `Primary navigation items: ${primaryItems.length}`,
    ].join("\n"),
);

process.exit(0);