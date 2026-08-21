import { z } from "zod";
import { cmsMediaIdSchema } from "@/lib/cms-media.schema";
import { HOME_ICON_KEYS } from "@/lib/home-icons";

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

export const cmsGalleryPageSchema = z.object({
  heroMediaId: cmsMediaIdSchema.nullable(),
  heroSubtitle: text(180),
  heroTitle: text(240),
  heroDescription: text(),
});

const safeLink = z
  .string()
  .trim()
  .max(2_000)
  .refine(
    (value) => value.startsWith("/") || /^https:\/\//i.test(value),
    "Use an internal path or an https URL.",
  );
const iconCard = z.object({
  icon: text(80),
  title: text(300),
  description: text(2_000),
});
export const cmsHomePageSchema = z
  .object({
    heroMediaId: cmsMediaIdSchema.nullable(),
    heroSubtitle: text(180),
    heroTitle: text(500),
    heroDescription: text(3_000),
    heroStats: z.array(z.object({ value: text(80), text: text(300) })).max(3),
    floatingIcon: z.enum(HOME_ICON_KEYS),
    floatingBoldText: text(300),
    floatingText: text(2_000),
    aboutSubtitle: text(180),
    aboutTitle: text(500),
    aboutDescription: text(5_000),
    aboutCards: z.array(iconCard).max(4),
    aboutBigMediaId: cmsMediaIdSchema.nullable(),
    aboutBigTitle: text(300),
    aboutBigSubtitle: text(300),
    aboutSmallMediaId: cmsMediaIdSchema.nullable(),
    destinationsSubtitle: text(180),
    destinationsTitle: text(500),
    destinationsDescription: text(3_000),
    primaryDestinationId: nullableId,
    secondaryDestinationIds: z.array(z.string().uuid()).max(6),
    destinationsLinkText: text(180),
    expertText: text(5_000),
    expertHighlightedText: text(1_000),
    expertName: text(300),
    expertPosition: text(300),
    toursSubtitle: text(180),
    toursTitle: text(500),
    toursDescription: text(3_000),
    primaryPackageIds: z.array(z.string().uuid()).max(4),
    secondaryPackageIds: z.array(z.string().uuid()).max(4),
    toursLinkText: text(180),
    adventuresSubtitle: text(180),
    adventuresTitle: text(500),
    adventuresDescription: text(3_000),
    adventures: z.array(iconCard).max(8),
    whySubtitle: text(180),
    whyTitle: text(500),
    whyDescription: text(3_000),
    whyCards: z.array(iconCard).max(6),
    testimonialsSubtitle: text(180),
    testimonialsTitle: text(500),
    testimonialsDescription: text(3_000),
    gallerySubtitle: text(180),
    galleryTitle: text(500),
    galleryDescription: text(3_000),
    galleryMediaIds: z.array(cmsMediaIdSchema).max(8),
    galleryLinkText: text(180),
    journalSubtitle: text(180),
    journalTitle: text(500),
    journalDescription: text(3_000),
    blogIds: z.array(z.string().uuid()).max(3),
    trustTexts: z.array(text(500)).max(20),
    newsletterSubtitle: text(180),
    newsletterTitle: text(500),
    newsletterDescription: text(3_000),
    ctaSubtitle: text(180),
    ctaTitle: text(500),
    ctaDescription: text(3_000),
    ctaMediaId: cmsMediaIdSchema.nullable(),
    ctaMainText: text(180),
    ctaMainLink: safeLink,
    ctaSecondaryText: text(180),
    ctaSecondaryLink: safeLink,
  })
  .superRefine((data, context) => {
    const duplicateDestination =
      data.primaryDestinationId &&
      data.secondaryDestinationIds.includes(data.primaryDestinationId);
    if (duplicateDestination)
      context.addIssue({
        code: "custom",
        path: ["secondaryDestinationIds"],
        message: "Primary Destination cannot also be secondary.",
      });
    const duplicatePackage = data.primaryPackageIds.find((id) =>
      data.secondaryPackageIds.includes(id),
    );
    if (duplicatePackage)
      context.addIssue({
        code: "custom",
        path: ["secondaryPackageIds"],
        message: "A Package cannot be in both tour groups.",
      });
  });

const authPage = z.object({
  leftSubtitle: text(180),
  leftTitle: text(500),
  leftDescription: text(3_000),
  rightSubtitle: text(180),
  rightTitle: text(500),
  rightDescription: text(3_000),
  emailLabel: text(180),
  emailPlaceholder: text(300),
  passwordLabel: text(180),
  passwordPlaceholder: text(300),
  submitText: text(180),
  linkText: text(180),
  bottomText: text(500),
  secondaryLinkText: text(180),
  successText: text(2_000),
  genericError: text(2_000),
});
export const cmsAuthenticationSchema = z.object({
  customerLogin: authPage,
  registration: authPage.extend({
    namePlaceholder: text(300),
    phonePlaceholder: text(300),
    countryLabel: text(180),
    birthDateLabel: text(180),
    confirmPasswordPlaceholder: text(300),
    passwordRequirementsError: text(2_000),
    passwordMismatchError: text(2_000),
  }),
  forgotPassword: authPage,
  verification: authPage.extend({
    codeLabel: text(180),
    codePlaceholder: text(300),
    resendText: text(180),
  }),
  adminLogin: authPage,
  adminForgotPassword: authPage,
});

const formCopy = z.object({
  subtitle: text(180),
  title: text(500),
  description: text(3_000),
  nameLabel: text(180),
  namePlaceholder: text(300),
  emailLabel: text(180),
  emailPlaceholder: text(300),
  phoneLabel: text(180),
  phonePlaceholder: text(300),
  dateLabel: text(180),
  messageLabel: text(180),
  messagePlaceholder: text(500),
  checkboxText: text(1_000),
  buttonText: text(180),
  linkText: text(180),
  thankYouTitle: text(500),
  thankYouDescription: text(3_000),
  genericError: text(2_000),
});
export const cmsFormsSchema = z.object({
  destination: formCopy,
  experience: formCopy,
  package: z.object({
    priceLabel: text(180),
    originalPriceLabel: text(180),
    perPersonText: text(300),
    bookButtonText: text(180),
    contactButtonText: text(180),
    whatsappText: text(180),
    helperText: z.string().trim().max(1_000),
  }),
});
export const cmsBookingPageSchema = z.object({
  subtitle: text(180),
  title: text(500),
  description: text(3_000),
  formTitle: text(500),
  travellerStepText: text(300),
  reviewStepText: text(300),
  continueButtonText: text(180),
  confirmationSubtitle: text(180),
  confirmationTitle: text(500),
  confirmationDescription: text(3_000),
  nextStepsText: text(3_000),
  viewBookingText: text(180),
  exploreText: text(180),
});
export const cmsSeoSchema = z.object({
  pages: z.record(
    z.string(),
    z.object({
      metaTitle: z.string().trim().max(500),
      metaDescription: z.string().trim().max(2_000),
      ogTitle: z.string().trim().max(500),
      ogDescription: z.string().trim().max(2_000),
      ogMediaId: cmsMediaIdSchema.nullable(),
    }),
  ),
});

export type CmsExperienceListingInput = z.infer<
  typeof cmsExperienceListingSchema
>;
export type CmsBlogListingInput = z.infer<typeof cmsBlogListingSchema>;
export type CmsAboutPageInput = z.infer<typeof cmsAboutPageSchema>;
export type CmsContactPageInput = z.infer<typeof cmsContactPageSchema>;
export type CmsGalleryPageInput = z.infer<typeof cmsGalleryPageSchema>;
export type CmsHomePageInput = z.infer<typeof cmsHomePageSchema>;
export type CmsAuthenticationInput = z.infer<typeof cmsAuthenticationSchema>;
export type CmsFormsInput = z.infer<typeof cmsFormsSchema>;
export type CmsBookingPageInput = z.infer<typeof cmsBookingPageSchema>;
export type CmsSeoInput = z.infer<typeof cmsSeoSchema>;
