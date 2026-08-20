import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsContactEditor } from "@/components/admin/CmsContactEditor";
import { getAdminSessionFn } from "@/lib/auth.functions";
import { getCmsSelectableImagesFn } from "@/lib/cms-media.functions";
import { getCmsPageContentFn } from "@/lib/cms-page-content.functions";
import type { CmsContactPageInput } from "@/lib/cms-page-content.schema";
export const Route = createFileRoute("/admin_/cms_/contact")({
  loader: async () => {
    if (!(await getAdminSessionFn())) throw redirect({ to: "/admin" });
    const [page, images] = await Promise.all([
      getCmsPageContentFn({ data: "contact" }),
      getCmsSelectableImagesFn(),
    ]);
    return { page: page as CmsContactPageInput, images };
  },
  component: Page,
});
function Page() {
  const { page, images } = Route.useLoaderData();
  return (
    <AdminShell>
      <div className="p-5 sm:p-7 lg:p-8">
        <CmsContactEditor initial={page} images={images} />
      </div>
    </AdminShell>
  );
}
