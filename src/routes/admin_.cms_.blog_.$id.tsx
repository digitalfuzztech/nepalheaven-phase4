import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsBlogEditor } from "@/components/admin/CmsBlogEditor";
import { getAdminSessionFn } from "@/lib/auth.functions";
import { getCmsOtherSettingsOptionsFn } from "@/lib/cms-other-settings.functions";
import { getCmsBlogEditorDataFn } from "@/lib/cms-blog.functions";
export const Route = createFileRoute("/admin_/cms_/blog_/$id")({
  loader: async ({ params }) => {
    if (!(await getAdminSessionFn())) throw redirect({ to: "/admin" });
    const [data, options] = await Promise.all([
      getCmsBlogEditorDataFn({ data: { id: params.id } }),
      getCmsOtherSettingsOptionsFn(),
    ]);
    if (!data) throw redirect({ to: "/admin/cms/blog" });
    return { data, options };
  },
  component: Page,
});
function Page() {
  const { data, options } = Route.useLoaderData();
  return (
    <AdminShell>
      <div className="p-5 sm:p-7 lg:p-8">
        <CmsBlogEditor data={data} options={options} mode="edit" />
      </div>
    </AdminShell>
  );
}
