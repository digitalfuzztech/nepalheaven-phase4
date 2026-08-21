import { createFileRoute, Link, redirect } from "@tanstack/react-router";

import { Save, Plus, Trash2, Image } from "lucide-react";

import { useState, type FormEvent, type ReactNode } from "react";

import { AdminShell } from "@/components/admin/AdminShell";

import { getAdminSessionFn } from "@/lib/auth.functions";

import {
  getCmsGeneralSettingsFn,
  updateCmsGeneralSettingsFn,
} from "@/lib/cms-general.functions";

import {
  cmsGeneralSettingsInputSchema,
  type CmsGeneralSettingsInput,
} from "@/lib/cms-general.schema";

import { CmsMediaPicker } from "@/components/admin/CmsMediaPicker";
import { getCmsSelectableImagesFn } from "@/lib/cms-media.functions";

export const Route = createFileRoute("/admin_/cms_/general")({
  loader: async () => {
    const admin = await getAdminSessionFn();

    if (!admin) {
      throw redirect({
        to: "/admin",
        search: {
          redirect: "/admin/cms/general",
        },
      });
    }

    const [settings, images] = await Promise.all([
      getCmsGeneralSettingsFn(),
      getCmsSelectableImagesFn(),
    ]);

    return {
      admin,
      settings,
      images,
    };
  },

  component: GeneralSettingsPage,
});

type TextField = Exclude<
  keyof CmsGeneralSettingsInput,
  | "officeHours"
  | "officeLatitude"
  | "officeLongitude"
  | "mainLogoMediaId"
  | "lightLogoMediaId"
  | "faviconMediaId"
  | "defaultOgImageMediaId"
>;

function GeneralSettingsPage() {
  const { settings, images } = Route.useLoaderData();

  const [form, setForm] = useState<CmsGeneralSettingsInput>(settings);

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  function updateField(field: TextField, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateOfficeHour(
    index: number,
    field: "day" | "time",
    value: string,
  ) {
    setForm((current) => ({
      ...current,

      officeHours: current.officeHours.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }));
  }

  function addOfficeHour() {
    setForm((current) => ({
      ...current,

      officeHours: [
        ...current.officeHours,
        {
          day: "",
          time: "",
        },
      ],
    }));
  }

  function removeOfficeHour(index: number) {
    setForm((current) => ({
      ...current,

      officeHours: current.officeHours.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));
  }

  async function save(event: FormEvent) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const parsed = cmsGeneralSettingsInputSchema.safeParse(form);

    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ?? "Check the form and try again.",
      );

      return;
    }

    setBusy(true);

    try {
      const updated = await updateCmsGeneralSettingsFn({
        data: parsed.data,
      });

      setForm(updated);

      setSuccess("General Settings saved successfully.");
    } catch (saveError) {
      console.error("General Settings save failed", saveError);

      setError(
        "General Settings could not be saved. Your administrator session may have expired.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminShell>
      <form onSubmit={save} className="p-5 lg:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <Link
              to="/admin/cms"
              className="text-sm font-semibold text-muted-foreground transition hover:text-[#0c1724]"
            >
              ← Back to CMS
            </Link>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-gold">
              Global Website Settings
            </p>

            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0c1724]">
              General Settings
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Manage the canonical company identity, contact details, social
              profiles and default search metadata used throughout Nepal Heaven.
            </p>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0c1724] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16283b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />

            {busy ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6">
          {/* Identity */}
          <SettingsSection
            title="Website Identity"
            description="Canonical public identity for the Nepal Heaven website and company."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <CmsField
                label="Website Name"
                required
                value={form.websiteName}
                onChange={(value) => updateField("websiteName", value)}
              />

              <CmsField
                label="Company Name"
                required
                value={form.companyName}
                onChange={(value) => updateField("companyName", value)}
              />

              <div className="md:col-span-2">
                <CmsField
                  label="Tagline"
                  value={form.tagline}
                  onChange={(value) => updateField("tagline", value)}
                />
              </div>
            </div>
          </SettingsSection>

          {/* Media placeholder */}
          <SettingsSection
            title="Brand Media"
            description="Select reusable ready images from the Media Library. Changing these references does not delete the underlying media asset."
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <CmsMediaPicker
                label="Main Logo"
                description="Primary logo used on light website surfaces."
                value={form.mainLogoMediaId}
                images={images}
                onChange={(id) =>
                  setForm((current) => ({
                    ...current,

                    mainLogoMediaId: id,
                  }))
                }
              />

              <CmsMediaPicker
                label="Transparent Logo"
                description="Transparent/light logo for dark backgrounds, branded emails and invoice output. This reuses the existing light-logo setting."
                value={form.lightLogoMediaId}
                images={images}
                onChange={(id) =>
                  setForm((current) => ({
                    ...current,

                    lightLogoMediaId: id,
                  }))
                }
              />

              <CmsMediaPicker
                label="Favicon"
                description="Browser/site icon. A square source image is recommended."
                value={form.faviconMediaId}
                images={images}
                onChange={(id) =>
                  setForm((current) => ({
                    ...current,

                    faviconMediaId: id,
                  }))
                }
              />

              <CmsMediaPicker
                label="Default OG Image"
                description="Fallback social-sharing image when an individual page has no dedicated OG image."
                value={form.defaultOgImageMediaId}
                images={images}
                onChange={(id) =>
                  setForm((current) => ({
                    ...current,

                    defaultOgImageMediaId: id,
                  }))
                }
              />
            </div>
          </SettingsSection>

          {/* Contact */}
          <SettingsSection
            title="Contact Information"
            description="Global business contact information. Navbar, Footer and Contact will later reuse these values instead of duplicating them."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <CmsTextarea
                  label="Address"
                  value={form.address}
                  rows={3}
                  onChange={(value) => updateField("address", value)}
                />
              </div>

              <CmsField
                label="Country"
                value={form.country}
                onChange={(value) => updateField("country", value)}
              />

              <CmsField
                label="General Email"
                type="email"
                value={form.email}
                onChange={(value) => updateField("email", value)}
              />

              <CmsField
                label="Phone"
                value={form.phone}
                onChange={(value) => updateField("phone", value)}
              />

              <CmsField
                label="WhatsApp"
                value={form.whatsapp}
                onChange={(value) => updateField("whatsapp", value)}
              />

              <label className="grid gap-1.5 text-xs font-semibold text-[#0c1724]">
                Office Latitude
                <input
                  type="number"
                  min={-90}
                  max={90}
                  step="any"
                  value={form.officeLatitude ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      officeLatitude:
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                    }))
                  }
                  className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-gold"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-semibold text-[#0c1724]">
                Office Longitude
                <input
                  type="number"
                  min={-180}
                  max={180}
                  step="any"
                  value={form.officeLongitude ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      officeLongitude:
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                    }))
                  }
                  className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-gold"
                />
              </label>
            </div>
          </SettingsSection>

          {/* Office hours */}
          <SettingsSection
            title="Office Hours"
            description="Structured opening hours displayed to customers."
          >
            <div className="grid gap-3">
              {form.officeHours.map((item, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-xl border border-black/10 bg-black/[0.015] p-4 md:grid-cols-[1fr_1fr_auto]"
                >
                  <CmsField
                    label="Day / Period"
                    value={item.day}
                    onChange={(value) => updateOfficeHour(index, "day", value)}
                  />

                  <CmsField
                    label="Time"
                    value={item.time}
                    onChange={(value) => updateOfficeHour(index, "time", value)}
                  />

                  <button
                    type="button"
                    onClick={() => removeOfficeHour(index)}
                    className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addOfficeHour}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#0c1724] transition hover:bg-black/5"
              >
                <Plus className="h-4 w-4" />
                Add Hours
              </button>
            </div>
          </SettingsSection>

          {/* Social */}
          <SettingsSection
            title="Social Profiles"
            description="Leave a platform blank if Nepal Heaven does not use it."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <CmsField
                label="Facebook URL"
                value={form.facebookUrl}
                onChange={(value) => updateField("facebookUrl", value)}
              />

              <CmsField
                label="Instagram URL"
                value={form.instagramUrl}
                onChange={(value) => updateField("instagramUrl", value)}
              />

              <CmsField
                label="YouTube URL"
                value={form.youtubeUrl}
                onChange={(value) => updateField("youtubeUrl", value)}
              />

              <CmsField
                label="TikTok URL"
                value={form.tiktokUrl}
                onChange={(value) => updateField("tiktokUrl", value)}
              />

              <CmsField
                label="LinkedIn URL"
                value={form.linkedinUrl}
                onChange={(value) => updateField("linkedinUrl", value)}
              />

              <CmsField
                label="X / Twitter URL"
                value={form.xUrl}
                onChange={(value) => updateField("xUrl", value)}
              />
            </div>
          </SettingsSection>

          {/* Legal */}
          <SettingsSection
            title="Brand & Legal"
            description="Global footer/legal identity copy."
          >
            <CmsTextarea
              label="Copyright Text"
              value={form.copyrightText}
              rows={3}
              onChange={(value) => updateField("copyrightText", value)}
            />
          </SettingsSection>

          {/* SEO */}
          <SettingsSection
            title="Default SEO"
            description="Fallback metadata used when a page does not define its own SEO values."
          >
            <div className="grid gap-5">
              <CmsField
                label="Default SEO Title"
                value={form.defaultSeoTitle}
                onChange={(value) => updateField("defaultSeoTitle", value)}
              />

              <CmsTextarea
                label="Default Meta Description"
                value={form.defaultSeoDescription}
                rows={4}
                onChange={(value) =>
                  updateField("defaultSeoDescription", value)
                }
              />
            </div>
          </SettingsSection>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full bg-[#0c1724] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#16283b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />

              {busy ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </AdminShell>
  );
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm lg:p-7">
      <div className="border-b border-black/10 pb-5">
        <h2 className="text-lg font-semibold text-[#0c1724]">{title}</h2>

        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="pt-6">{children}</div>
    </section>
  );
}

function CmsField({
  label,
  value,
  onChange,
  required = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: "text" | "email";
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-[#0c1724]">
        {label}

        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm text-[#0c1724] outline-none transition placeholder:text-muted-foreground focus:border-gold"
      />
    </label>
  );
}

function CmsTextarea({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-[#0c1724]">{label}</span>

      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="resize-y rounded-xl border border-black/10 bg-white px-4 py-3 text-sm leading-relaxed text-[#0c1724] outline-none transition placeholder:text-muted-foreground focus:border-gold"
      />
    </label>
  );
}
