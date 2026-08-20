import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsBlogsList } from "@/components/admin/CmsBlogsList";
import { getAdminSessionFn } from "@/lib/auth.functions";
import { getCmsBlogsFn } from "@/lib/cms-blog.functions";
export const Route = createFileRoute("/admin_/cms_/blog")({
  loader: async () => {
    if (!(await getAdminSessionFn())) throw redirect({ to: "/admin" });
    return { posts: await getCmsBlogsFn() };
  },
  component: Page,
});
function Page() {
  return (
    <AdminShell>
      <div className="p-5 sm:p-7 lg:p-8">
        <CmsBlogsList posts={Route.useLoaderData().posts} />
      </div>
    </AdminShell>
  );
}
