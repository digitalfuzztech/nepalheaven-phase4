import { createServerFn } from "@tanstack/react-start";
import {
  cmsPackageIdSchema,
  cmsPackageSaveSchema,
  cmsPackageStatusSchema,
} from "@/lib/cms-packages.schema";

export const getCmsPackagesFn = createServerFn({ method: "GET" }).handler(
  async () => (await import("@/lib/cms-packages.server")).getCmsPackages(),
);
export const getCmsPackageEditorDataFn = createServerFn({ method: "GET" })
  .validator(cmsPackageIdSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-packages.server")).getCmsPackageEditorData(
      data.id,
    ),
  );
export const getCmsNewPackageDataFn = createServerFn({ method: "GET" }).handler(
  async () =>
    (await import("@/lib/cms-packages.server")).getCmsPackageEditorData(),
);
export const createCmsPackageFn = createServerFn({ method: "POST" })
  .validator((data) => {
    if (!(data instanceof FormData))
      throw new Error("Expected Package form data.");
    return data;
  })
  .handler(async ({ data }) =>
    (await import("@/lib/cms-packages.server")).createCmsPackageFromFormData(
      data,
    ),
  );
export const updateCmsPackageFn = createServerFn({ method: "POST" })
  .validator(cmsPackageSaveSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-packages.server")).updateCmsPackage(data),
  );
export const updateCmsPackageStatusFn = createServerFn({ method: "POST" })
  .validator(cmsPackageStatusSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-packages.server")).updateCmsPackageStatus(
      data.id,
      data.status,
    ),
  );
export const deleteCmsPackageFn = createServerFn({ method: "POST" })
  .validator(cmsPackageIdSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-packages.server")).deleteCmsPackage(data.id),
  );
export const uploadCmsPackageMainImageFn = createServerFn({ method: "POST" })
  .validator((data) => {
    if (!(data instanceof FormData))
      throw new Error("Expected Package image form data.");
    return data;
  })
  .handler(async ({ data }) =>
    (
      await import("@/lib/cms-package-main-image.server")
    ).uploadCmsPackageMainImage(data),
  );
