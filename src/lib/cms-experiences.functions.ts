import { createServerFn } from "@tanstack/react-start";
import {
  cmsExperienceIdSchema,
  cmsExperienceSaveSchema,
  cmsExperienceStatusSchema,
} from "@/lib/cms-experiences.schema";
export const getCmsExperiencesFn = createServerFn({ method: "GET" }).handler(
  async () =>
    (await import("@/lib/cms-experiences.server")).getCmsExperiences(),
);
export const getCmsExperienceEditorDataFn = createServerFn({ method: "GET" })
  .validator(cmsExperienceIdSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-experiences.server")).getCmsExperienceEditorData(
      data.id,
    ),
  );
export const getCmsNewExperienceDataFn = createServerFn({
  method: "GET",
}).handler(async () =>
  (await import("@/lib/cms-experiences.server")).getCmsExperienceEditorData(),
);
export const createCmsExperienceFn = createServerFn({ method: "POST" })
  .validator((data) => {
    if (!(data instanceof FormData))
      throw new Error("Expected Experience form data.");
    return data;
  })
  .handler(async ({ data }) =>
    (
      await import("@/lib/cms-experiences.server")
    ).createCmsExperienceFromFormData(data),
  );
export const updateCmsExperienceFn = createServerFn({ method: "POST" })
  .validator(cmsExperienceSaveSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-experiences.server")).updateCmsExperience(data),
  );
export const updateCmsExperienceStatusFn = createServerFn({ method: "POST" })
  .validator(cmsExperienceStatusSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-experiences.server")).updateCmsExperienceStatus(
      data.id,
      data.status,
    ),
  );
export const deleteCmsExperienceFn = createServerFn({ method: "POST" })
  .validator(cmsExperienceIdSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-experiences.server")).deleteCmsExperience(data.id),
  );
export const uploadCmsExperienceMainImageFn = createServerFn({ method: "POST" })
  .validator((data) => {
    if (!(data instanceof FormData))
      throw new Error("Expected image form data.");
    return data;
  })
  .handler(async ({ data }) =>
    (
      await import("@/lib/cms-experience-main-image.server")
    ).uploadCmsExperienceMainImage(data),
  );
