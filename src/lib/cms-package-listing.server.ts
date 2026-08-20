import { randomUUID } from "node:crypto";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { cmsPages, cmsPageSections } from "@/db/schema/cms-foundation";
import { cmsOtherSettingsOptions } from "@/db/schema/cms-other-settings";
import { media } from "@/db/schema/media";
import { requireAdmin } from "@/lib/auth.server";
import { resolveAssetReference } from "@/lib/asset-resolver";
import {
  cmsPackageListingPageSchema,
  type CmsPackageListingPageInput,
} from "@/lib/cms-package-listing.schema";
import { validateCmsSelectableImageIds } from "@/lib/cms-media.server";

const PAGE_KEY = "packages-index";
const SECTION_KEY = "listing-page";
const defaults: CmsPackageListingPageInput = {
  heroMediaId: null,
  subtitle: "Curated journeys",
  title: "Tour packages built by people who walk them",
  description:
    "Every price includes permits, guides and transfers. No hidden fees at the trailhead.",
  searchPlaceholder: "Search packages…",
};

function database() {
  if (!db) throw new Error("Database connection is not configured.");
  return db;
}

async function readSettings() {
  const [page] = await database()
    .select({ id: cmsPages.id })
    .from(cmsPages)
    .where(eq(cmsPages.key, PAGE_KEY))
    .limit(1);
  if (!page) return { ...defaults };
  const [section] = await database()
    .select({ content: cmsPageSections.content })
    .from(cmsPageSections)
    .where(
      and(
        eq(cmsPageSections.pageId, page.id),
        eq(cmsPageSections.sectionKey, SECTION_KEY),
      ),
    )
    .limit(1);
  if (!section) return { ...defaults };
  try {
    const parsed = cmsPackageListingPageSchema.safeParse(
      JSON.parse(section.content),
    );
    if (parsed.success) return parsed.data;
  } catch {
    /* safe fallback */
  }
  return { ...defaults };
}

export async function getCmsPackageListingPage() {
  await requireAdmin();
  return readSettings();
}

async function validateWebsiteHero(id: string | null) {
  await validateCmsSelectableImageIds([id]);
  if (!id) return;
  const [item] = await database()
    .select({
      categoryOptionId: media.categoryOptionId,
      category: media.category,
      generalSettingsTypeOptionId: media.generalSettingsTypeOptionId,
    })
    .from(media)
    .where(eq(media.id, id))
    .limit(1);
  if (!item) throw new Error("The selected image is no longer available.");
  if (!item.categoryOptionId && !item.category?.trim()) return;
  const optionIds = [
    item.categoryOptionId,
    item.generalSettingsTypeOptionId,
  ].filter((value): value is string => Boolean(value));
  const options = optionIds.length
    ? await database()
        .select()
        .from(cmsOtherSettingsOptions)
        .where(inArray(cmsOtherSettingsOptions.id, optionIds))
    : [];
  const category = options.find(
    (option) => option.id === item.categoryOptionId,
  );
  const generalType = options.find(
    (option) => option.id === item.generalSettingsTypeOptionId,
  );
  const categoryValue = category?.value ?? item.category?.trim().toLowerCase();
  if (categoryValue !== "general" || generalType?.value !== "website-media") {
    throw new Error(
      "Package listing hero must be uncategorized or General → Website Media.",
    );
  }
}

export async function updateCmsPackageListingPage(
  input: CmsPackageListingPageInput,
) {
  const admin = await requireAdmin();
  const data = cmsPackageListingPageSchema.parse(input);
  await validateWebsiteHero(data.heroMediaId);
  let [page] = await database()
    .select({ id: cmsPages.id })
    .from(cmsPages)
    .where(eq(cmsPages.key, PAGE_KEY))
    .limit(1);
  if (!page) {
    const id = randomUUID();
    await database()
      .insert(cmsPages)
      .values({
        id,
        key: PAGE_KEY,
        name: "Packages Listing",
        routePath: "/packages",
        status: "published",
        updatedByUserId: admin.id,
      });
    page = { id };
  }
  const content = JSON.stringify(data);
  await database()
    .insert(cmsPageSections)
    .values({
      id: randomUUID(),
      pageId: page.id,
      sectionKey: SECTION_KEY,
      schemaVersion: 1,
      content,
      enabled: true,
      sortOrder: 0,
      updatedByUserId: admin.id,
    })
    .onDuplicateKeyUpdate({
      set: {
        content,
        enabled: true,
        updatedByUserId: admin.id,
        updatedAt: new Date(),
      },
    });
  return readSettings();
}

export async function getPublicPackageListingPage() {
  const settings = await readSettings();
  let heroImageUrl: string | null = null;
  if (settings.heroMediaId) {
    const [hero] = await database()
      .select({ url: media.url })
      .from(media)
      .where(
        and(
          eq(media.id, settings.heroMediaId),
          eq(media.type, "image"),
          eq(media.lifecycleStatus, "ready"),
        ),
      )
      .limit(1);
    if (hero)
      heroImageUrl = hero.url.startsWith("/")
        ? hero.url
        : resolveAssetReference(hero.url) || hero.url;
  }
  const options = await database()
    .select({
      id: cmsOtherSettingsOptions.id,
      name: cmsOtherSettingsOptions.name,
      groupKey: cmsOtherSettingsOptions.groupKey,
    })
    .from(cmsOtherSettingsOptions)
    .where(
      inArray(cmsOtherSettingsOptions.groupKey, ["package_type", "difficulty"]),
    )
    .orderBy(
      asc(cmsOtherSettingsOptions.sortOrder),
      asc(cmsOtherSettingsOptions.name),
    );
  return {
    ...settings,
    heroImageUrl,
    packageTypes: options.filter((option) => option.groupKey === "package_type"),
    difficulties: options.filter((option) => option.groupKey === "difficulty"),
  };
}
