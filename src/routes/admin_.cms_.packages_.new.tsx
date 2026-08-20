import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsPackageEditor } from "@/components/admin/CmsPackageEditor";
import { getAdminSessionFn } from "@/lib/auth.functions";
import { getCmsOtherSettingsOptionsFn } from "@/lib/cms-other-settings.functions";
import { getCmsNewPackageDataFn } from "@/lib/cms-packages.functions";
export const Route = createFileRoute("/admin_/cms_/packages_/new")({
  loader: async () => {
    if (!(await getAdminSessionFn())) throw redirect({ to: "/admin" });
    const [data, options] = await Promise.all([
      getCmsNewPackageDataFn(),
      getCmsOtherSettingsOptionsFn(),
    ]);
    if (!data) throw new Error("Package editor data could not be loaded.");
    return { data, options };
  },
  component: Page,
});
function Page() {
  const { data, options } = Route.useLoaderData();
  return (
    <AdminShell>
      <div className="p-5 sm:p-7 lg:p-8">
        <CmsPackageEditor data={data} options={options} mode="create" />
      </div>
    </AdminShell>
  );
}
