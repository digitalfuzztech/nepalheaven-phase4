import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  cmsAboutPageSchema,
  cmsBlogListingSchema,
  cmsContactPageSchema,
  cmsExperienceListingSchema,
  cmsGalleryPageSchema,
} from "@/lib/cms-page-content.schema";
const kindSchema = z.enum([
  "experiences",
  "blog",
  "about",
  "contact",
  "gallery",
]);
export const getCmsPageContentFn = createServerFn({ method: "GET" })
  .validator(kindSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-page-content.server")).getCmsPageContent(data),
  );
export const updateCmsExperienceListingFn = createServerFn({ method: "POST" })
  .validator(cmsExperienceListingSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-page-content.server")).updateCmsExperienceListing(
      data,
    ),
  );
export const updateCmsBlogListingFn = createServerFn({ method: "POST" })
  .validator(cmsBlogListingSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-page-content.server")).updateCmsBlogListing(data),
  );
export const updateCmsAboutPageFn = createServerFn({ method: "POST" })
  .validator(cmsAboutPageSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-page-content.server")).updateCmsAboutPage(data),
  );
export const updateCmsContactPageFn = createServerFn({ method: "POST" })
  .validator(cmsContactPageSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-page-content.server")).updateCmsContactPage(data),
  );
export const updateCmsGalleryPageFn = createServerFn({ method: "POST" })
  .validator(cmsGalleryPageSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-page-content.server")).updateCmsGalleryPage(data),
  );
export const getPublicExperienceListingFn = createServerFn({
  method: "GET",
}).handler(async () =>
  (await import("@/lib/cms-page-content.server")).getPublicExperienceListing(),
);
export const getPublicBlogListingFn = createServerFn({ method: "GET" }).handler(
  async () =>
    (await import("@/lib/cms-page-content.server")).getPublicBlogListing(),
);
export const getPublicAboutPageFn = createServerFn({ method: "GET" }).handler(
  async () =>
    (await import("@/lib/cms-page-content.server")).getPublicAboutPage(),
);
export const getPublicContactPageFn = createServerFn({ method: "GET" }).handler(
  async () =>
    (await import("@/lib/cms-page-content.server")).getPublicContactPage(),
);
export const getPublicGalleryPageFn = createServerFn({ method: "GET" }).handler(
  async () =>
    (await import("@/lib/cms-page-content.server")).getPublicGalleryPage(),
);
