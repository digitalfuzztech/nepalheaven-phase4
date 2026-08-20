import { eq } from "drizzle-orm";
import { db } from "@/db";
import { experienceCategories } from "@/db/schema/experiences";
import { requireAdmin } from "@/lib/auth.server";
import { cmsExperienceIdSchema } from "@/lib/cms-experiences.schema";
import {
  removeCmsMediaStoredFile,
  storeCmsMediaUpload,
} from "@/lib/cms-media-storage.server";
export async function storeCmsExperienceMainImage(file: File) {
  const stored = await storeCmsMediaUpload(file);
  if (stored.type !== "image") {
    await removeCmsMediaStoredFile(stored.storageKey).catch(() => undefined);
    throw new Error("Experience hero must be an image.");
  }
  return stored;
}
export async function uploadCmsExperienceMainImage(formData: FormData) {
  await requireAdmin();
  if (!db) throw new Error("Database connection is not configured.");
  const idValue = formData.get("id");
  const file = formData.get("mainImage");
  if (
    typeof idValue !== "string" ||
    !file ||
    typeof file === "string" ||
    !file.size
  )
    throw new Error("Experience and image are required.");
  const { id } = cmsExperienceIdSchema.parse({ id: idValue });
  const [existing] = await db
    .select({ key: experienceCategories.heroImageStorageKey })
    .from(experienceCategories)
    .where(eq(experienceCategories.id, id))
    .limit(1);
  if (!existing) throw new Error("Experience not found.");
  const stored = await storeCmsExperienceMainImage(file);
  try {
    await db
      .update(experienceCategories)
      .set({
        heroImage: stored.url,
        heroImageStorageKey: stored.storageKey,
        updatedAt: new Date(),
      })
      .where(eq(experienceCategories.id, id));
  } catch (error) {
    await removeCmsMediaStoredFile(stored.storageKey).catch(() => undefined);
    throw error;
  }
  if (existing.key)
    await removeCmsMediaStoredFile(existing.key).catch((error) =>
      console.error("Old Experience hero cleanup failed.", error),
    );
  return { id, url: stored.url };
}
