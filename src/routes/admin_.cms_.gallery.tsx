import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsGalleryEditor } from "@/components/admin/CmsGalleryEditor";
import { getAdminSessionFn } from "@/lib/auth.functions";
import { getCmsSelectableImagesFn } from "@/lib/cms-media.functions";
import { getCmsPageContentFn } from "@/lib/cms-page-content.functions";
import type { CmsGalleryPageInput } from "@/lib/cms-page-content.schema";

export const Route = createFileRoute("/admin_/cms_/gallery")({
  loader: async () => {
    if (!(await getAdminSessionFn()))
      throw redirect({
        to: "/admin",
        search: { redirect: "/admin/cms/gallery" },
      });
    const [page, images] = await Promise.all([
      getCmsPageContentFn({ data: "gallery" }),
      getCmsSelectableImagesFn(),
    ]);
    return { page: page as CmsGalleryPageInput, images };
  },
  component: Page,
});
function Page() {
  const { page, images } = Route.useLoaderData();
  return (
    <AdminShell>
      <div className="p-5 sm:p-7 lg:p-8">
        <CmsGalleryEditor initial={page} images={images} />
      </div>
    </AdminShell>
  );
}
