import { z } from "zod";
import { cmsMediaIdSchema } from "@/lib/cms-media.schema";

const text = (max = 2_000) => z.string().trim().min(1).max(max);
const nullableId = z.string().uuid().nullable();

export const cmsExperienceListingSchema = z.object({
  heroMediaId: cmsMediaIdSchema.nullable(),
  heroSubtitle: text(180),
  heroTitle: text(240),
  heroDescription: text(),
  sectionTwoSubtitle: text(180),
  sectionTwoTitle: text(240),
  sectionTwoDescription: text(),
  sectionThreeSubtitle: text(180),
  sectionThreeTitle: text(240),
  sectionThreeDescription: text(),
  highlightedTexts: z.array(text()).max(20),
});

export const cmsBlogListingSchema = z.object({
  heroMediaId: cmsMediaIdSchema.nullable(),
  heroSubtitle: text(180),
  heroTitle: text(240),
  heroDescription: text(),
  primaryBlogId: nullableId,
  primaryLinkText: text(180),
  newsletterSubtitle: text(180),
  newsletterTitle: text(500),
});

export const cmsAboutPageSchema = z.object({
  heroMediaId: cmsMediaIdSchema.nullable(),
  heroSubtitle: text(180),
  heroTitle: text(240),
  heroDescription: text(),
  missionTitle: text(500),
  missionDescription: text(5_000),
  visionTitle: text(500),
  visionDescription: text(5_000),
  storyTitle: text(500),
  storyText: text(30_000),
  counters: z
    .array(
      z.object({
        number: z.number().min(0),
        symbol: z.string().max(20),
        text: text(300),
      }),
    )
    .max(4),
  team: z
    .array(
      z.object({
        photoMediaId: cmsMediaIdSchema.nullable(),
        name: text(300),
        position: text(300),
        achievement: text(3_000),
      }),
    )
    .max(100),
  milestones: z
    .array(
      z.object({ year: text(40), title: text(500), description: text(5_000) }),
    )
    .max(100),
  awards: z.array(text(1_000)).max(100),
  partners: z.array(text(1_000)).max(100),
});

export const cmsContactPageSchema = z.object({
  heroMediaId: cmsMediaIdSchema.nullable(),
  heroSubtitle: text(180),
  heroTitle: text(240),
  heroDescription: text(),
  faqs: z
    .array(z.object({ question: text(2_000), answer: text(10_000) }))
    .max(100),
});

export type CmsExperienceListingInput = z.infer<
  typeof cmsExperienceListingSchema
>;
export type CmsBlogListingInput = z.infer<typeof cmsBlogListingSchema>;
export type CmsAboutPageInput = z.infer<typeof cmsAboutPageSchema>;
export type CmsContactPageInput = z.infer<typeof cmsContactPageSchema>;
