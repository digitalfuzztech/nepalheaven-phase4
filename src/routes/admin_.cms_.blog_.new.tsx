import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsBlogEditor } from "@/components/admin/CmsBlogEditor";
import { getAdminSessionFn } from "@/lib/auth.functions";
import { getCmsOtherSettingsOptionsFn } from "@/lib/cms-other-settings.functions";
import { getCmsNewBlogDataFn } from "@/lib/cms-blog.functions";
export const Route = createFileRoute("/admin_/cms_/blog_/new")({
  loader: async () => {
    if (!(await getAdminSessionFn())) throw redirect({ to: "/admin" });
    const [data, options] = await Promise.all([
      getCmsNewBlogDataFn(),
      getCmsOtherSettingsOptionsFn(),
    ]);
    if (!data) throw new Error("Blog editor unavailable.");
    return { data, options };
  },
  component: Page,
});
function Page() {
  const { data, options } = Route.useLoaderData();
  return (
    <AdminShell>
      <div className="p-5 sm:p-7 lg:p-8">
        <CmsBlogEditor data={data} options={options} mode="create" />
      </div>
    </AdminShell>
  );
}
