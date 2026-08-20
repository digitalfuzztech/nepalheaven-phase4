import { createServerFn } from "@tanstack/react-start";
import { cmsPackageListingPageSchema } from "@/lib/cms-package-listing.schema";
export const getCmsPackageListingPageFn = createServerFn({ method: "GET" }).handler(async () => (await import("@/lib/cms-package-listing.server")).getCmsPackageListingPage());
export const updateCmsPackageListingPageFn = createServerFn({ method: "POST" }).validator(cmsPackageListingPageSchema).handler(async ({ data }) => (await import("@/lib/cms-package-listing.server")).updateCmsPackageListingPage(data));
export const getPublicPackageListingPageFn = createServerFn({ method: "GET" }).handler(async () => (await import("@/lib/cms-package-listing.server")).getPublicPackageListingPage());
