import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  CmsEditorAlert,
  CmsFloatingSave,
  CmsSaveButton,
} from "@/components/admin/CmsEditorControls";
import {
  CmsMediaPicker,
  type CmsSelectableImage,
} from "@/components/admin/CmsMediaPicker";
import {
  cmsAuthenticationSchema,
  cmsBookingPageSchema,
  cmsFormsSchema,
  cmsSeoSchema,
  type CmsAuthenticationInput,
  type CmsBookingPageInput,
  type CmsFormsInput,
  type CmsSeoInput,
} from "@/lib/cms-page-content.schema";
import {
  updateCmsAuthenticationFn,
  updateCmsBookingPageFn,
  updateCmsFormsFn,
  updateCmsSeoFn,
} from "@/lib/cms-page-content.functions";

type TextRecord = Record<string, string>;
function humanize(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
}
function Frame({
  title,
  subtitle,
  busy,
  error,
  success,
  save,
  children,
}: {
  title: string;
  subtitle: string;
  busy: boolean;
  error: string;
  success: string;
  save: () => void;
  children: ReactNode;
}) {
  return (
    <div className="pb-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <Link
            to="/admin/cms"
            className="text-sm font-semibold text-muted-foreground"
          >
            ← Back to CMS
          </Link>
          <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-gold">
            {subtitle}
          </p>
          <h1 className="mt-2 text-4xl font-semibold">{title}</h1>
        </div>
        <CmsSaveButton busy={busy} label="Save Changes" onClick={save} />
      </div>
      <CmsEditorAlert error={error} success={success} />
      {children}
      <CmsFloatingSave busy={busy} label="Save Changes" onClick={save} />
    </div>
  );
}
function Tabs<K extends string>({
  tabs,
  active,
  setActive,
}: {
  tabs: readonly K[];
  active: K;
  setActive: (key: K) => void;
}) {
  return (
    <div className="mt-8 flex flex-wrap gap-2">
      {tabs.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => setActive(key)}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${active === key ? "bg-[#0c1724] text-white" : "border bg-white"}`}
        >
          {humanize(key)}
        </button>
      ))}
    </div>
  );
}
function TextFields<T extends TextRecord>({
  value,
  onChange,
}: {
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {(Object.keys(value) as Array<keyof T>).map((key) => {
        const area = /description|text|error/i.test(String(key));
        return (
          <label
            key={String(key)}
            className={`grid gap-2 text-xs font-semibold ${area ? "md:col-span-2" : ""}`}
          >
            {humanize(String(key))}
            {area ? (
              <textarea
                rows={3}
                value={value[key]}
                onChange={(event) =>
                  onChange({ ...value, [key]: event.target.value })
                }
                className={control}
              />
            ) : (
              <input
                value={value[key]}
                onChange={(event) =>
                  onChange({ ...value, [key]: event.target.value })
                }
                className={control}
              />
            )}
          </label>
        );
      })}
    </div>
  );
}
function useSave<T>(initial: T) {
  const [form, setForm] = useState(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  return { form, setForm, busy, setBusy, error, setError, success, setSuccess };
}

const authTabs = [
  "customerLogin",
  "registration",
  "forgotPassword",
  "verification",
  "adminLogin",
  "adminForgotPassword",
] as const;
export function CmsAuthenticationEditor({
  initial,
}: {
  initial: CmsAuthenticationInput;
}) {
  const state = useSave(initial);
  const [active, setActive] =
    useState<(typeof authTabs)[number]>("customerLogin");
  async function save() {
    state.setError("");
    state.setSuccess("");
    const parsed = cmsAuthenticationSchema.safeParse(state.form);
    if (!parsed.success)
      return state.setError(
        parsed.error.issues[0]?.message ?? "Check the form.",
      );
    state.setBusy(true);
    try {
      state.setForm(await updateCmsAuthenticationFn({ data: parsed.data }));
      state.setSuccess("Authentication page copy saved.");
    } catch (cause) {
      state.setError(
        cause instanceof Error ? cause.message : "Copy could not be saved.",
      );
    } finally {
      state.setBusy(false);
    }
  }
  return (
    <Frame
      title="Authentication Pages"
      subtitle="Authentication CMS"
      {...state}
      save={() => void save()}
    >
      <Tabs tabs={authTabs} active={active} setActive={setActive} />
      <section className="mt-5 rounded-2xl border bg-white p-6 shadow-sm">
        <p className="mb-5 text-sm text-muted-foreground">
          Logo and copyright remain sourced from General Settings. These fields
          change presentation copy only.
        </p>
        <TextFields
          value={state.form[active]}
          onChange={(value) =>
            state.setForm((current) => ({ ...current, [active]: value }))
          }
        />
      </section>
    </Frame>
  );
}

const formTabs = ["destination", "experience", "package"] as const;
export function CmsFormsEditor({ initial }: { initial: CmsFormsInput }) {
  const state = useSave(initial);
  const [active, setActive] =
    useState<(typeof formTabs)[number]>("destination");
  async function save() {
    state.setError("");
    state.setSuccess("");
    const parsed = cmsFormsSchema.safeParse(state.form);
    if (!parsed.success)
      return state.setError(
        parsed.error.issues[0]?.message ?? "Check the form.",
      );
    state.setBusy(true);
    try {
      state.setForm(await updateCmsFormsFn({ data: parsed.data }));
      state.setSuccess("Public form copy saved.");
    } catch (cause) {
      state.setError(
        cause instanceof Error ? cause.message : "Copy could not be saved.",
      );
    } finally {
      state.setBusy(false);
    }
  }
  return (
    <Frame
      title="Public Form Copy"
      subtitle="Forms CMS"
      {...state}
      save={() => void save()}
    >
      <Tabs tabs={formTabs} active={active} setActive={setActive} />
      <section className="mt-5 rounded-2xl border bg-white p-6 shadow-sm">
        <p className="mb-5 text-sm text-muted-foreground">
          Copy only. Validation, lead creation, emails, WhatsApp, bookings, and
          Package prices remain unchanged.
        </p>
        <TextFields
          value={state.form[active]}
          onChange={(value) =>
            state.setForm((current) => ({ ...current, [active]: value }))
          }
        />
      </section>
    </Frame>
  );
}

export function CmsBookingEditor({
  initial,
}: {
  initial: CmsBookingPageInput;
}) {
  const state = useSave(initial);
  async function save() {
    state.setError("");
    state.setSuccess("");
    const parsed = cmsBookingPageSchema.safeParse(state.form);
    if (!parsed.success)
      return state.setError(
        parsed.error.issues[0]?.message ?? "Check the form.",
      );
    state.setBusy(true);
    try {
      state.setForm(await updateCmsBookingPageFn({ data: parsed.data }));
      state.setSuccess("Booking presentation copy saved.");
    } catch (cause) {
      state.setError(
        cause instanceof Error ? cause.message : "Copy could not be saved.",
      );
    } finally {
      state.setBusy(false);
    }
  }
  return (
    <Frame
      title="Booking Page"
      subtitle="Booking CMS"
      {...state}
      save={() => void save()}
    >
      <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <p className="mb-5 text-sm text-muted-foreground">
          Booking and payment behavior is not configurable here.
        </p>
        <TextFields value={state.form} onChange={state.setForm} />
      </section>
    </Frame>
  );
}

export function CmsSeoEditor({
  initial,
  images,
}: {
  initial: CmsSeoInput;
  images: CmsSelectableImage[];
}) {
  const state = useSave(initial);
  const paths = Object.keys(state.form.pages);
  const [active, setActive] = useState(paths[0] ?? "/");
  const page = state.form.pages[active];
  async function save() {
    state.setError("");
    state.setSuccess("");
    const parsed = cmsSeoSchema.safeParse(state.form);
    if (!parsed.success)
      return state.setError(
        parsed.error.issues[0]?.message ?? "Check the form.",
      );
    state.setBusy(true);
    try {
      state.setForm(await updateCmsSeoFn({ data: parsed.data }));
      state.setSuccess("SEO metadata saved.");
    } catch (cause) {
      state.setError(
        cause instanceof Error
          ? cause.message
          : "SEO metadata could not be saved.",
      );
    } finally {
      state.setBusy(false);
    }
  }
  if (!page) return null;
  const update = (value: typeof page) =>
    state.setForm((current) => ({
      ...current,
      pages: { ...current.pages, [active]: value },
    }));
  return (
    <Frame title="SEO" subtitle="SEO CMS" {...state} save={() => void save()}>
      <Tabs tabs={paths} active={active} setActive={setActive} />
      <section className="mt-5 rounded-2xl border bg-white p-6 shadow-sm">
        <p className="mb-5 text-sm text-muted-foreground">
          Blank fields safely fall back to the route's existing metadata. No raw
          HTML is accepted.
        </p>
        <div className="grid gap-5">
          <TextFields
            value={{
              metaTitle: page.metaTitle,
              metaDescription: page.metaDescription,
              ogTitle: page.ogTitle,
              ogDescription: page.ogDescription,
            }}
            onChange={(value) => update({ ...page, ...value })}
          />
          <CmsMediaPicker
            label="OpenGraph Image"
            value={page.ogMediaId}
            images={images}
            websiteMediaOnly
            onChange={(ogMediaId) => update({ ...page, ogMediaId })}
          />
        </div>
      </section>
    </Frame>
  );
}
const control =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-gold";
