import { useState, type FormEvent } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsMediaPicker } from "@/components/admin/CmsMediaPicker";
import {
  CmsEditorAlert,
  CmsFloatingSave,
  CmsSaveButton,
} from "@/components/admin/CmsEditorControls";
import { getAdminSessionFn } from "@/lib/auth.functions";
import { getCmsSelectableImagesFn } from "@/lib/cms-media.functions";
import { getCmsBlogsFn } from "@/lib/cms-blog.functions";
import {
  getCmsPageContentFn,
  updateCmsBlogListingFn,
} from "@/lib/cms-page-content.functions";
import {
  cmsBlogListingSchema,
  type CmsBlogListingInput,
} from "@/lib/cms-page-content.schema";
export const Route = createFileRoute("/admin_/cms_/blog_/listing-page")({
  loader: async () => {
    if (!(await getAdminSessionFn())) throw redirect({ to: "/admin" });
    const [settings, images, posts] = await Promise.all([
      getCmsPageContentFn({ data: "blog" }),
      getCmsSelectableImagesFn(),
      getCmsBlogsFn(),
    ]);
    return { settings: settings as CmsBlogListingInput, images, posts };
  },
  component: Page,
});
function Page() {
  const { settings, images, posts } = Route.useLoaderData();
  const [form, setForm] = useState(settings);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  async function save(e: FormEvent) {
    e.preventDefault();
    const parsed = cmsBlogListingSchema.safeParse(form);
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "Check form.");
      return;
    }
    setBusy(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      setForm(await updateCmsBlogListingFn({ data: parsed.data }));
      setSuccessMessage("Blog listing saved.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not save.",
      );
    } finally {
      setBusy(false);
    }
  }
  const field = (label: string, key: keyof CmsBlogListingInput) => (
    <label className="grid gap-2 text-xs font-semibold">
      {label}
      <input
        value={String(form[key] ?? "")}
        onChange={(e) => setForm((x) => ({ ...x, [key]: e.target.value }))}
        className={control}
      />
    </label>
  );
  return (
    <AdminShell>
      <form onSubmit={(e) => void save(e)} className="p-5 sm:p-7 lg:p-8">
        <Link to="/admin/cms/blog">← Back to Blog</Link>
        <div className="mt-5 flex justify-between">
          <h1 className="text-4xl font-semibold">Blog Listing Page</h1>
          <CmsSaveButton busy={busy} label="Save Changes" type="submit" />
        </div>
        <CmsEditorAlert error={errorMessage} success={successMessage} />
        <div className="mt-8 grid gap-6">
          <Section title="Hero">
            <CmsMediaPicker
              label="Hero Image"
              value={form.heroMediaId}
              images={images}
              generalSettingsTypeValue="website-media"
              onChange={(heroMediaId) =>
                setForm((x) => ({ ...x, heroMediaId }))
              }
            />
            {field("Subtitle", "heroSubtitle")}
            {field("Title", "heroTitle")}
            <label className="grid gap-2 text-xs font-semibold">
              Description
              <textarea
                rows={4}
                value={form.heroDescription}
                onChange={(e) =>
                  setForm((x) => ({ ...x, heroDescription: e.target.value }))
                }
                className={control}
              />
            </label>
          </Section>
          <Section title="Primary / Featured Blog">
            <label className="grid gap-2 text-xs font-semibold">
              Primary Blog
              <select
                value={form.primaryBlogId ?? ""}
                onChange={(e) =>
                  setForm((x) => ({
                    ...x,
                    primaryBlogId: e.target.value || null,
                  }))
                }
                className={control}
              >
                <option value="">Latest published Blog</option>
                {posts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} · {p.status}
                  </option>
                ))}
              </select>
            </label>
            {field("Primary Link Text", "primaryLinkText")}
          </Section>
          <Section title="Newsletter">
            {field("Subtitle", "newsletterSubtitle")}
            {field("Title", "newsletterTitle")}
          </Section>
        </div>
        <CmsFloatingSave busy={busy} label="Save Changes" type="submit" />
      </form>
    </AdminShell>
  );
}
const control = "w-full rounded-xl border px-4 py-3";
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-white p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  );
}
