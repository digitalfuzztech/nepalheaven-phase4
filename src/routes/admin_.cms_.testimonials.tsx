import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsTestimonialsList } from "@/components/admin/CmsTestimonialsList";
import { getAdminSessionFn } from "@/lib/auth.functions";
import { listCmsTestimonialsFn } from "@/lib/cms-testimonials.functions";
export const Route = createFileRoute("/admin_/cms_/testimonials")({
  loader: async () => {
    if (!(await getAdminSessionFn())) throw redirect({ to: "/admin" });
    return listCmsTestimonialsFn();
  },
  component: Page,
});
function Page() {
  const rows = Route.useLoaderData();
  return (
    <AdminShell>
      <div className="p-5 sm:p-7 lg:p-8">
        <CmsTestimonialsList initial={rows} />
      </div>
    </AdminShell>
  );
}
