import { useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsMediaPicker } from "@/components/admin/CmsMediaPicker";
import { getAdminSessionFn } from "@/lib/auth.functions";
import { getCmsSelectableImagesFn } from "@/lib/cms-media.functions";
import {
  getCmsPackageListingPageFn,
  updateCmsPackageListingPageFn,
} from "@/lib/cms-package-listing.functions";
import {
  cmsPackageListingPageSchema,
  type CmsPackageListingPageInput,
} from "@/lib/cms-package-listing.schema";

export const Route = createFileRoute("/admin_/cms_/packages_/listing-page")({
  loader: async () => {
    if (!(await getAdminSessionFn())) throw redirect({ to: "/admin" });
    const [settings, images] = await Promise.all([
      getCmsPackageListingPageFn(),
      getCmsSelectableImagesFn(),
    ]);
    return { settings, images };
  },
  component: Page,
});
function Page() {
  const { settings, images } = Route.useLoaderData();
  const [form, setForm] = useState<CmsPackageListingPageInput>(settings);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function save(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const parsed = cmsPackageListingPageSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    setBusy(true);
    try {
      setForm(await updateCmsPackageListingPageFn({ data: parsed.data }));
      setSuccess("Packages listing page saved successfully.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Packages listing page could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <AdminShell>
      <form onSubmit={(e) => void save(e)} className="p-5 sm:p-7 lg:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <Link
              to="/admin/cms/packages"
              className="text-sm font-semibold text-muted-foreground"
            >
              ← Back to Packages
            </Link>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-gold">
              Package CMS
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-[#0c1724]">
              Packages Listing Page
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage CMS-driven content for /packages. Package Type options load
              live from Other Settings.
            </p>
          </div>
          <button
            disabled={busy}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0c1724] px-5 py-3 text-sm font-semibold text-white"
          >
            <Save className="h-4 w-4 text-gold" />
            {busy ? "Saving…" : "Save Changes"}
          </button>
        </div>
        {error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}
        <div className="mt-8 grid gap-6">
          <Section
            title="Hero"
            description="Content displayed at the top of /packages."
          >
            <CmsMediaPicker
              label="Hero Image"
              description="Select an uncategorized image or General → Website Media. Deleted media safely falls back to the existing package listing image."
              value={form.heroMediaId}
              images={images}
              websiteMediaOnly
              onChange={(heroMediaId) =>
                setForm((x) => ({ ...x, heroMediaId }))
              }
            />
            <Text
              label="Subtitle"
              value={form.subtitle}
              onChange={(subtitle) => setForm((x) => ({ ...x, subtitle }))}
            />
            <Text
              label="Title"
              value={form.title}
              onChange={(title) => setForm((x) => ({ ...x, title }))}
            />
            <TextArea
              label="Description"
              value={form.description}
              onChange={(description) =>
                setForm((x) => ({ ...x, description }))
              }
            />
          </Section>
          <Section
            title="Search Form"
            description="Public package search wording."
          >
            <Text
              label="Search Input Placeholder"
              value={form.searchPlaceholder}
              onChange={(searchPlaceholder) =>
                setForm((x) => ({ ...x, searchPlaceholder }))
              }
            />
            <div className="rounded-xl bg-[#f8f8f6] p-4 text-sm">
              <strong>Package Type</strong>
              <p className="mt-1 text-muted-foreground">
                Options load live from CMS → Other Settings → Package Type.
              </p>
            </div>
          </Section>
        </div>
      </form>
    </AdminShell>
  );
}
const control =
  "w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-gold";
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 grid gap-5">{children}</div>
    </section>
  );
}
function Text({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="grid gap-2 text-xs font-semibold">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={control}
      />
    </label>
  );
}
function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="grid gap-2 text-xs font-semibold">
      {label}
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={control}
      />
    </label>
  );
}
