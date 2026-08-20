import { z } from "zod";
export const cmsBlogBlockSchema = z
  .object({
    id: z.string().uuid().optional(),
    clientId: z.string().min(1).max(100),
    type: z.enum(["text", "highlight", "image"]),
    content: z.string().trim().max(30_000),
    altText: z.string().trim().max(1_000),
    caption: z.string().trim().max(2_000),
  })
  .refine((row) => row.type === "image" || row.content.length > 0, {
    message: "Text and Highlight blocks require content.",
  });
export const cmsBlogSaveSchema = z.object({
  id: z.string().uuid().optional(),
  blogTypeOptionId: z.string().uuid(),
  title: z.string().trim().min(1).max(500),
  excerpt: z.string().trim().min(1).max(5_000),
  authorName: z.string().trim().min(1).max(300),
  authorRole: z.string().trim().max(300),
  aboutAuthor: z.string().trim().max(10_000).nullable(),
  publishedAt: z.string().datetime().nullable(),
  readingTimeMinutes: z.number().int().min(1).max(10_000),
  highlights: z.array(z.string().trim().min(1).max(3_000)).max(100),
  blocks: z.array(cmsBlogBlockSchema).max(500),
  seoTitle: z.string().trim().max(500).nullable(),
  seoDescription: z.string().trim().max(2_000).nullable(),
});
export const cmsBlogIdSchema = z.object({ id: z.string().uuid() });
export const cmsBlogStatusSchema = cmsBlogIdSchema.extend({
  status: z.enum(["draft", "published"]),
});
export type CmsBlogSaveInput = z.infer<typeof cmsBlogSaveSchema>;
