import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsExperiencesList } from "@/components/admin/CmsExperiencesList";
import { getAdminSessionFn } from "@/lib/auth.functions";
import { getCmsExperiencesFn } from "@/lib/cms-experiences.functions";
export const Route = createFileRoute("/admin_/cms_/experiences")({
  loader: async () => {
    if (!(await getAdminSessionFn())) throw redirect({ to: "/admin" });
    return { experiences: await getCmsExperiencesFn() };
  },
  component: Page,
});
function Page() {
  const { experiences } = Route.useLoaderData();
  return (
    <AdminShell>
      <div className="p-5 sm:p-7 lg:p-8">
        <CmsExperiencesList experiences={experiences} />
      </div>
    </AdminShell>
  );
}
