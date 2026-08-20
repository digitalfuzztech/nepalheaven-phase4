import { randomUUID } from "node:crypto";
import { asc, eq, inArray, notInArray } from "drizzle-orm";
import { db } from "@/db";
import { cmsOtherSettingsOptions } from "@/db/schema/cms-other-settings";
import {
  experienceCategories,
  experienceExclusions,
  experienceFaqs,
  experienceHighlights,
  experienceInclusions,
  experienceItineraries,
  experiencePackages,
} from "@/db/schema/experiences";
import { packages } from "@/db/schema/packages";
import { requireAdmin } from "@/lib/auth.server";
import { removeCmsMediaStoredFile } from "@/lib/cms-media-storage.server";
import { storeCmsExperienceMainImage } from "@/lib/cms-experience-main-image.server";
import {
  cmsExperienceSaveSchema,
  type CmsExperienceSaveInput,
} from "@/lib/cms-experiences.schema";

function database() {
  if (!db) throw new Error("Database connection is not configured.");
  return db;
}
const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "experience";
async function uniqueSlug(title: string, id?: string) {
  const base = slugify(title);
  let candidate = base;
  let n = 2;
  while (true) {
    const [row] = await database()
      .select({ id: experienceCategories.id })
      .from(experienceCategories)
      .where(eq(experienceCategories.slug, candidate))
      .limit(1);
    if (!row || row.id === id) return candidate;
    candidate = `${base}-${n++}`;
  }
}

export type CmsExperienceListItem = {
  id: string;
  slug: string;
  title: string;
  type: string | null;
  status: boolean;
  packageCount: number;
};
export async function getCmsExperiences(): Promise<CmsExperienceListItem[]> {
  await requireAdmin();
  const rows = await database()
    .select()
    .from(experienceCategories)
    .orderBy(
      asc(experienceCategories.sortOrder),
      asc(experienceCategories.name),
    );
  const links = rows.length
    ? await database()
        .select()
        .from(experiencePackages)
        .where(
          inArray(
            experiencePackages.experienceId,
            rows.map((row) => row.id),
          ),
        )
    : [];
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.name,
    type: row.experienceType,
    status: row.status,
    packageCount: links.filter((link) => link.experienceId === row.id).length,
  }));
}

export async function getCmsExperienceEditorData(id?: string) {
  await requireAdmin();
  const packageRows = await database()
    .select({ id: packages.id, title: packages.title, status: packages.status })
    .from(packages)
    .orderBy(asc(packages.title));
  if (!id) return { detail: null, packages: packageRows };
  const [core] = await database()
    .select()
    .from(experienceCategories)
    .where(eq(experienceCategories.id, id))
    .limit(1);
  if (!core) return null;
  const [highlights, itineraries, faqs, inclusions, exclusions, links] =
    await Promise.all([
      database()
        .select()
        .from(experienceHighlights)
        .where(eq(experienceHighlights.experienceId, id))
        .orderBy(asc(experienceHighlights.sortOrder)),
      database()
        .select()
        .from(experienceItineraries)
        .where(eq(experienceItineraries.experienceId, id))
        .orderBy(asc(experienceItineraries.sortOrder)),
      database()
        .select()
        .from(experienceFaqs)
        .where(eq(experienceFaqs.experienceId, id))
        .orderBy(asc(experienceFaqs.sortOrder)),
      database()
        .select()
        .from(experienceInclusions)
        .where(eq(experienceInclusions.experienceId, id))
        .orderBy(asc(experienceInclusions.sortOrder)),
      database()
        .select()
        .from(experienceExclusions)
        .where(eq(experienceExclusions.experienceId, id))
        .orderBy(asc(experienceExclusions.sortOrder)),
      database()
        .select()
        .from(experiencePackages)
        .where(eq(experiencePackages.experienceId, id))
        .orderBy(asc(experiencePackages.sortOrder)),
    ]);
  return {
    detail: {
      core,
      highlights,
      itineraries,
      faqs,
      inclusions,
      exclusions,
      links,
    },
    packages: packageRows,
  };
}

async function resolveType(id: string) {
  const [option] = await database()
    .select()
    .from(cmsOtherSettingsOptions)
    .where(eq(cmsOtherSettingsOptions.id, id))
    .limit(1);
  if (!option || option.groupKey !== "experience_type")
    throw new Error("Select a valid Experience Type.");
  return option;
}

async function save(input: CmsExperienceSaveInput) {
  const data = cmsExperienceSaveSchema.parse(input);
  const type = await resolveType(data.experienceTypeOptionId);
  const id = data.id ?? randomUUID();
  const slug = await uniqueSlug(data.title, data.id);
  if (data.relatedPackageIds.length) {
    const found = await database()
      .select({ id: packages.id })
      .from(packages)
      .where(inArray(packages.id, data.relatedPackageIds));
    if (found.length !== data.relatedPackageIds.length)
      throw new Error("One or more related Packages no longer exist.");
  }
  await database().transaction(async (tx) => {
    const values = {
      name: data.title,
      slug,
      shortDescription: data.description,
      description: data.description,
      overview: data.overview,
      experienceTypeOptionId: type.id,
      experienceType: type.name,
      cardLinkText: data.cardLinkText,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      sortOrder: data.sortOrder,
      updatedAt: new Date(),
    };
    if (data.id)
      await tx
        .update(experienceCategories)
        .set(values)
        .where(eq(experienceCategories.id, id));
    else
      await tx
        .insert(experienceCategories)
        .values({ id, ...values, status: false });
    await Promise.all([
      tx
        .delete(experienceHighlights)
        .where(eq(experienceHighlights.experienceId, id)),
      tx
        .delete(experienceItineraries)
        .where(eq(experienceItineraries.experienceId, id)),
      tx.delete(experienceFaqs).where(eq(experienceFaqs.experienceId, id)),
      tx
        .delete(experienceInclusions)
        .where(eq(experienceInclusions.experienceId, id)),
      tx
        .delete(experienceExclusions)
        .where(eq(experienceExclusions.experienceId, id)),
      tx
        .delete(experiencePackages)
        .where(eq(experiencePackages.experienceId, id)),
    ]);
    if (data.highlights.length)
      await tx
        .insert(experienceHighlights)
        .values(
          data.highlights.map((item, sortOrder) => ({
            id: randomUUID(),
            experienceId: id,
            item,
            sortOrder,
          })),
        );
    if (data.itineraries.length)
      await tx
        .insert(experienceItineraries)
        .values(
          data.itineraries.map((row, sortOrder) => ({
            id: randomUUID(),
            experienceId: id,
            ...row,
            sortOrder,
          })),
        );
    if (data.faqs.length)
      await tx
        .insert(experienceFaqs)
        .values(
          data.faqs.map((row, sortOrder) => ({
            id: randomUUID(),
            experienceId: id,
            ...row,
            sortOrder,
          })),
        );
    if (data.inclusions.length)
      await tx
        .insert(experienceInclusions)
        .values(
          data.inclusions.map((item, sortOrder) => ({
            id: randomUUID(),
            experienceId: id,
            item,
            sortOrder,
          })),
        );
    if (data.exclusions.length)
      await tx
        .insert(experienceExclusions)
        .values(
          data.exclusions.map((item, sortOrder) => ({
            id: randomUUID(),
            experienceId: id,
            item,
            sortOrder,
          })),
        );
    if (data.relatedPackageIds.length)
      await tx
        .insert(experiencePackages)
        .values(
          data.relatedPackageIds.map((packageId, sortOrder) => ({
            id: randomUUID(),
            experienceId: id,
            packageId,
            sortOrder,
          })),
        );
  });
  return { id, slug };
}

export async function createCmsExperienceFromFormData(formData: FormData) {
  await requireAdmin();
  const raw = formData.get("experienceData");
  if (typeof raw !== "string") throw new Error("Experience data is required.");
  const data = cmsExperienceSaveSchema.parse(JSON.parse(raw));
  const file = formData.get("mainImage");
  let stored: Awaited<ReturnType<typeof storeCmsExperienceMainImage>> | null =
    null;
  if (file && typeof file !== "string" && file.size)
    stored = await storeCmsExperienceMainImage(file);
  try {
    const result = await save(data);
    if (stored)
      await database()
        .update(experienceCategories)
        .set({ heroImage: stored.url, heroImageStorageKey: stored.storageKey })
        .where(eq(experienceCategories.id, result.id));
    return result;
  } catch (error) {
    if (stored)
      await removeCmsMediaStoredFile(stored.storageKey).catch(() => undefined);
    throw error;
  }
}
export async function updateCmsExperience(input: CmsExperienceSaveInput) {
  await requireAdmin();
  if (!input.id) throw new Error("Experience ID is required.");
  return save(input);
}
export async function updateCmsExperienceStatus(id: string, status: boolean) {
  await requireAdmin();
  await database()
    .update(experienceCategories)
    .set({ status, updatedAt: new Date() })
    .where(eq(experienceCategories.id, id));
  return { id, status };
}
export async function deleteCmsExperience(id: string) {
  await requireAdmin();
  const [row] = await database()
    .select({ key: experienceCategories.heroImageStorageKey })
    .from(experienceCategories)
    .where(eq(experienceCategories.id, id))
    .limit(1);
  if (!row) throw new Error("Experience not found.");
  await database()
    .delete(experienceCategories)
    .where(eq(experienceCategories.id, id));
  if (row.key)
    await removeCmsMediaStoredFile(row.key).catch((error) =>
      console.error("Experience hero cleanup failed.", error),
    );
  return { id };
}
