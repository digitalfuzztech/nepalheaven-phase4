import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
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
} from "@/lib/cms-page-content.schema";
const kindSchema = z.enum([
  "experiences",
  "blog",
  "about",
  "contact",
  "gallery",
  "home",
  "authentication",
  "forms",
  "booking",
  "seo",
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
export const updateCmsHomePageFn = createServerFn({ method: "POST" })
  .validator(cmsHomePageSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-page-content.server")).updateCmsHomePage(data),
  );
export const updateCmsAuthenticationFn = createServerFn({ method: "POST" })
  .validator(cmsAuthenticationSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-page-content.server")).updateCmsAuthentication(
      data,
    ),
  );
export const updateCmsFormsFn = createServerFn({ method: "POST" })
  .validator(cmsFormsSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-page-content.server")).updateCmsForms(data),
  );
export const updateCmsBookingPageFn = createServerFn({ method: "POST" })
  .validator(cmsBookingPageSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-page-content.server")).updateCmsBookingPage(data),
  );
export const updateCmsSeoFn = createServerFn({ method: "POST" })
  .validator(cmsSeoSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-page-content.server")).updateCmsSeo(data),
  );
export const getPublicHomePageFn = createServerFn({ method: "GET" }).handler(
  async () =>
    (await import("@/lib/cms-page-content.server")).getPublicHomePage(),
);
export const getPublicAuthenticationFn = createServerFn({
  method: "GET",
}).handler(async () =>
  (await import("@/lib/cms-page-content.server")).getPublicAuthentication(),
);
export const getPublicFormsFn = createServerFn({ method: "GET" }).handler(
  async () => (await import("@/lib/cms-page-content.server")).getPublicForms(),
);
export const getPublicBookingPageFn = createServerFn({ method: "GET" }).handler(
  async () =>
    (await import("@/lib/cms-page-content.server")).getPublicBookingPage(),
);
export const getPublicSeoPageFn = createServerFn({ method: "GET" })
  .validator(z.string().max(191))
  .handler(async ({ data }) =>
    (await import("@/lib/cms-page-content.server")).getPublicSeoPage(data),
  );
