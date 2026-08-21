import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsHomeEditor } from "@/components/admin/CmsHomeEditor";
import { getAdminSessionFn } from "@/lib/auth.functions";
import { getCmsSelectableImagesFn } from "@/lib/cms-media.functions";
import { getCmsPageContentFn } from "@/lib/cms-page-content.functions";
import { getPublicAboutPageFn } from "@/lib/cms-page-content.functions";
import { getHomeContentFn } from "@/lib/content.functions";
import type { CmsHomePageInput } from "@/lib/cms-page-content.schema";

export const Route = createFileRoute("/admin_/cms_/home")({
  loader: async () => {
    if (!(await getAdminSessionFn())) throw redirect({ to: "/admin" });
    const [page, images, content, about] = await Promise.all([
      getCmsPageContentFn({ data: "home" }),
      getCmsSelectableImagesFn(),
      getHomeContentFn(),
      getPublicAboutPageFn(),
    ]);
    return {
      page: page as CmsHomePageInput,
      images,
      destinations: content.destinations.flatMap((item) =>
        item.id ? [{ id: item.id, title: item.name }] : [],
      ),
      packages: content.packages.flatMap((item) =>
        item.id ? [{ id: item.id, title: item.title }] : [],
      ),
      blogs: content.posts.map((item) => ({ id: item.id, title: item.title })),
      gallery: content.galleryItems.flatMap((item) => {
        if (!item.id) return [];
        const preview = item.image ?? item.thumbnail ?? item.videoUrl;
        return preview
          ? [{ id: item.id, title: item.title, type: item.type, preview }]
          : [];
      }),
      aboutCounters: about.counters,
    };
  },
  component: Page,
});

function Page() {
  const data = Route.useLoaderData();
  return (
    <AdminShell>
      <div className="p-5 sm:p-7 lg:p-8">
        <CmsHomeEditor initial={data.page} {...data} />
      </div>
    </AdminShell>
  );
}
