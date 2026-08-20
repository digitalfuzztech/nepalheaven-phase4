import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsExperienceEditor } from "@/components/admin/CmsExperienceEditor";
import { getAdminSessionFn } from "@/lib/auth.functions";
import { getCmsOtherSettingsOptionsFn } from "@/lib/cms-other-settings.functions";
import { getCmsExperienceEditorDataFn } from "@/lib/cms-experiences.functions";
export const Route = createFileRoute("/admin_/cms_/experiences_/$id")({
  loader: async ({ params }) => {
    if (!(await getAdminSessionFn())) throw redirect({ to: "/admin" });
    const [data, options] = await Promise.all([
      getCmsExperienceEditorDataFn({ data: { id: params.id } }),
      getCmsOtherSettingsOptionsFn(),
    ]);
    if (!data) throw redirect({ to: "/admin/cms/experiences" });
    return { data, options };
  },
  component: Page,
});
function Page() {
  const { data, options } = Route.useLoaderData();
  return (
    <AdminShell>
      <div className="p-5 sm:p-7 lg:p-8">
        <CmsExperienceEditor data={data} options={options} mode="edit" />
      </div>
    </AdminShell>
  );
}
