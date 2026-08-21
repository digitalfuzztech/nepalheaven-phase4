import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsTestimonialEditor } from "@/components/admin/CmsTestimonialEditor";
import { getAdminSessionFn } from "@/lib/auth.functions";
import {
  getCmsTestimonialAssociationsFn,
  getCmsTestimonialFn,
} from "@/lib/cms-testimonials.functions";
export const Route = createFileRoute("/admin_/cms_/testimonials_/$id")({
  loader: async ({ params }) => {
    if (!(await getAdminSessionFn())) throw redirect({ to: "/admin" });
    const [item, associations] = await Promise.all([
      getCmsTestimonialFn({ data: { id: params.id } }),
      getCmsTestimonialAssociationsFn(),
    ]);
    return { item, associations };
  },
  component: Page,
});
function Page() {
  const { item, associations } = Route.useLoaderData();
  return (
    <AdminShell>
      <div className="p-5 sm:p-7 lg:p-8">
        <CmsTestimonialEditor
          associations={associations}
          avatarUrl={item.avatarUrl}
          initial={{
            id: item.id,
            name: item.name,
            content: item.content,
            rating: item.rating,
            countryCode: item.countryCode,
            associationType: item.associationType,
            associatedEntityId: item.associatedEntityId,
            sortOrder: item.sortOrder,
          }}
        />
      </div>
    </AdminShell>
  );
}
