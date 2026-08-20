import { and, asc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";

import {
  cmsGeneralSettings,
  cmsNavigationItems,
  cmsNavigationMenus,
  cmsFooterSettings,
} from "@/db/schema/cms-foundation";

import { media } from "@/db/schema/media";

import type {
  Company,
  PublicBranding,
  PublicNavigationItem,
  PublicFooterContent,
} from "@/lib/content.types";

function parseOfficeHours(value: string | null): Company["hours"] | null {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return null;
    }

    const rows = parsed.filter(
      (
        item,
      ): item is {
        day: string;
        time: string;
      } =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (
          item as {
            day?: unknown;
          }
        ).day === "string" &&
        typeof (
          item as {
            time?: unknown;
          }
        ).time === "string",
    );

    return rows;
  } catch {
    return null;
  }
}

export async function getPublicCmsGlobalSettings() {
  if (!db) {
    throw new Error("Database connection is not configured.");
  }

  const [settings] = await db
    .select()
    .from(cmsGeneralSettings)
    .where(eq(cmsGeneralSettings.key, "general"))
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
  ].filter((value): value is string => Boolean(value));

  const mediaRows =
    mediaIds.length === 0
      ? []
      : await db
          .select({
            id: media.id,

            url: media.url,
          })
          .from(media)
          .where(
            and(
              inArray(media.id, mediaIds),

              eq(media.type, "image"),

              eq(media.lifecycleStatus, "ready"),
            ),
          );

  const mediaUrls = new Map(mediaRows.map((item) => [item.id, item.url]));

  function mediaUrl(id: string | null) {
    if (!id) {
      return null;
    }

    return mediaUrls.get(id) ?? null;
  }

  const company: Company = {
    name: settings.websiteName,

    tagline: settings.tagline ?? "",

    phone: settings.phone ?? "",

    whatsapp: settings.whatsapp ?? "",

    email: settings.email ?? "",

    address: settings.address ?? "",

    hours: parseOfficeHours(settings.officeHours) ?? [],

    officeLatitude:
      settings.officeLatitude === null ? null : Number(settings.officeLatitude),

    officeLongitude:
      settings.officeLongitude === null
        ? null
        : Number(settings.officeLongitude),
  };

  const branding: PublicBranding = {
    companyName: settings.companyName,

    mainLogoUrl: mediaUrl(settings.mainLogoMediaId),

    lightLogoUrl: mediaUrl(settings.lightLogoMediaId),

    faviconUrl: mediaUrl(settings.faviconMediaId),

    defaultOgImageUrl: mediaUrl(settings.defaultOgImageMediaId),

    defaultSeoTitle: settings.defaultSeoTitle ?? "",

    defaultSeoDescription: settings.defaultSeoDescription ?? "",

    copyrightText: settings.copyrightText ?? "",

    socialLinks: {
      facebook: settings.facebookUrl ?? "",

      instagram: settings.instagramUrl ?? "",

      youtube: settings.youtubeUrl ?? "",

      tiktok: settings.tiktokUrl ?? "",

      linkedin: settings.linkedinUrl ?? "",

      x: settings.xUrl ?? "",
    },
  };

  return {
    company,
    branding,
  };
}
function validExternalUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function getPublicCmsPrimaryNavigation(): Promise<
  PublicNavigationItem[] | null
> {
  if (!db) {
    throw new Error("Database connection is not configured.");
  }

  const [menu] = await db
    .select({
      id: cmsNavigationMenus.id,
    })
    .from(cmsNavigationMenus)
    .where(eq(cmsNavigationMenus.key, "primary"))
    .limit(1);

  if (!menu) {
    return null;
  }

  const rows = await db
    .select({
      label: cmsNavigationItems.label,

      linkType: cmsNavigationItems.linkType,

      path: cmsNavigationItems.path,

      url: cmsNavigationItems.url,

      openNewTab: cmsNavigationItems.openNewTab,
    })
    .from(cmsNavigationItems)
    .where(
      and(
        eq(cmsNavigationItems.menuId, menu.id),

        eq(cmsNavigationItems.enabled, true),
      ),
    )
    .orderBy(asc(cmsNavigationItems.sortOrder));

  const items: PublicNavigationItem[] = [];

  for (const row of rows) {
    if (row.linkType === "internal") {
      const path = row.path?.trim();

      if (!path || !path.startsWith("/")) {
        continue;
      }

      items.push({
        label: row.label,

        href: path,

        external: false,

        openNewTab: row.openNewTab,
      });

      continue;
    }

    const url = row.url?.trim();

    if (!url || !validExternalUrl(url)) {
      continue;
    }

    items.push({
      label: row.label,

      href: url,

      external: true,

      openNewTab: row.openNewTab,
    });
  }

  return items;
}
export async function getPublicCmsFooterContent(): Promise<PublicFooterContent | null> {
  if (!db) {
    throw new Error("Database connection is not configured.");
  }

  /*
   * Footer settings
   */
  const [footer] = await db
    .select({
      companyDescription: cmsFooterSettings.companyDescription,

      journalDescription: cmsFooterSettings.journalDescription,

      logoMediaId: cmsFooterSettings.logoMediaId,
    })
    .from(cmsFooterSettings)
    .where(eq(cmsFooterSettings.key, "footer"))
    .limit(1);

  /*
   * If the canonical Footer row does not
   * exist, the React Footer will keep
   * using its Phase 3 fallback content.
   */
  if (!footer) {
    return null;
  }

  /*
   * Resolve Footer-specific logo.
   */
  let logoUrl: string | null = null;

  if (footer.logoMediaId) {
    const [logo] = await db
      .select({
        url: media.url,
      })
      .from(media)
      .where(
        and(
          eq(media.id, footer.logoMediaId),

          eq(media.type, "image"),

          eq(media.lifecycleStatus, "ready"),
        ),
      )
      .limit(1);

    logoUrl = logo?.url ?? null;
  }

  const footerMenuKeys = [
    "footer_company",
    "footer_destinations",
    "footer_journal",
    "footer_legal",
  ];

  /*
   * Read enabled Footer navigation items.
   */
  const rows = await db
    .select({
      menuKey: cmsNavigationMenus.key,

      label: cmsNavigationItems.label,

      linkType: cmsNavigationItems.linkType,

      path: cmsNavigationItems.path,

      url: cmsNavigationItems.url,

      openNewTab: cmsNavigationItems.openNewTab,

      sortOrder: cmsNavigationItems.sortOrder,
    })
    .from(cmsNavigationItems)
    .innerJoin(
      cmsNavigationMenus,
      eq(cmsNavigationItems.menuId, cmsNavigationMenus.id),
    )
    .where(
      and(
        inArray(cmsNavigationMenus.key, footerMenuKeys),

        eq(cmsNavigationItems.enabled, true),
      ),
    )
    .orderBy(
      asc(cmsNavigationMenus.key),

      asc(cmsNavigationItems.sortOrder),
    );

  const menus: PublicFooterContent["menus"] = {
    company: [],
    destinations: [],
    journal: [],
    legal: [],
  };

  for (const row of rows) {
    let href: string | null = null;

    let external = false;

    if (row.linkType === "internal") {
      const path = row.path?.trim();

      if (path && path.startsWith("/")) {
        href = path;
      }
    } else {
      const url = row.url?.trim();

      if (url && validExternalUrl(url)) {
        href = url;

        external = true;
      }
    }

    /*
     * Skip malformed navigation rows
     * rather than exposing bad links.
     */
    if (!href) {
      continue;
    }

    const item: PublicNavigationItem = {
      label: row.label,

      href,

      external,

      openNewTab: row.openNewTab,
    };

    switch (row.menuKey) {
      case "footer_company":
        menus.company.push(item);
        break;

      case "footer_destinations":
        menus.destinations.push(item);
        break;

      case "footer_journal":
        menus.journal.push(item);
        break;

      case "footer_legal":
        menus.legal.push(item);
        break;
    }
  }

  return {
    companyDescription: footer.companyDescription ?? "",

    journalDescription: footer.journalDescription ?? "",

    logoUrl,

    menus,
  };
}
