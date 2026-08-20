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
  type CmsAboutPageInput,
  type CmsBlogListingInput,
  type CmsContactPageInput,
  type CmsExperienceListingInput,
} from "@/lib/cms-page-content.schema";

type PageDataMap = {
  experiences: CmsExperienceListingInput;
  blog: CmsBlogListingInput;
  about: CmsAboutPageInput;
  contact: CmsContactPageInput;
};

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
};

type PageKind = keyof PageDataMap;
const schemaByKind = {
  experiences: cmsExperienceListingSchema,
  blog: cmsBlogListingSchema,
  about: cmsAboutPageSchema,
  contact: cmsContactPageSchema,
};
const routeByKind = {
  experiences: "/experiences",
  blog: "/blog",
  about: "/about",
  contact: "/contact",
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
    const parsed = schemaByKind[kind].safeParse(JSON.parse(section.content));
    if (parsed.success) return parsed.data as PageDataMap[K];
  } catch {
    /* defaults */
  }
  return { ...defaults[kind] };
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
  if (kind === "experiences" || kind === "contact")
    await validateGeneralMedia(
      [(data as CmsExperienceListingInput | CmsContactPageInput).heroMediaId],
      "website-media",
    );
  if (kind === "blog")
    await validateGeneralMedia(
      [(data as CmsBlogListingInput).heroMediaId],
      "blog",
    );
  if (kind === "about") {
    const about = data as CmsAboutPageInput;
    await validateGeneralMedia([about.heroMediaId], "website-media");
    await validateGeneralMedia(
      about.team.map((member) => member.photoMediaId),
      "team",
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
