import { randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { cmsPages, cmsPageSections } from "@/db/schema/cms-foundation";
import { cmsOtherSettingsOptions } from "@/db/schema/cms-other-settings";
import { media } from "@/db/schema/media";
import { requireAdmin } from "@/lib/auth.server";
import { resolveAssetReference } from "@/lib/asset-resolver";
import {
  cmsAboutPageSchema,
  cmsBlogListingSchema,
  cmsContactPageSchema,
  cmsExperienceListingSchema,
  cmsGalleryPageSchema,
  cmsHomePageSchema,
  cmsAuthenticationSchema,
  cmsFormsSchema,
  cmsBookingPageSchema,
  cmsSeoSchema,
  type CmsAboutPageInput,
  type CmsBlogListingInput,
  type CmsContactPageInput,
  type CmsExperienceListingInput,
  type CmsGalleryPageInput,
  type CmsHomePageInput,
  type CmsAuthenticationInput,
  type CmsFormsInput,
  type CmsBookingPageInput,
  type CmsSeoInput,
} from "@/lib/cms-page-content.schema";

type PageDataMap = {
  experiences: CmsExperienceListingInput;
  blog: CmsBlogListingInput;
  about: CmsAboutPageInput;
  contact: CmsContactPageInput;
  gallery: CmsGalleryPageInput;
  home: CmsHomePageInput;
  authentication: CmsAuthenticationInput;
  forms: CmsFormsInput;
  booking: CmsBookingPageInput;
  seo: CmsSeoInput;
};

function authDefaults(
  leftSubtitle: string,
  leftTitle: string,
  rightTitle: string,
) {
  return {
    leftSubtitle,
    leftTitle,
    leftDescription: "Manage your Nepal Heaven journey securely.",
    rightSubtitle: leftSubtitle,
    rightTitle,
    rightDescription: "Enter your details to continue.",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    submitText: "Continue",
    linkText: "Forgot password?",
    bottomText: "Need another option?",
    secondaryLinkText: "Go back",
    successText: "Your request was successful.",
    genericError: "Something went wrong. Please try again.",
  };
}
function makeAuthenticationDefaults(): CmsAuthenticationInput {
  return {
    customerLogin: {
      ...authDefaults(
        "Welcome back",
        "Your next Nepal journey starts here.",
        "Welcome back",
      ),
      submitText: "Sign in",
      secondaryLinkText: "Create an account",
      bottomText: "Don't have an account?",
    },
    registration: {
      ...authDefaults(
        "Join Nepal Heaven",
        "Keep your journeys together.",
        "Start exploring",
      ),
      submitText: "Create traveller account",
      secondaryLinkText: "Sign in",
      bottomText: "Already registered?",
      namePlaceholder: "Full name",
      phonePlaceholder: "Contact number",
      countryLabel: "Nationality",
      birthDateLabel: "Date of birth",
      confirmPasswordPlaceholder: "Confirm password",
      passwordRequirementsError:
        "Password must be at least 8 characters and include uppercase, lowercase and a number.",
      passwordMismatchError: "Passwords do not match.",
    },
    forgotPassword: {
      ...authDefaults(
        "Account recovery",
        "Get back to your journeys.",
        "Reset your password",
      ),
      submitText: "Prepare reset",
      secondaryLinkText: "Back to sign in",
    },
    verification: {
      ...authDefaults(
        "Email verification",
        "Confirm your traveller email.",
        "Verify your email",
      ),
      submitText: "Verify Email",
      secondaryLinkText: "Back to sign in",
      codeLabel: "Verification code",
      codePlaceholder: "6-digit code",
      resendText: "Resend Code",
    },
    adminLogin: {
      ...authDefaults(
        "Secure administration",
        "Run Nepal Heaven from one place.",
        "Admin sign in",
      ),
      submitText: "Sign in to admin",
      emailPlaceholder: "admin@nepalheaven.com",
    },
    adminForgotPassword: {
      ...authDefaults(
        "Administrator recovery",
        "Recover secure admin access.",
        "Forgot admin password",
      ),
      submitText: "Send reset instructions",
      emailPlaceholder: "Administrator email",
      secondaryLinkText: "Back to admin sign in",
    },
  };
}
function makeFormDefaults(title: string, subtitle: string) {
  return {
    subtitle,
    title,
    description: "Tell our Kathmandu team what you have in mind.",
    nameLabel: "Full name",
    namePlaceholder: "Full name",
    emailLabel: "Email address",
    emailPlaceholder: "Email address",
    phoneLabel: "Phone / WhatsApp",
    phonePlaceholder: "Phone / WhatsApp (optional)",
    dateLabel: "Preferred date",
    messageLabel: "Message",
    messagePlaceholder: "Tell us about the journey you have in mind…",
    checkboxText: "Send me Nepal travel inspiration, offers and trip updates.",
    buttonText: title,
    linkText: "Ask on WhatsApp",
    thankYouTitle: "Thank you",
    thankYouDescription: "Your request is safely with our Kathmandu team.",
    genericError: "Please check your details and try again.",
  };
}

const defaults: PageDataMap = {
  experiences: {
    heroMediaId: null,
    heroSubtitle: "How you travel",
    heroTitle: "Nine ways to experience Nepal",
    heroDescription:
      "The same mountains, read nine different ways — pick the one that sounds like your kind of week.",
    sectionTwoSubtitle: "Categories",
    sectionTwoTitle: "Start with a feeling, not an itinerary",
    sectionTwoDescription:
      "Every category below can be run privately, combined with another, or extended into a multi-region journey.",
    sectionThreeSubtitle: "Bespoke",
    sectionThreeTitle: "Nothing here quite right?",
    sectionThreeDescription:
      "Around a third of our travellers arrive with an idea rather than an itinerary — we build from there.",
    highlightedTexts: [
      "Tell us your dates, pace and altitude appetite",
      "We draft a route within 24 hours",
      "Refine it together until it's exactly right",
      "Travel with a private guide and 24/7 support",
    ],
  } satisfies CmsExperienceListingInput,
  blog: {
    heroMediaId: null,
    heroSubtitle: "The journal",
    heroTitle: "Notes from the Himalaya",
    heroDescription:
      "Season guides, altitude science, packing lists and festival calendars — written by the people who guide them.",
    primaryBlogId: null,
    primaryLinkText: "Read the story",
    newsletterSubtitle: "Newsletter",
    newsletterTitle: "One thoughtful Nepal letter each month",
  } satisfies CmsBlogListingInput,
  about: {
    heroMediaId: null,
    heroSubtitle: "Our story",
    heroTitle: "Locally owned. Mountain born.",
    heroDescription:
      "Nepal Heaven began with one Sherpa guide, one borrowed office in Lazimpath and a conviction that Nepal deserved better travel.",
    missionTitle: "Travel that leaves Nepal better than it found it",
    missionDescription:
      "We exist to give travellers an unfiltered, well-supported experience of the Himalaya while ensuring the people who make it possible are paid, insured and respected.",
    visionTitle: "The most trusted name in Himalayan travel",
    visionDescription:
      "Not the largest operator in Nepal — the one travellers recommend without hesitation and guides most want to work for.",
    storyTitle: "The story",
    storyText:
      "Pemba Sherpa grew up in Khumjung at 3,790 m, carrying loads to Base Camp before he was twenty and summiting Everest six times before he was forty. In 2011 he stopped climbing for other companies and started one of his own. Fifteen years later, Nepal Heaven has hosted more than ten thousand travellers across 250 curated journeys. Every guide on the team is licensed, insured and paid above the industry standard.",
    counters: [],
    team: [],
    milestones: [],
    awards: [],
    partners: [],
  } satisfies CmsAboutPageInput,
  contact: {
    heroMediaId: null,
    heroSubtitle: "Get in touch",
    heroTitle: "Let's start planning",
    heroDescription:
      "Every enquiry is answered by a specialist in Kathmandu, usually within a few hours.",
    faqs: [
      {
        question: "How fast do you reply?",
        answer: "Within 24 hours on weekdays, usually much sooner.",
      },
      {
        question: "Can you build a fully custom trip?",
        answer: "Yes — send dates and interests and we will draft a route.",
      },
      {
        question: "Do you work with travel agents?",
        answer:
          "We do. Ask for our trade rates and we will connect you with our partnerships team.",
      },
    ],
  } satisfies CmsContactPageInput,
  gallery: {
    heroMediaId: null,
    heroSubtitle: "Gallery",
    heroTitle: "Nepal, frame by frame",
    heroDescription:
      "A field archive from our guides: summits at dawn, monastery courtyards, jungle rivers and the people who make every journey memorable.",
  } satisfies CmsGalleryPageInput,
  home: {
    heroMediaId: null,
    heroSubtitle: "Nepal · Since 2011",
    heroTitle: "Heaven on Earth Awaits.",
    heroDescription:
      "Discover unforgettable adventures across Nepal with expertly crafted journeys — led by Sherpa guides who have walked these valleys their whole lives.",
    heroStats: [
      { value: "4.9/5", text: "1,000+ traveller reviews" },
      { value: "250+", text: "Curated Himalayan journeys" },
      { value: "24/7", text: "Kathmandu support desk" },
    ],
    floatingIcon: "compass",
    floatingBoldText: "Tailor-made journeys",
    floatingText: "Designed around the way you want to explore Nepal.",
    aboutSubtitle: "Our story",
    aboutTitle: "A country best understood at walking pace",
    aboutDescription:
      "Nepal Heaven began with two Sherpa brothers and a single teahouse route. Fifteen years later we still write every itinerary by hand, walk them ourselves and answer the phone at 3 a.m.",
    aboutCards: [
      {
        icon: "compass",
        title: "Written, not templated",
        description:
          "Every route is drafted for your pace, season and altitude tolerance.",
      },
      {
        icon: "mountain",
        title: "Walked in advance",
        description:
          "Our guides re-scout each trail before departure season opens.",
      },
      {
        icon: "heart-pulse",
        title: "Altitude-first safety",
        description:
          "Oximeters, satellite comms and evacuation cover on every trek.",
      },
      {
        icon: "headphones",
        title: "One person, start to end",
        description:
          "A named Kathmandu planner stays with you from enquiry to homecoming.",
      },
    ],
    aboutBigMediaId: null,
    aboutBigTitle: "15 yrs",
    aboutBigSubtitle: "In the Himalaya",
    aboutSmallMediaId: null,
    destinationsSubtitle: "Where to go",
    destinationsTitle: "Eight regions that define Nepal",
    destinationsDescription:
      "From the glacier theatre of the Khumbu to the near-empty shoreline of Rara, each region has its own season, altitude and rhythm.",
    primaryDestinationId: null,
    secondaryDestinationIds: [],
    destinationsLinkText: "All destinations",
    expertText:
      "There is a moment, usually around the fourth morning, when the mountains stop being scenery and start being",
    expertHighlightedText: "the reason you came.",
    expertName: "Pemba Sherpa",
    expertPosition: "Head of mountain operations",
    toursSubtitle: "Signature journeys",
    toursTitle: "Top tour packages this season",
    toursDescription:
      "Fixed departures and private itineraries, all fully permitted, guided and insured.",
    primaryPackageIds: [],
    secondaryPackageIds: [],
    toursLinkText: "See all journeys",
    adventuresSubtitle: "Adventure activities",
    adventuresTitle: "Choose your altitude of adrenaline",
    adventuresDescription:
      "Add any of these to an itinerary, or build an entire trip around one.",
    adventures: [],
    whySubtitle: "Why Nepal Heaven",
    whyTitle: "The difference is in who takes you there",
    whyDescription:
      "Locally owned in Kathmandu, staffed by career mountain professionals, and answerable to you at every hour.",
    whyCards: [],
    testimonialsSubtitle: "Traveller reviews",
    testimonialsTitle: "Fifteen years of people coming home changed",
    testimonialsDescription:
      "Every review is from a traveller who booked with our Kathmandu team.",
    gallerySubtitle: "From the field",
    galleryTitle: "Photographed on our journeys",
    galleryDescription: "A curated glimpse of Nepal through our journeys.",
    galleryMediaIds: [],
    galleryLinkText: "Open gallery",
    journalSubtitle: "The journal",
    journalTitle: "Latest travel stories",
    journalDescription:
      "Route notes, seasonal advice and dispatches written by the guides who lead them.",
    blogIds: [],
    trustTexts: [
      "Rated 4.9 on Tripadvisor",
      "Nepal Tourism Board licensed",
      "TAAN member",
      "NMA certified guides",
    ],
    newsletterSubtitle: "The Nepal Heaven journal",
    newsletterTitle: "A considered note from Nepal",
    newsletterDescription:
      "Seasonal route advice, thoughtful travel inspiration and occasional offers.",
    ctaSubtitle: "Your journey",
    ctaTitle: "Heaven on Earth awaits",
    ctaDescription: "Plan a private Nepal journey with our Kathmandu team.",
    ctaMediaId: null,
    ctaMainText: "Plan my trip",
    ctaMainLink: "/contact",
    ctaSecondaryText: "Explore packages",
    ctaSecondaryLink: "/packages",
  } satisfies CmsHomePageInput,
  authentication: makeAuthenticationDefaults(),
  forms: {
    destination: makeFormDefaults(
      "Request an itinerary",
      "Plan this destination",
    ),
    experience: makeFormDefaults(
      "Ask about this experience",
      "Shape this around you",
    ),
    package: {
      priceLabel: "From",
      originalPriceLabel: "Original price",
      perPersonText: "per person, twin share",
      bookButtonText: "Book this trip",
      contactButtonText: "Speak to a specialist",
      whatsappText: "Ask on WhatsApp",
      helperText: "",
    },
  } satisfies CmsFormsInput,
  booking: {
    subtitle: "Prepare your journey",
    title: "Complete your booking",
    description: "Review traveller details and choose your payment option.",
    formTitle: "Traveller information",
    travellerStepText: "Traveller details",
    reviewStepText: "Review & payment choice",
    continueButtonText: "Continue to review",
    confirmationSubtitle: "Payment successful",
    confirmationTitle: "Booking confirmed",
    confirmationDescription: "Your booking has been confirmed.",
    nextStepsText:
      "Our Kathmandu team will contact you with the next preparation steps.",
    viewBookingText: "View my booking",
    exploreText: "Explore more trips",
  } satisfies CmsBookingPageInput,
  seo: {
    pages: Object.fromEntries(
      [
        "/",
        "/destinations",
        "/packages",
        "/experiences",
        "/blog",
        "/gallery",
        "/about",
        "/contact",
      ].map((path) => [
        path,
        {
          metaTitle: "",
          metaDescription: "",
          ogTitle: "",
          ogDescription: "",
          ogMediaId: null,
        },
      ]),
    ),
  } satisfies CmsSeoInput,
};

type PageKind = keyof PageDataMap;
const schemaByKind = {
  experiences: cmsExperienceListingSchema,
  blog: cmsBlogListingSchema,
  about: cmsAboutPageSchema,
  contact: cmsContactPageSchema,
  gallery: cmsGalleryPageSchema,
  home: cmsHomePageSchema,
  authentication: cmsAuthenticationSchema,
  forms: cmsFormsSchema,
  booking: cmsBookingPageSchema,
  seo: cmsSeoSchema,
};
const routeByKind = {
  experiences: "/experiences",
  blog: "/blog",
  about: "/about",
  contact: "/contact",
  gallery: "/gallery",
  home: "/",
  authentication: "/login",
  forms: "/contact",
  booking: "/book",
  seo: "/",
};

function database() {
  if (!db) throw new Error("Database connection is not configured.");
  return db;
}

async function read<K extends PageKind>(kind: K): Promise<PageDataMap[K]> {
  const [page] = await database()
    .select({ id: cmsPages.id })
    .from(cmsPages)
    .where(eq(cmsPages.key, `${kind}-page`))
    .limit(1);
  if (!page) return { ...defaults[kind] };
  const [section] = await database()
    .select({ content: cmsPageSections.content })
    .from(cmsPageSections)
    .where(
      and(
        eq(cmsPageSections.pageId, page.id),
        eq(cmsPageSections.sectionKey, "content"),
      ),
    )
    .limit(1);
  if (!section) return { ...defaults[kind] };
  try {
    const stored: unknown = JSON.parse(section.content);
    const candidate =
      kind === "home" && stored && typeof stored === "object"
        ? normalizeStoredHomePage(stored as Record<string, unknown>)
        : stored;
    const parsed = schemaByKind[kind].safeParse(candidate);
    if (parsed.success) return parsed.data as PageDataMap[K];
  } catch {
    /* defaults */
  }
  return { ...defaults[kind] };
}

/**
 * Homepage content predates the current floating-card contract. Merge stored
 * content over defaults so new fields remain backward compatible, then map
 * the legacy card fields. The Zod schema strips those obsolete keys.
 */
function normalizeStoredHomePage(stored: Record<string, unknown>) {
  const legacyBoldText =
    typeof stored["floatingTitle"] === "string"
      ? stored["floatingTitle"]
      : defaults.home.floatingBoldText;
  const legacyText =
    typeof stored["floatingDescription"] === "string"
      ? stored["floatingDescription"]
      : typeof stored["floatingSubtitle"] === "string"
        ? stored["floatingSubtitle"]
        : defaults.home.floatingText;

  return {
    ...defaults.home,
    ...stored,
    floatingIcon:
      typeof stored["floatingIcon"] === "string"
        ? stored["floatingIcon"]
        : defaults.home.floatingIcon,
    floatingBoldText:
      typeof stored["floatingBoldText"] === "string"
        ? stored["floatingBoldText"]
        : legacyBoldText,
    floatingText:
      typeof stored["floatingText"] === "string"
        ? stored["floatingText"]
        : legacyText,
  };
}

async function mediaUrl(id: string | null) {
  if (!id) return null;
  const [item] = await database()
    .select({ url: media.url })
    .from(media)
    .where(
      and(
        eq(media.id, id),
        eq(media.type, "image"),
        eq(media.lifecycleStatus, "ready"),
      ),
    )
    .limit(1);
  return item
    ? item.url.startsWith("/")
      ? item.url
      : resolveAssetReference(item.url) || item.url
    : null;
}

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
async function validateGeneralMedia(
  ids: Array<string | null>,
  requiredType: "website-media" | "blog" | "team",
) {
  const requested = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (!requested.length) return;
  const rows = await database()
    .select({
      id: media.id,
      type: media.type,
      lifecycle: media.lifecycleStatus,
      categoryOptionId: media.categoryOptionId,
      generalTypeId: media.generalSettingsTypeOptionId,
    })
    .from(media)
    .where(inArray(media.id, requested));
  const optionIds = rows
    .flatMap((row) => [row.categoryOptionId, row.generalTypeId])
    .filter((id): id is string => Boolean(id));
  const options = optionIds.length
    ? await database()
        .select()
        .from(cmsOtherSettingsOptions)
        .where(inArray(cmsOtherSettingsOptions.id, optionIds))
    : [];
  const byId = new Map(options.map((option) => [option.id, option]));
  const targetValues =
    requiredType === "blog"
      ? new Set(["blog", "blogs"])
      : new Set([requiredType]);
  for (const id of requested) {
    const item = rows.find((row) => row.id === id);
    const category = item?.categoryOptionId
      ? byId.get(item.categoryOptionId)
      : null;
    const generalType = item?.generalTypeId
      ? byId.get(item.generalTypeId)
      : null;
    if (
      !item ||
      item.type !== "image" ||
      item.lifecycle !== "ready" ||
      normalize(category?.value ?? category?.name ?? "") !== "general" ||
      !targetValues.has(
        normalize(generalType?.value ?? generalType?.name ?? ""),
      )
    ) {
      throw new Error(
        `Selected media must be General → ${requiredType === "website-media" ? "Website Media" : requiredType === "blog" ? "Blog" : "Team"}.`,
      );
    }
  }
}

async function save<K extends PageKind>(kind: K, input: PageDataMap[K]) {
  const admin = await requireAdmin();
  const data = schemaByKind[kind].parse(input) as PageDataMap[K];
  if (kind === "experiences" || kind === "contact" || kind === "gallery")
    await validateGeneralMedia(
      [
        (
          data as
            | CmsExperienceListingInput
            | CmsContactPageInput
            | CmsGalleryPageInput
        ).heroMediaId,
      ],
      "website-media",
    );
  if (kind === "blog")
    await validateGeneralMedia(
      [(data as CmsBlogListingInput).heroMediaId],
      "website-media",
    );
  if (kind === "about") {
    const about = data as CmsAboutPageInput;
    await validateGeneralMedia([about.heroMediaId], "website-media");
    await validateGeneralMedia(
      about.team.map((member) => member.photoMediaId),
      "team",
    );
  }
  if (kind === "home") {
    const home = data as CmsHomePageInput;
    await validateGeneralMedia(
      [
        home.heroMediaId,
        home.aboutBigMediaId,
        home.aboutSmallMediaId,
        home.ctaMediaId,
      ],
      "website-media",
    );
    const homepageGallery = await (
      await import("@/lib/content.server")
    ).getHomepageGalleryItems();
    const allowedIds = new Set(
      homepageGallery.flatMap((item) => (item.id ? [item.id] : [])),
    );
    if (home.galleryMediaIds.some((id) => !allowedIds.has(id)))
      throw new Error(
        "Homepage Gallery can only use ready Destination, Package, or Experience media.",
      );
  }
  if (kind === "seo") {
    await validateGeneralMedia(
      Object.values((data as CmsSeoInput).pages).map((page) => page.ogMediaId),
      "website-media",
    );
  }
  let [page] = await database()
    .select({ id: cmsPages.id })
    .from(cmsPages)
    .where(eq(cmsPages.key, `${kind}-page`))
    .limit(1);
  if (!page) {
    page = { id: randomUUID() };
    await database()
      .insert(cmsPages)
      .values({
        id: page.id,
        key: `${kind}-page`,
        name: `${kind[0]!.toUpperCase()}${kind.slice(1)} Page`,
        routePath: routeByKind[kind],
        status: "published",
        updatedByUserId: admin.id,
      });
  }
  await database()
    .insert(cmsPageSections)
    .values({
      id: randomUUID(),
      pageId: page.id,
      sectionKey: "content",
      schemaVersion: 1,
      content: JSON.stringify(data),
      enabled: true,
      sortOrder: 0,
      updatedByUserId: admin.id,
    })
    .onDuplicateKeyUpdate({
      set: {
        content: JSON.stringify(data),
        updatedByUserId: admin.id,
        updatedAt: new Date(),
      },
    });
  return read(kind);
}

export async function getCmsPageContent(kind: PageKind) {
  await requireAdmin();
  return read(kind);
}
export async function updateCmsExperienceListing(
  input: CmsExperienceListingInput,
) {
  return save("experiences", input);
}
export async function updateCmsBlogListing(input: CmsBlogListingInput) {
  return save("blog", input);
}
export async function updateCmsAboutPage(input: CmsAboutPageInput) {
  return save("about", input);
}
export async function updateCmsContactPage(input: CmsContactPageInput) {
  return save("contact", input);
}
export async function updateCmsGalleryPage(input: CmsGalleryPageInput) {
  return save("gallery", input);
}
export async function updateCmsHomePage(input: CmsHomePageInput) {
  return save("home", input);
}
export async function updateCmsAuthentication(input: CmsAuthenticationInput) {
  return save("authentication", input);
}
export async function updateCmsForms(input: CmsFormsInput) {
  return save("forms", input);
}
export async function updateCmsBookingPage(input: CmsBookingPageInput) {
  return save("booking", input);
}
export async function updateCmsSeo(input: CmsSeoInput) {
  return save("seo", input);
}
export async function getPublicExperienceListing() {
  const data = await read("experiences");
  return { ...data, heroImageUrl: await mediaUrl(data.heroMediaId) };
}
export async function getPublicBlogListing() {
  const data = await read("blog");
  const blogTypes = await database()
    .select({
      id: cmsOtherSettingsOptions.id,
      name: cmsOtherSettingsOptions.name,
    })
    .from(cmsOtherSettingsOptions)
    .where(eq(cmsOtherSettingsOptions.groupKey, "blog_type"));
  return { ...data, heroImageUrl: await mediaUrl(data.heroMediaId), blogTypes };
}
export async function getPublicAboutPage() {
  const data = await read("about");
  return {
    ...data,
    heroImageUrl: await mediaUrl(data.heroMediaId),
    team: await Promise.all(
      data.team.map(async (member) => ({
        ...member,
        photoUrl: await mediaUrl(member.photoMediaId),
      })),
    ),
  };
}
export async function getPublicContactPage() {
  const data = await read("contact");
  return { ...data, heroImageUrl: await mediaUrl(data.heroMediaId) };
}
export async function getPublicGalleryPage() {
  const data = await read("gallery");
  return { ...data, heroImageUrl: await mediaUrl(data.heroMediaId) };
}
export async function getPublicHomePage() {
  const data = await read("home");
  return {
    ...data,
    heroImageUrl: await mediaUrl(data.heroMediaId),
    aboutBigImageUrl: await mediaUrl(data.aboutBigMediaId),
    aboutSmallImageUrl: await mediaUrl(data.aboutSmallMediaId),
    ctaImageUrl: await mediaUrl(data.ctaMediaId),
  };
}
export async function getPublicAuthentication() {
  return read("authentication");
}
export async function getPublicForms() {
  return read("forms");
}
export async function getPublicBookingPage() {
  return read("booking");
}
export async function getPublicSeoPage(path: string) {
  const data = await read("seo");
  const page = data.pages[path];
  return page ? { ...page, ogImageUrl: await mediaUrl(page.ogMediaId) } : null;
}
