import { eq } from "drizzle-orm";
import { db } from "@/db";
import { packages } from "@/db/schema/packages";
import { requireAdmin } from "@/lib/auth.server";
import { cmsPackageIdSchema } from "@/lib/cms-packages.schema";
import {
  removeCmsMediaStoredFile,
  storeCmsMediaUpload,
} from "@/lib/cms-media-storage.server";

export async function storeCmsPackageMainImage(file: File) {
  const stored = await storeCmsMediaUpload(file);
  if (stored.type !== "image") {
    await removeCmsMediaStoredFile(stored.storageKey).catch(() => undefined);
    throw new Error("Package main image must be JPEG, PNG, WebP or GIF.");
  }
  return stored;
}

export async function uploadCmsPackageMainImage(formData: FormData) {
  await requireAdmin();
  if (!db) throw new Error("Database connection is not configured.");
  const idValue = formData.get("id");
  const file = formData.get("mainImage");
  if (typeof idValue !== "string") throw new Error("Package ID is required.");
  const { id } = cmsPackageIdSchema.parse({ id: idValue });
  if (!file || typeof file === "string" || file.size <= 0)
    throw new Error("Select an image to upload.");

  const [existing] = await db
    .select({ oldStorageKey: packages.heroImageStorageKey })
    .from(packages)
    .where(eq(packages.id, id))
    .limit(1);
  if (!existing) throw new Error("Package could not be found.");
  const stored = await storeCmsPackageMainImage(file);
  try {
    await db
      .update(packages)
      .set({
        heroImage: stored.url,
        heroImageStorageKey: stored.storageKey,
        updatedAt: new Date(),
      })
      .where(eq(packages.id, id));
  } catch (error) {
    await removeCmsMediaStoredFile(stored.storageKey).catch(() => undefined);
    throw error;
  }
  if (existing.oldStorageKey) {
    await removeCmsMediaStoredFile(existing.oldStorageKey).catch((error) =>
      console.error("Old Package main image cleanup failed.", error),
    );
  }
  return { id, url: stored.url, storageKey: stored.storageKey };
}
