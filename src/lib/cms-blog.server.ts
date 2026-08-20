import { randomUUID } from "node:crypto";
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  blogCategories,
  blogContentBlocks,
  blogHighlights,
  blogPosts,
} from "@/db/schema/cms";
import { cmsOtherSettingsOptions } from "@/db/schema/cms-other-settings";
import { requireAdmin } from "@/lib/auth.server";
import {
  cmsBlogSaveSchema,
  type CmsBlogSaveInput,
} from "@/lib/cms-blog.schema";
import {
  removeCmsMediaStoredFile,
  storeCmsMediaUpload,
} from "@/lib/cms-media-storage.server";
function database() {
  if (!db) throw new Error("Database connection is not configured.");
  return db;
}
const slugify = (v: string) =>
  v
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "article";
async function uniqueSlug(title: string, id?: string) {
  const base = slugify(title);
  let value = base,
    n = 2;
  while (true) {
    const [row] = await database()
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, value))
      .limit(1);
    if (!row || row.id === id) return value;
    value = `${base}-${n++}`;
  }
}
async function storeImage(file: File) {
  const stored = await storeCmsMediaUpload(file);
  if (stored.type !== "image") {
    await removeCmsMediaStoredFile(stored.storageKey).catch(() => undefined);
    throw new Error("Blog images must be JPEG, PNG, WebP or GIF.");
  }
  return stored;
}
export type CmsBlogListItem = {
  id: string;
  slug: string;
  title: string;
  type: string;
  author: string;
  status: string;
  publishedAt: Date | null;
};
export async function getCmsBlogs(): Promise<CmsBlogListItem[]> {
  await requireAdmin();
  const typeOptions = cmsOtherSettingsOptions;
  const rows = await database()
    .select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      type: typeOptions.name,
      author: blogPosts.authorName,
      status: blogPosts.status,
      publishedAt: blogPosts.publishedAt,
    })
    .from(blogPosts)
    .leftJoin(typeOptions, eq(blogPosts.blogTypeOptionId, typeOptions.id))
    .orderBy(asc(blogPosts.title));
  return rows.map((row) => ({
    ...row,
    type: row.type ?? "Legacy",
    author: row.author ?? "",
  }));
}
export async function getCmsBlogEditorData(id?: string) {
  await requireAdmin();
  if (!id) return { detail: null };
  const [core] = await database()
    .select({ post: blogPosts, category: blogCategories })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .where(eq(blogPosts.id, id))
    .limit(1);
  if (!core) return null;
  const [blocks, highlights] = await Promise.all([
    database()
      .select()
      .from(blogContentBlocks)
      .where(eq(blogContentBlocks.blogPostId, id))
      .orderBy(asc(blogContentBlocks.sortOrder)),
    database()
      .select()
      .from(blogHighlights)
      .where(eq(blogHighlights.blogPostId, id))
      .orderBy(asc(blogHighlights.sortOrder)),
  ]);
  return { detail: { ...core, blocks, highlights } };
}
async function typeAndCategory(optionId: string) {
  const [option] = await database()
    .select()
    .from(cmsOtherSettingsOptions)
    .where(eq(cmsOtherSettingsOptions.id, optionId))
    .limit(1);
  if (!option || option.groupKey !== "blog_type")
    throw new Error("Select a valid Blog Type.");
  let [category] = await database()
    .select()
    .from(blogCategories)
    .where(eq(blogCategories.slug, option.value))
    .limit(1);
  if (!category) {
    category = { id: randomUUID(), name: option.name, slug: option.value };
    await database().insert(blogCategories).values(category);
  } else if (category.name !== option.name) {
    await database()
      .update(blogCategories)
      .set({ name: option.name })
      .where(eq(blogCategories.id, category.id));
    category = { ...category, name: option.name };
  }
  return { option, category };
}
export async function saveCmsBlogForm(formData: FormData) {
  await requireAdmin();
  const raw = formData.get("blogData");
  if (typeof raw !== "string") throw new Error("Blog data is required.");
  const data = cmsBlogSaveSchema.parse(JSON.parse(raw));
  const existing = data.id ? await getCmsBlogEditorData(data.id) : null;
  const existingDetail = existing?.detail ?? null;
  if (data.id && !existingDetail) throw new Error("Blog not found.");
  const { option, category } = await typeAndCategory(data.blogTypeOptionId);
  const id = data.id ?? randomUUID();
  const slug = await uniqueSlug(data.title, data.id);
  const newlyStored: string[] = [];
  let hero: { url: string; storageKey: string } | null = null;
  const heroFile = formData.get("heroImage");
  if (heroFile && typeof heroFile !== "string" && heroFile.size) {
    hero = await storeImage(heroFile);
    newlyStored.push(hero.storageKey);
  }
  const currentBlocks = new Map(
    existingDetail?.blocks.map((block) => [block.id, block]) ?? [],
  );
  const prepared = [] as Array<{
    id: string;
    type: "text" | "highlight" | "image";
    content: string | null;
    imageUrl: string | null;
    imageStorageKey: string | null;
    altText: string | null;
    caption: string | null;
    sortOrder: number;
  }>;
  for (const [sortOrder, block] of data.blocks.entries()) {
    const current = block.id ? currentBlocks.get(block.id) : null;
    if (block.id && !current)
      throw new Error("A Blog block no longer belongs to this post.");
    let imageUrl = current?.imageUrl ?? null,
      imageStorageKey = current?.imageStorageKey ?? null;
    const file = formData.get(`blockFile:${block.clientId}`);
    if (
      block.type === "image" &&
      file &&
      typeof file !== "string" &&
      file.size
    ) {
      const stored = await storeImage(file);
      newlyStored.push(stored.storageKey);
      imageUrl = stored.url;
      imageStorageKey = stored.storageKey;
    }
    if (block.type === "image" && !imageUrl)
      throw new Error("Every Image block requires an image.");
    prepared.push({
      id: block.id ?? randomUUID(),
      type: block.type,
      content: block.type === "image" ? null : block.content,
      imageUrl: block.type === "image" ? imageUrl : null,
      imageStorageKey: block.type === "image" ? imageStorageKey : null,
      altText: block.type === "image" ? block.altText : null,
      caption: block.type === "image" ? block.caption : null,
      sortOrder,
    });
  }
  try {
    await database().transaction(async (tx) => {
      const values = {
        categoryId: category.id,
        blogTypeOptionId: option.id,
        title: data.title,
        slug,
        excerpt: data.excerpt,
        authorName: data.authorName,
        authorRole: data.authorRole,
        aboutAuthor: data.aboutAuthor,
        readingTimeMinutes: data.readingTimeMinutes,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        content: data.blocks
          .filter((b) => b.type === "text")
          .map((b) => b.content)
          .join("\n\n"),
        ...(hero
          ? { coverImage: hero.url, coverImageStorageKey: hero.storageKey }
          : {}),
        updatedAt: new Date(),
      };
      if (data.id)
        await tx.update(blogPosts).set(values).where(eq(blogPosts.id, id));
      else
        await tx.insert(blogPosts).values({ id, ...values, status: "draft" });
      await tx
        .delete(blogContentBlocks)
        .where(eq(blogContentBlocks.blogPostId, id));
      await tx.delete(blogHighlights).where(eq(blogHighlights.blogPostId, id));
      if (prepared.length)
        await tx
          .insert(blogContentBlocks)
          .values(prepared.map((block) => ({ ...block, blogPostId: id })));
      if (data.highlights.length)
        await tx
          .insert(blogHighlights)
          .values(
            data.highlights.map((item, sortOrder) => ({
              id: randomUUID(),
              blogPostId: id,
              item,
              sortOrder,
            })),
          );
    });
  } catch (error) {
    await Promise.all(
      newlyStored.map((key) =>
        removeCmsMediaStoredFile(key).catch(() => undefined),
      ),
    );
    throw error;
  }
  const retained = new Set(
    prepared.map((block) => block.imageStorageKey).filter(Boolean),
  );
  const obsolete = [
    ...(existingDetail?.blocks
      .map((block) => block.imageStorageKey)
      .filter((key): key is string => Boolean(key) && !retained.has(key)) ??
      []),
    ...(hero && existingDetail?.post.coverImageStorageKey
      ? [existingDetail.post.coverImageStorageKey]
      : []),
  ];
  await Promise.all(
    obsolete.map((key) =>
      removeCmsMediaStoredFile(key).catch((error) =>
        console.error("Old Blog image cleanup failed.", error),
      ),
    ),
  );
  return { id, slug };
}
export async function updateCmsBlogStatus(
  id: string,
  status: "draft" | "published",
) {
  await requireAdmin();
  const [post] = await database()
    .select({ publishedAt: blogPosts.publishedAt })
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);
  if (!post) throw new Error("Blog not found.");
  await database()
    .update(blogPosts)
    .set({
      status,
      publishedAt:
        status === "published"
          ? (post.publishedAt ?? new Date())
          : post.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, id));
  return { id, status };
}
export async function deleteCmsBlog(id: string) {
  await requireAdmin();
  const result = await getCmsBlogEditorData(id);
  const detail = result?.detail;
  if (!detail) throw new Error("Blog not found.");
  await database().delete(blogPosts).where(eq(blogPosts.id, id));
  const keys = [
    detail.post.coverImageStorageKey,
    ...detail.blocks.map((block) => block.imageStorageKey),
  ].filter((key): key is string => Boolean(key));
  await Promise.all(
    keys.map((key) =>
      removeCmsMediaStoredFile(key).catch((error) =>
        console.error("Blog image cleanup failed.", error),
      ),
    ),
  );
  return { id };
}
