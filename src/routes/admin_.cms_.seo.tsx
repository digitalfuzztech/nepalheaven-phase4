import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsSeoEditor } from "@/components/admin/CmsFinalCopyEditors";
import { getAdminSessionFn } from "@/lib/auth.functions";
import { getCmsSelectableImagesFn } from "@/lib/cms-media.functions";
import { getCmsPageContentFn } from "@/lib/cms-page-content.functions";
import type { CmsSeoInput } from "@/lib/cms-page-content.schema";
export const Route = createFileRoute("/admin_/cms_/seo")({
  loader: async () => {
    if (!(await getAdminSessionFn())) throw redirect({ to: "/admin" });
    const [page, images] = await Promise.all([
      getCmsPageContentFn({ data: "seo" }),
      getCmsSelectableImagesFn(),
    ]);
    return { page: page as CmsSeoInput, images };
  },
  component: Page,
});
function Page() {
  const data = Route.useLoaderData();
  return (
    <AdminShell>
      <div className="p-5 sm:p-7 lg:p-8">
        <CmsSeoEditor initial={data.page} images={data.images} />
      </div>
    </AdminShell>
  );
}
