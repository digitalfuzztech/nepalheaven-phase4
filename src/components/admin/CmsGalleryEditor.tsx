import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CmsMediaPicker,
  type CmsSelectableImage,
} from "@/components/admin/CmsMediaPicker";
import {
  CmsEditorAlert,
  CmsFloatingSave,
  CmsSaveButton,
} from "@/components/admin/CmsEditorControls";
import { updateCmsGalleryPageFn } from "@/lib/cms-page-content.functions";
import {
  cmsGalleryPageSchema,
  type CmsGalleryPageInput,
} from "@/lib/cms-page-content.schema";

export function CmsGalleryEditor({
  initial,
  images,
}: {
  initial: CmsGalleryPageInput;
  images: CmsSelectableImage[];
}) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function save() {
    setError("");
    setSuccess("");
    const parsed = cmsGalleryPageSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    setBusy(true);
    try {
      setForm(await updateCmsGalleryPageFn({ data: parsed.data }));
      setSuccess("Gallery page saved successfully.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Gallery page could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pb-16">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <Link
            to="/admin/cms"
            className="text-sm font-semibold text-muted-foreground transition hover:text-[#0c1724]"
          >
            ← Back to CMS
          </Link>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-gold">
            Gallery CMS
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-[#0c1724]">
            Gallery Page
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage only the public Gallery hero. Gallery filters and media
            behavior remain unchanged.
          </p>
        </div>
        <CmsSaveButton
          busy={busy}
          label="Save Gallery Page"
          type="button"
          onClick={() => void save()}
        />
      </div>
      <CmsEditorAlert error={error} success={success} />
      <section className="mt-8 rounded-2xl border border-black/10 bg-white p-5 shadow-sm lg:p-6">
        <h2 className="text-lg font-semibold text-[#0c1724]">Hero</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a General → Website Media image and edit the existing PageHero
          text.
        </p>
        <div className="mt-5 grid gap-5">
          <CmsMediaPicker
            label="Hero Image"
            description="General → Website Media only."
            value={form.heroMediaId}
            images={images}
            generalSettingsTypeValue="website-media"
            onChange={(heroMediaId) =>
              setForm((current) => ({ ...current, heroMediaId }))
            }
          />
          <Field label="Subtitle">
            <input
              value={form.heroSubtitle}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  heroSubtitle: event.target.value,
                }))
              }
              className={control}
            />
          </Field>
          <Field label="Title">
            <input
              value={form.heroTitle}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  heroTitle: event.target.value,
                }))
              }
              className={control}
            />
          </Field>
          <Field label="Description">
            <textarea
              rows={5}
              value={form.heroDescription}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  heroDescription: event.target.value,
                }))
              }
              className={control}
            />
          </Field>
        </div>
      </section>
      <CmsFloatingSave
        busy={busy}
        label="Save Gallery Page"
        onClick={() => void save()}
      />
    </div>
  );
}
const control =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-gold";
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-semibold text-[#0c1724]">
      {label}
      {children}
    </label>
  );
}
