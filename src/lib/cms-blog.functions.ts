import { createServerFn } from "@tanstack/react-start";
import { cmsBlogIdSchema, cmsBlogStatusSchema } from "@/lib/cms-blog.schema";
export const getCmsBlogsFn = createServerFn({ method: "GET" }).handler(
  async () => (await import("@/lib/cms-blog.server")).getCmsBlogs(),
);
export const getCmsBlogEditorDataFn = createServerFn({ method: "GET" })
  .validator(cmsBlogIdSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-blog.server")).getCmsBlogEditorData(data.id),
  );
export const getCmsNewBlogDataFn = createServerFn({ method: "GET" }).handler(
  async () => (await import("@/lib/cms-blog.server")).getCmsBlogEditorData(),
);
export const saveCmsBlogFn = createServerFn({ method: "POST" })
  .validator((data) => {
    if (!(data instanceof FormData))
      throw new Error("Expected Blog form data.");
    return data;
  })
  .handler(async ({ data }) =>
    (await import("@/lib/cms-blog.server")).saveCmsBlogForm(data),
  );
export const updateCmsBlogStatusFn = createServerFn({ method: "POST" })
  .validator(cmsBlogStatusSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-blog.server")).updateCmsBlogStatus(
      data.id,
      data.status,
    ),
  );
export const deleteCmsBlogFn = createServerFn({ method: "POST" })
  .validator(cmsBlogIdSchema)
  .handler(async ({ data }) =>
    (await import("@/lib/cms-blog.server")).deleteCmsBlog(data.id),
  );
