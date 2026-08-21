import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsTestimonialEditor } from "@/components/admin/CmsTestimonialEditor";
import { getAdminSessionFn } from "@/lib/auth.functions";
import { getCmsTestimonialAssociationsFn } from "@/lib/cms-testimonials.functions";
export const Route = createFileRoute("/admin_/cms_/testimonials_/new")({
  loader: async () => {
    if (!(await getAdminSessionFn())) throw redirect({ to: "/admin" });
    return getCmsTestimonialAssociationsFn();
  },
  component: Page,
});
function Page() {
  const associations = Route.useLoaderData();
  return (
    <AdminShell>
      <div className="p-5 sm:p-7 lg:p-8">
        <CmsTestimonialEditor
          associations={associations}
          initial={{
            name: "",
            content: "",
            rating: 5,
            countryCode: "NP",
            associationType: null,
            associatedEntityId: null,
            sortOrder: 0,
          }}
        />
      </div>
    </AdminShell>
  );
}
