import { z } from "zod";
import { isCountryCode } from "@/lib/countries";

const nullableText = z.string().trim().max(10_000).nullable();
const positiveInteger = z.number().int().min(1);

export const cmsPackageItinerarySchema = z
  .object({
    minDay: positiveInteger,
    maxDay: positiveInteger,
    title: z.string().trim().min(1).max(500),
    description: z.string().trim().max(10_000),
  })
  .refine((item) => item.maxDay >= item.minDay, {
    message: "Maximum day must be greater than or equal to minimum day.",
    path: ["maxDay"],
  });

export const cmsPackageTierSchema = z.object({
  id: z.string().uuid().optional(),
  tierOptionId: z.string().uuid().nullable(),
  name: z.string().trim().min(1).max(300),
  price: z.number().min(0),
  note: z.string().trim().max(5_000),
});

export const cmsPackageReviewSchema = z.object({
  rating: z.number().min(1).max(5).multipleOf(0.5),
  reviewText: z.string().trim().min(1).max(10_000),
  customerName: z.string().trim().min(1).max(300),
  customerCountryCode: z
    .string()
    .trim()
    .toUpperCase()
    .refine((value) => isCountryCode(value) === true, "Select a valid country.")
    .transform((value): string => value),
});

export const cmsPackageFaqSchema = z.object({
  question: z.string().trim().min(1).max(2_000),
  answer: z.string().trim().min(1).max(10_000),
});

export const cmsPackageSaveSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().trim().min(1).max(500),
    packageTypeOptionId: z.string().uuid(),
    description: z.string().trim().min(1).max(10_000),
    overview: nullableText,
    durationMinDays: positiveInteger,
    durationMaxDays: positiveInteger,
    difficultyOptionId: z.string().uuid(),
    groupSizeMin: positiveInteger,
    groupSizeMax: positiveInteger,
    rating: z.number().min(0).max(5),
    reviewCount: z.number().int().min(0),
    startingPrice: z.number().min(0),
    oldPrice: z.number().min(0).nullable(),
    destinationIds: z.array(z.string().uuid()).max(100),
    highlights: z.array(z.string().trim().min(1).max(2_000)).max(100),
    itineraries: z.array(cmsPackageItinerarySchema).max(200),
    tiers: z.array(cmsPackageTierSchema).max(50),
    inclusions: z.array(z.string().trim().min(1).max(2_000)).max(100),
    exclusions: z.array(z.string().trim().min(1).max(2_000)).max(100),
    reviews: z.array(cmsPackageReviewSchema).max(100),
    faqs: z.array(cmsPackageFaqSchema).max(100),
    seoTitle: nullableText,
    seoDescription: nullableText,
    sortOrder: z.number().int().min(0),
  })
  .superRefine((data, ctx) => {
    if (data.durationMaxDays < data.durationMinDays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Maximum days must be greater than or equal to minimum days.",
        path: ["durationMaxDays"],
      });
    }
    if (data.groupSizeMax < data.groupSizeMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Maximum group size must be greater than or equal to minimum group size.",
        path: ["groupSizeMax"],
      });
    }
    if (new Set(data.destinationIds).size !== data.destinationIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Package destinations cannot contain duplicates.",
        path: ["destinationIds"],
      });
    }
  });

export const cmsPackageIdSchema = z.object({ id: z.string().uuid() });
export const cmsPackageStatusSchema = cmsPackageIdSchema.extend({
  status: z.boolean(),
});

export type CmsPackageSaveInput = z.infer<typeof cmsPackageSaveSchema>;
