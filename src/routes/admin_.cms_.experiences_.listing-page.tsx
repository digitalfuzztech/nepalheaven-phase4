import { useState, type FormEvent } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Plus, Save, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsMediaPicker } from "@/components/admin/CmsMediaPicker";
import { getAdminSessionFn } from "@/lib/auth.functions";
import { getCmsSelectableImagesFn } from "@/lib/cms-media.functions";
import {
  getCmsPageContentFn,
  updateCmsExperienceListingFn,
} from "@/lib/cms-page-content.functions";
import {
  cmsExperienceListingSchema,
  type CmsExperienceListingInput,
} from "@/lib/cms-page-content.schema";
export const Route = createFileRoute("/admin_/cms_/experiences_/listing-page")({
  loader: async () => {
    if (!(await getAdminSessionFn())) throw redirect({ to: "/admin" });
    const [settings, images] = await Promise.all([
      getCmsPageContentFn({ data: "experiences" }),
      getCmsSelectableImagesFn(),
    ]);
    return { settings: settings as CmsExperienceListingInput, images };
  },
  component: Page,
});
function Page() {
  const { settings, images } = Route.useLoaderData();
  const [form, setForm] = useState(settings);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function save(e: FormEvent) {
    e.preventDefault();
    const parsed = cmsExperienceListingSchema.safeParse(form);
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    setBusy(true);
    try {
      setForm(await updateCmsExperienceListingFn({ data: parsed.data }));
      setMessage("Experiences listing page saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  const field = (
    label: string,
    key: keyof CmsExperienceListingInput,
    area = false,
  ) => (
    <label className="grid gap-2 text-xs font-semibold">
      {label}
      {area ? (
        <textarea
          rows={4}
          value={String(form[key])}
          onChange={(e) => setForm((x) => ({ ...x, [key]: e.target.value }))}
          className={control}
        />
      ) : (
        <input
          value={String(form[key])}
          onChange={(e) => setForm((x) => ({ ...x, [key]: e.target.value }))}
          className={control}
        />
      )}
    </label>
  );
  return (
    <AdminShell>
      <form onSubmit={(e) => void save(e)} className="p-5 sm:p-7 lg:p-8">
        <Link
          to="/admin/cms/experiences"
          className="text-sm font-semibold text-muted-foreground"
        >
          ← Back to Experiences
        </Link>
        <div className="mt-5 flex justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-gold">
              Experience CMS
            </p>
            <h1 className="mt-2 text-4xl font-semibold">
              Experiences Listing Page
            </h1>
          </div>
          <button
            disabled={busy}
            className="rounded-full bg-[#0c1724] px-5 py-3 text-white"
          >
            <Save className="mr-2 inline h-4 w-4 text-gold" />
            {busy ? "Saving..." : "Save Changes"}
          </button>
        </div>
        {message ? (
          <p className="mt-5 rounded-xl border bg-white p-4">{message}</p>
        ) : null}
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
            {field("Description", "heroDescription", true)}
          </Section>
          <Section title="Experience Cards Section">
            {field("Subtitle", "sectionTwoSubtitle")}
            {field("Title", "sectionTwoTitle")}
            {field("Description", "sectionTwoDescription", true)}
          </Section>
          <Section title="Bespoke Section">
            {field("Subtitle", "sectionThreeSubtitle")}
            {field("Title", "sectionThreeTitle")}
            {field("Description", "sectionThreeDescription", true)}
            {form.highlightedTexts.map((value, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={value}
                  onChange={(e) =>
                    setForm((x) => ({
                      ...x,
                      highlightedTexts: x.highlightedTexts.map((v, n) =>
                        n === i ? e.target.value : v,
                      ),
                    }))
                  }
                  className={control}
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm((x) => ({
                      ...x,
                      highlightedTexts: x.highlightedTexts.filter(
                        (_, n) => n !== i,
                      ),
                    }))
                  }
                  className="rounded-xl border p-3 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setForm((x) => ({
                  ...x,
                  highlightedTexts: [...x.highlightedTexts, ""],
                }))
              }
              className="w-fit rounded-xl border border-dashed px-4 py-3"
            >
              <Plus className="mr-2 inline h-4 w-4" />
              Add Highlighted Text
            </button>
          </Section>
        </div>
      </form>
    </AdminShell>
  );
}
const control =
  "w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-gold";
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
      <div className="mt-5 grid gap-5">{children}</div>
    </section>
  );
}
