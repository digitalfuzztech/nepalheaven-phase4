import { randomUUID } from "node:crypto";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { destinations } from "@/db/schema/destinations";
import { cmsOtherSettingsOptions } from "@/db/schema/cms-other-settings";
import {
  packageDestinations,
  packageExclusions,
  packageFaqs,
  packageHighlights,
  packageInclusions,
  packageItineraries,
  packageReviews,
  packages,
  packageTiers,
} from "@/db/schema/packages";
import { requireAdmin } from "@/lib/auth.server";
import {
  cmsPackageSaveSchema,
  type CmsPackageSaveInput,
} from "@/lib/cms-packages.schema";
import { removeCmsMediaStoredFile } from "@/lib/cms-media-storage.server";
import { storeCmsPackageMainImage } from "@/lib/cms-package-main-image.server";

function database() {
  if (!db) throw new Error("Database connection is not configured.");
  return db;
}

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) throw new Error("Package title must contain a letter or number.");
  return slug.slice(0, 180);
}

function durationLabel(min: number, max: number) {
  return min === max
    ? `${min} Day${min === 1 ? "" : "s"}`
    : `${min}–${max} Days`;
}

function dayLabel(min: number, max: number) {
  return min === max ? `Day ${min}` : `Day ${min}–${max}`;
}

async function getOption(id: string, groupKey: string) {
  const [option] = await database()
    .select({
      id: cmsOtherSettingsOptions.id,
      name: cmsOtherSettingsOptions.name,
    })
    .from(cmsOtherSettingsOptions)
    .where(
      and(
        eq(cmsOtherSettingsOptions.id, id),
        eq(cmsOtherSettingsOptions.groupKey, groupKey),
      ),
    )
    .limit(1);
  if (!option)
    throw new Error(
      `The selected ${groupKey.replaceAll("_", " ")} option no longer exists.`,
    );
  return option;
}

async function validateReferences(input: CmsPackageSaveInput) {
  const selectedTierOptionIds = input.tiers.flatMap((item) =>
    item.tierOptionId ? [item.tierOptionId] : [],
  );
  const [packageType, difficulty, tierOptions, destinationRows] =
    await Promise.all([
      getOption(input.packageTypeOptionId, "package_type"),
      getOption(input.difficultyOptionId, "difficulty"),
      selectedTierOptionIds.length
        ? database()
            .select({
              id: cmsOtherSettingsOptions.id,
              name: cmsOtherSettingsOptions.name,
            })
            .from(cmsOtherSettingsOptions)
            .where(
              and(
                eq(cmsOtherSettingsOptions.groupKey, "package_pricing_tier"),
                inArray(
                  cmsOtherSettingsOptions.id,
                  selectedTierOptionIds,
                ),
              ),
            )
        : Promise.resolve([]),
      input.destinationIds.length
        ? database()
            .select({ id: destinations.id, name: destinations.name })
            .from(destinations)
            .where(inArray(destinations.id, input.destinationIds))
        : Promise.resolve([]),
    ]);
  const tierById = new Map(tierOptions.map((item) => [item.id, item]));
  if (
    tierById.size !== new Set(selectedTierOptionIds).size
  )
    throw new Error("One or more pricing tiers no longer exist.");
  if (destinationRows.length !== input.destinationIds.length)
    throw new Error("One or more selected destinations no longer exist.");
  return { packageType, difficulty, tierById, destinationRows };
}

export type CmsPackageListItem = {
  id: string;
  title: string;
  slug: string;
  style: string | null;
  duration: string;
  difficulty: string | null;
  startingPrice: number;
  currency: string;
  status: boolean;
};

export async function getCmsPackages(): Promise<CmsPackageListItem[]> {
  await requireAdmin();
  const rows = await database()
    .select()
    .from(packages)
    .orderBy(asc(packages.sortOrder), asc(packages.title));
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    style: row.style,
    duration:
      row.durationMinDays && row.durationMaxDays
        ? durationLabel(row.durationMinDays, row.durationMaxDays)
        : row.days
          ? `${row.days} Days`
          : "—",
    difficulty: row.difficulty,
    startingPrice: Number(row.startingPrice ?? 0),
    currency: row.currency,
    status: row.status,
  }));
}

export async function getCmsPackageEditorData(id?: string) {
  await requireAdmin();
  const allDestinations = await database()
    .select({
      id: destinations.id,
      name: destinations.name,
      status: destinations.status,
    })
    .from(destinations)
    .orderBy(asc(destinations.name));
  if (!id) return { detail: null, destinations: allDestinations };
  const [pkg] = await database()
    .select()
    .from(packages)
    .where(eq(packages.id, id))
    .limit(1);
  if (!pkg) return null;
  const [
    destinationLinks,
    highlights,
    itineraries,
    tiers,
    inclusions,
    exclusions,
    reviews,
    faqs,
  ] = await Promise.all([
    database()
      .select()
      .from(packageDestinations)
      .where(eq(packageDestinations.packageId, id))
      .orderBy(asc(packageDestinations.sortOrder)),
    database()
      .select()
      .from(packageHighlights)
      .where(eq(packageHighlights.packageId, id))
      .orderBy(asc(packageHighlights.sortOrder)),
    database()
      .select()
      .from(packageItineraries)
      .where(eq(packageItineraries.packageId, id))
      .orderBy(asc(packageItineraries.sortOrder)),
    database()
      .select()
      .from(packageTiers)
      .where(eq(packageTiers.packageId, id))
      .orderBy(asc(packageTiers.sortOrder)),
    database()
      .select()
      .from(packageInclusions)
      .where(eq(packageInclusions.packageId, id))
      .orderBy(asc(packageInclusions.sortOrder)),
    database()
      .select()
      .from(packageExclusions)
      .where(eq(packageExclusions.packageId, id))
      .orderBy(asc(packageExclusions.sortOrder)),
    database()
      .select()
      .from(packageReviews)
      .where(eq(packageReviews.packageId, id))
      .orderBy(asc(packageReviews.sortOrder)),
    database()
      .select()
      .from(packageFaqs)
      .where(eq(packageFaqs.packageId, id))
      .orderBy(asc(packageFaqs.sortOrder)),
  ]);
  return {
    detail: {
      package: pkg,
      destinationLinks,
      highlights,
      itineraries,
      tiers,
      inclusions,
      exclusions,
      reviews,
      faqs,
    },
    destinations: allDestinations,
  };
}

async function uniqueSlug(title: string, currentId?: string) {
  const base = slugify(title);
  let candidate = base;
  let suffix = 2;
  while (true) {
    const [owner] = await database()
      .select({ id: packages.id })
      .from(packages)
      .where(eq(packages.slug, candidate))
      .limit(1);
    if (!owner || owner.id === currentId) return candidate;
    candidate = `${base}-${suffix++}`;
  }
}

async function savePackage(
  input: CmsPackageSaveInput,
  storedImage?: Awaited<ReturnType<typeof storeCmsPackageMainImage>> | null,
) {
  const data = cmsPackageSaveSchema.parse(input);
  const refs = await validateReferences(data);
  const id = data.id ?? randomUUID();
  const slug = await uniqueSlug(data.title, data.id);
  const firstDestination = data.destinationIds[0]
    ? refs.destinationRows.find((item) => item.id === data.destinationIds[0])
    : null;
  await database().transaction(async (tx) => {
    const values = {
      title: data.title,
      slug,
      packageTypeOptionId: refs.packageType.id,
      style: refs.packageType.name,
      shortDescription: data.description,
      description: data.description,
      overview: data.overview,
      durationMinDays: data.durationMinDays,
      durationMaxDays: data.durationMaxDays,
      days: data.durationMaxDays,
      difficultyOptionId: refs.difficulty.id,
      difficulty: refs.difficulty.name,
      groupSizeMin: data.groupSizeMin,
      groupSizeMax: data.groupSizeMax,
      rating: String(data.rating),
      reviewCount: data.reviewCount,
      destinationId: data.destinationIds[0] ?? null,
      destinationLabel: firstDestination?.name ?? null,
      startingPrice: String(data.startingPrice),
      oldPrice: data.oldPrice === null ? null : String(data.oldPrice),
      currency: "USD",
      sortOrder: data.sortOrder,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      updatedAt: new Date(),
    };
    if (data.id) {
      await tx.update(packages).set(values).where(eq(packages.id, id));
      await tx
        .delete(packageDestinations)
        .where(eq(packageDestinations.packageId, id));
      await tx
        .delete(packageHighlights)
        .where(eq(packageHighlights.packageId, id));
      await tx
        .delete(packageItineraries)
        .where(eq(packageItineraries.packageId, id));
      await tx
        .delete(packageInclusions)
        .where(eq(packageInclusions.packageId, id));
      await tx
        .delete(packageExclusions)
        .where(eq(packageExclusions.packageId, id));
      await tx.delete(packageReviews).where(eq(packageReviews.packageId, id));
      await tx.delete(packageFaqs).where(eq(packageFaqs.packageId, id));
    } else {
      await tx
        .insert(packages)
        .values({
          id,
          ...values,
          status: false,
          heroImage: storedImage?.url ?? null,
          heroImageStorageKey: storedImage?.storageKey ?? null,
        });
    }
    if (data.destinationIds.length)
      await tx
        .insert(packageDestinations)
        .values(
          data.destinationIds.map((destinationId, sortOrder) => ({
            id: randomUUID(),
            packageId: id,
            destinationId,
            sortOrder,
          })),
        );
    if (data.highlights.length)
      await tx
        .insert(packageHighlights)
        .values(
          data.highlights.map((item, sortOrder) => ({
            id: randomUUID(),
            packageId: id,
            item,
            sortOrder,
          })),
        );
    if (data.itineraries.length)
      await tx
        .insert(packageItineraries)
        .values(
          data.itineraries.map((item, sortOrder) => ({
            id: randomUUID(),
            packageId: id,
            minDay: item.minDay,
            maxDay: item.maxDay,
            day: item.minDay,
            dayLabel: dayLabel(item.minDay, item.maxDay),
            title: item.title,
            description: item.description,
            sortOrder,
          })),
        );
    const currentTiers = data.id
      ? await tx.select({ id: packageTiers.id }).from(packageTiers).where(eq(packageTiers.packageId, id))
      : [];
    const currentTierIds = new Set(currentTiers.map((item) => item.id));
    for (const item of data.tiers) {
      if (item.id && !currentTierIds.has(item.id)) throw new Error("A pricing record does not belong to this package.");
    }
    const retainedTierIds = new Set(data.tiers.flatMap((item) => item.id ? [item.id] : []));
    const removedTierIds = currentTiers.filter((item) => !retainedTierIds.has(item.id)).map((item) => item.id);
    if (removedTierIds.length) await tx.delete(packageTiers).where(inArray(packageTiers.id, removedTierIds));
    for (const [sortOrder, item] of data.tiers.entries()) {
      const values = {
        tierOptionId: item.tierOptionId,
        name: item.tierOptionId
          ? refs.tierById.get(item.tierOptionId)?.name ?? item.name
          : item.name,
        price: String(item.price),
        description: item.note,
        currency: "USD",
        sortOrder,
      };
      if (item.id) await tx.update(packageTiers).set(values).where(eq(packageTiers.id, item.id));
      else await tx.insert(packageTiers).values({ id: randomUUID(), packageId: id, ...values });
    }
    if (data.inclusions.length)
      await tx
        .insert(packageInclusions)
        .values(
          data.inclusions.map((item, sortOrder) => ({
            id: randomUUID(),
            packageId: id,
            item,
            sortOrder,
          })),
        );
    if (data.exclusions.length)
      await tx
        .insert(packageExclusions)
        .values(
          data.exclusions.map((item, sortOrder) => ({
            id: randomUUID(),
            packageId: id,
            item,
            sortOrder,
          })),
        );
    if (data.reviews.length)
      await tx
        .insert(packageReviews)
        .values(
          data.reviews.map((item, sortOrder) => ({
            id: randomUUID(),
            packageId: id,
            rating: String(item.rating),
            reviewText: item.reviewText,
            customerName: item.customerName,
            customerCountryCode: item.customerCountryCode,
            sortOrder,
          })),
        );
    if (data.faqs.length)
      await tx
        .insert(packageFaqs)
        .values(
          data.faqs.map((item, sortOrder) => ({
            id: randomUUID(),
            packageId: id,
            question: item.question,
            answer: item.answer,
            sortOrder,
          })),
        );
  });
  return { id, slug };
}

export async function createCmsPackageFromFormData(formData: FormData) {
  await requireAdmin();
  const raw = formData.get("packageData");
  if (typeof raw !== "string") throw new Error("Package data is required.");
  const data = cmsPackageSaveSchema.parse(JSON.parse(raw));
  const file = formData.get("mainImage");
  let stored: Awaited<ReturnType<typeof storeCmsPackageMainImage>> | null =
    null;
  if (file && typeof file !== "string" && file.size > 0)
    stored = await storeCmsPackageMainImage(file);
  try {
    return await savePackage(data, stored);
  } catch (error) {
    if (stored)
      await removeCmsMediaStoredFile(stored.storageKey).catch(() => undefined);
    throw error;
  }
}

export async function updateCmsPackage(input: CmsPackageSaveInput) {
  await requireAdmin();
  if (!input.id) throw new Error("Package ID is required.");
  const [existing] = await database()
    .select({ id: packages.id })
    .from(packages)
    .where(eq(packages.id, input.id))
    .limit(1);
  if (!existing) throw new Error("Package could not be found.");
  return savePackage(input);
}

export async function updateCmsPackageStatus(id: string, status: boolean) {
  await requireAdmin();
  const [existing] = await database()
    .select({ id: packages.id })
    .from(packages)
    .where(eq(packages.id, id))
    .limit(1);
  if (!existing) throw new Error("Package could not be found.");
  await database()
    .update(packages)
    .set({ status, updatedAt: new Date() })
    .where(eq(packages.id, id));
  return { id, status };
}

export async function deleteCmsPackage(id: string) {
  await requireAdmin();
  const [existing] = await database()
    .select({
      id: packages.id,
      heroImageStorageKey: packages.heroImageStorageKey,
    })
    .from(packages)
    .where(eq(packages.id, id))
    .limit(1);
  if (!existing) throw new Error("Package could not be found.");
  try {
    await database().delete(packages).where(eq(packages.id, id));
  } catch (error) {
    throw new Error(
      "This package is referenced by an existing booking and cannot be deleted. Unpublish it instead.",
      { cause: error },
    );
  }
  if (existing.heroImageStorageKey)
    await removeCmsMediaStoredFile(existing.heroImageStorageKey).catch(
      (error) => console.error("Package hero cleanup failed.", error),
    );
  return { id };
}
