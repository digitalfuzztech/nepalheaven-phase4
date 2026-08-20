import { z } from "zod";
const item = z.string().trim().min(1).max(2_000);
export const cmsExperienceSaveSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().trim().min(1).max(500),
    experienceTypeOptionId: z.string().uuid(),
    description: z.string().trim().min(1).max(10_000),
    cardLinkText: z.string().trim().min(1).max(180),
    overview: z.string().trim().max(20_000).nullable(),
    highlights: z.array(item).max(100),
    inclusions: z.array(item).max(100),
    exclusions: z.array(item).max(100),
    relatedPackageIds: z.array(z.string().uuid()).max(100),
    itineraries: z
      .array(
        z
          .object({
            minDay: z.number().int().min(1),
            maxDay: z.number().int().min(1),
            title: z.string().trim().min(1).max(500),
            description: z.string().trim().max(10_000),
          })
          .refine((row) => row.maxDay >= row.minDay, {
            message: "Maximum day must be at least minimum day.",
          }),
      )
      .max(200),
    faqs: z
      .array(
        z.object({
          question: z.string().trim().min(1).max(2_000),
          answer: z.string().trim().min(1).max(10_000),
        }),
      )
      .max(100),
    seoTitle: z.string().trim().max(500).nullable(),
    seoDescription: z.string().trim().max(2_000).nullable(),
    sortOrder: z.number().int().min(0),
  })
  .refine(
    (data) =>
      new Set(data.relatedPackageIds).size === data.relatedPackageIds.length,
    {
      message: "Related packages cannot contain duplicates.",
      path: ["relatedPackageIds"],
    },
  );
export const cmsExperienceIdSchema = z.object({ id: z.string().uuid() });
export const cmsExperienceStatusSchema = cmsExperienceIdSchema.extend({
  status: z.boolean(),
});
export type CmsExperienceSaveInput = z.infer<typeof cmsExperienceSaveSchema>;
