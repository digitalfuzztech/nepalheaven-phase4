import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsAboutEditor } from "@/components/admin/CmsAboutEditor";
import { getAdminSessionFn } from "@/lib/auth.functions";
import { getCmsSelectableImagesFn } from "@/lib/cms-media.functions";
import { getCmsPageContentFn } from "@/lib/cms-page-content.functions";
import { getPublicSiteSettingsFn } from "@/lib/content.functions";
import type { CmsAboutPageInput } from "@/lib/cms-page-content.schema";
export const Route = createFileRoute("/admin_/cms_/about")({
  loader: async () => {
    if (!(await getAdminSessionFn())) throw redirect({ to: "/admin" });
    const [raw, images, legacy] = await Promise.all([
      getCmsPageContentFn({ data: "about" }),
      getCmsSelectableImagesFn(),
      getPublicSiteSettingsFn(),
    ]);
    const page = raw as CmsAboutPageInput;
    return {
      images,
      page: {
        ...page,
        counters: page.counters.length
          ? page.counters
          : legacy.stats
              .slice(0, 4)
              .map((x) => ({
                number: x.value,
                symbol: x.suffix,
                text: x.label,
              })),
        team: page.team.length
          ? page.team
          : legacy.team.map((x) => ({
              photoMediaId: null,
              name: x.name,
              position: x.role,
              achievement: x.bio,
            })),
        milestones: page.milestones.length
          ? page.milestones
          : legacy.milestones.map((x) => ({
              year: x.year,
              title: x.title,
              description: x.detail,
            })),
        awards: page.awards.length ? page.awards : legacy.awards,
        partners: page.partners.length ? page.partners : legacy.partners,
      },
    };
  },
  component: Page,
});
function Page() {
  const { page, images } = Route.useLoaderData();
  return (
    <AdminShell>
      <div className="min-w-0 max-w-full p-5 sm:p-7 lg:p-8">
        <CmsAboutEditor initial={page} images={images} />
      </div>
    </AdminShell>
  );
}
