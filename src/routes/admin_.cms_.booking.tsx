import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsBookingEditor } from "@/components/admin/CmsFinalCopyEditors";
import { getAdminSessionFn } from "@/lib/auth.functions";
import { getCmsPageContentFn } from "@/lib/cms-page-content.functions";
import type { CmsBookingPageInput } from "@/lib/cms-page-content.schema";
export const Route = createFileRoute("/admin_/cms_/booking")({
  loader: async () => {
    if (!(await getAdminSessionFn())) throw redirect({ to: "/admin" });
    return getCmsPageContentFn({
      data: "booking",
    }) as Promise<CmsBookingPageInput>;
  },
  component: Page,
});
function Page() {
  return (
    <AdminShell>
      <div className="p-5 sm:p-7 lg:p-8">
        <CmsBookingEditor initial={Route.useLoaderData()} />
      </div>
    </AdminShell>
  );
}
