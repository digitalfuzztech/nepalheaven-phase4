import { z } from "zod";

export const testimonialAssociationSchema = z.enum([
  "destination",
  "package",
  "experience",
]);
export const cmsTestimonialInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(300),
  content: z.string().trim().min(1).max(10_000),
  rating: z.number().int().min(1).max(5),
  countryCode: z.string().length(2),
  associationType: testimonialAssociationSchema.nullable(),
  associatedEntityId: z.string().uuid().nullable(),
  sortOrder: z.number().int().min(0),
});
export const cmsTestimonialIdSchema = z.object({ id: z.string().uuid() });
export type CmsTestimonialInput = z.infer<typeof cmsTestimonialInputSchema>;
