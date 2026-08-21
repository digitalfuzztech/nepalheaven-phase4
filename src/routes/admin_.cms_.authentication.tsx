import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsAuthenticationEditor } from "@/components/admin/CmsFinalCopyEditors";
import { getAdminSessionFn } from "@/lib/auth.functions";
import { getCmsPageContentFn } from "@/lib/cms-page-content.functions";
import type { CmsAuthenticationInput } from "@/lib/cms-page-content.schema";
export const Route = createFileRoute("/admin_/cms_/authentication")({
  loader: async () => {
    if (!(await getAdminSessionFn())) throw redirect({ to: "/admin" });
    return getCmsPageContentFn({
      data: "authentication",
    }) as Promise<CmsAuthenticationInput>;
  },
  component: Page,
});
function Page() {
  return (
    <AdminShell>
      <div className="p-5 sm:p-7 lg:p-8">
        <CmsAuthenticationEditor initial={Route.useLoaderData()} />
      </div>
    </AdminShell>
  );
}
