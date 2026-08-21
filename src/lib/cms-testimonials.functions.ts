import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  cmsTestimonialIdSchema,
  cmsTestimonialInputSchema,
} from "@/lib/cms-testimonials.schema";
export const listCmsTestimonialsFn = createServerFn({ method: "GET" }).handler(
  async () =>
    (await import("@/lib/cms-testimonials.server")).listCmsTestimonials(),
);
export const getCmsTestimonialFn = createServerFn({ method: "GET" })
  .validator(cmsTestimonialIdSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-testimonials.server")).getCmsTestimonial(data.id),
  );
export const getCmsTestimonialAssociationsFn = createServerFn({
  method: "GET",
}).handler(async () =>
  (
    await import("@/lib/cms-testimonials.server")
  ).getCmsTestimonialAssociations(),
);
export const saveCmsTestimonialFn = createServerFn({ method: "POST" })
  .validator(cmsTestimonialInputSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-testimonials.server")).saveCmsTestimonial(data),
  );
export const uploadCmsTestimonialPhotoFn = createServerFn({ method: "POST" })
  .validator((value) => {
    if (!(value instanceof FormData))
      throw new Error("Expected photo form data.");
    return value;
  })
  .handler(async ({ data }) =>
    (await import("@/lib/cms-testimonials.server")).uploadCmsTestimonialPhoto(
      data,
    ),
  );
export const deleteCmsTestimonialFn = createServerFn({ method: "POST" })
  .validator(cmsTestimonialIdSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-testimonials.server")).deleteCmsTestimonial(data),
  );
