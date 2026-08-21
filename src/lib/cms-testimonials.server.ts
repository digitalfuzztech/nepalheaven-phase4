import { randomUUID } from "node:crypto";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { testimonials } from "@/db/schema/cms";
import { destinations } from "@/db/schema/destinations";
import { packages } from "@/db/schema/packages";
import { experienceCategories } from "@/db/schema/experiences";
import { requireAdmin } from "@/lib/auth.server";
import { resolveAssetReference } from "@/lib/asset-resolver";
import {
  removeCmsMediaStoredFile,
  storeCmsMediaUpload,
} from "@/lib/cms-media-storage.server";
import {
  cmsTestimonialIdSchema,
  cmsTestimonialInputSchema,
  type CmsTestimonialInput,
} from "@/lib/cms-testimonials.schema";

function database() {
  if (!db) throw new Error("Database connection is not configured.");
  return db;
}
export async function listCmsTestimonials() {
  await requireAdmin();
  return database()
    .select()
    .from(testimonials)
    .orderBy(asc(testimonials.sortOrder), asc(testimonials.createdAt));
}
export async function getCmsTestimonial(id: string) {
  await requireAdmin();
  const [row] = await database()
    .select()
    .from(testimonials)
    .where(eq(testimonials.id, id))
    .limit(1);
  if (!row) throw new Error("Testimonial not found.");
  return {
    id: row.id,
    name: row.name,
    content: row.content,
    rating: Number(row.rating ?? 5),
    countryCode: row.countryCode ?? "NP",
    associationType: row.associationType,
    associatedEntityId: row.destinationId ?? row.packageId ?? row.experienceId,
    sortOrder: row.sortOrder,
    avatarUrl: row.avatarUrl
      ? resolveAssetReference(row.avatarUrl) || row.avatarUrl
      : null,
  };
}
export async function getCmsTestimonialAssociations() {
  await requireAdmin();
  const [destinationRows, packageRows, experienceRows] = await Promise.all([
    database()
      .select({ id: destinations.id, title: destinations.name })
      .from(destinations)
      .orderBy(asc(destinations.name)),
    database()
      .select({ id: packages.id, title: packages.title })
      .from(packages)
      .orderBy(asc(packages.title)),
    database()
      .select({ id: experienceCategories.id, title: experienceCategories.name })
      .from(experienceCategories)
      .orderBy(asc(experienceCategories.name)),
  ]);
  return {
    destination: destinationRows,
    package: packageRows,
    experience: experienceRows,
  };
}
export async function saveCmsTestimonial(input: CmsTestimonialInput) {
  await requireAdmin();
  const data = cmsTestimonialInputSchema.parse(input);
  const id = data.id ?? randomUUID();
  const associated = data.associationType ? data.associatedEntityId : null;
  const values = {
    name: data.name,
    content: data.content,
    rating: String(data.rating),
    countryCode: data.countryCode,
    location: data.countryCode,
    associationType: data.associationType,
    destinationId: data.associationType === "destination" ? associated : null,
    packageId: data.associationType === "package" ? associated : null,
    experienceId: data.associationType === "experience" ? associated : null,
    sortOrder: data.sortOrder,
    updatedAt: new Date(),
  };
  if (data.id)
    await database()
      .update(testimonials)
      .set(values)
      .where(eq(testimonials.id, id));
  else
    await database()
      .insert(testimonials)
      .values({ id, ...values, status: "published", createdAt: new Date() });
  return getCmsTestimonial(id);
}
export async function uploadCmsTestimonialPhoto(formData: FormData) {
  await requireAdmin();
  const parsed = cmsTestimonialIdSchema.parse({ id: formData.get("id") });
  const file = formData.get("photo");
  if (!(file instanceof File) || !file.size)
    throw new Error("Choose a testimonial photo.");
  const [old] = await database()
    .select({ key: testimonials.avatarStorageKey })
    .from(testimonials)
    .where(eq(testimonials.id, parsed.id))
    .limit(1);
  if (!old) throw new Error("Testimonial not found.");
  const stored = await storeCmsMediaUpload(file);
  if (stored.type !== "image") {
    await removeCmsMediaStoredFile(stored.storageKey).catch(() => undefined);
    throw new Error("Testimonial photo must be an image.");
  }
  try {
    await database()
      .update(testimonials)
      .set({
        avatarUrl: stored.url,
        avatarStorageKey: stored.storageKey,
        updatedAt: new Date(),
      })
      .where(eq(testimonials.id, parsed.id));
  } catch (error) {
    await removeCmsMediaStoredFile(stored.storageKey).catch(() => undefined);
    throw error;
  }
  if (old.key) await removeCmsMediaStoredFile(old.key).catch(() => undefined);
  return { url: stored.url };
}
export async function deleteCmsTestimonial(input: { id: string }) {
  await requireAdmin();
  const { id } = cmsTestimonialIdSchema.parse(input);
  const [row] = await database()
    .select({ key: testimonials.avatarStorageKey })
    .from(testimonials)
    .where(eq(testimonials.id, id))
    .limit(1);
  if (!row) throw new Error("Testimonial not found.");
  await database().delete(testimonials).where(eq(testimonials.id, id));
  if (row.key) await removeCmsMediaStoredFile(row.key).catch(() => undefined);
  return { id };
}
