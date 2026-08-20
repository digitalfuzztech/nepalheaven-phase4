import { z } from "zod";
import { cmsMediaIdSchema } from "@/lib/cms-media.schema";

export const cmsPackageListingPageSchema = z.object({
  heroMediaId: cmsMediaIdSchema.nullable(),
  subtitle: z.string().trim().min(1).max(180),
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1).max(1_000),
  searchPlaceholder: z.string().trim().min(1).max(180),
});

export type CmsPackageListingPageInput = z.infer<typeof cmsPackageListingPageSchema>;
