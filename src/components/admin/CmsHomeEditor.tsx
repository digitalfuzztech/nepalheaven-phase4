import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import {
  CmsMediaPicker,
  type CmsSelectableImage,
} from "@/components/admin/CmsMediaPicker";
import {
  CmsEditorAlert,
  CmsFloatingSave,
  CmsSaveButton,
} from "@/components/admin/CmsEditorControls";
import {
  cmsHomePageSchema,
  type CmsHomePageInput,
} from "@/lib/cms-page-content.schema";
import { updateCmsHomePageFn } from "@/lib/cms-page-content.functions";
import { HOME_ICON_KEYS } from "@/lib/home-icons";

type Option = { id: string; title: string };
type GalleryOption = {
  id: string;
  title: string;
  type: "image" | "video";
  preview: string;
};

export function CmsHomeEditor({
  initial,
  images,
  destinations,
  packages,
  blogs,
  gallery,
}: {
  initial: CmsHomePageInput;
  images: CmsSelectableImage[];
  destinations: Option[];
  packages: Option[];
  blogs: Option[];
  gallery: GalleryOption[];
}) {
  const [form, setForm] = useState(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const set = <K extends keyof CmsHomePageInput>(
    key: K,
    value: CmsHomePageInput[K],
  ) => setForm((current) => ({ ...current, [key]: value }));
  async function save() {
    setError("");
    setSuccess("");
    const parsed = cmsHomePageSchema.safeParse(form);
    if (!parsed.success)
      return setError(parsed.error.issues[0]?.message ?? "Check the form.");
    setBusy(true);
    try {
      setForm(await updateCmsHomePageFn({ data: parsed.data }));
      setSuccess("Homepage saved.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Homepage could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  const text = (label: string, key: keyof CmsHomePageInput, area = false) => (
    <Field label={label}>
      {area ? (
        <textarea
          rows={4}
          value={String(form[key] ?? "")}
          onChange={(event) =>
            set(key, event.target.value as CmsHomePageInput[typeof key])
          }
          className={control}
        />
      ) : (
        <input
          value={String(form[key] ?? "")}
          onChange={(event) =>
            set(key, event.target.value as CmsHomePageInput[typeof key])
          }
          className={control}
        />
      )}
    </Field>
  );
  const sectionNav = [
    "Hero",
    "About",
    "Destinations",
    "Expert Quote",
    "Tours",
    "Adventures",
    "Why Us",
    "Testimonials",
    "Gallery",
    "Journal",
    "Trust",
    "Newsletter",
    "CTA",
  ];
  return (
    <div className="min-w-0 max-w-full pb-12">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <Link
            to="/admin/cms"
            className="text-sm font-semibold text-muted-foreground"
          >
            ← Back to CMS
          </Link>
          <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-gold">
            Homepage CMS
          </p>
          <h1 className="mt-2 text-4xl font-semibold">Homepage</h1>
        </div>
        <CmsSaveButton
          busy={busy}
          label="Save Homepage"
          onClick={() => void save()}
        />
      </div>
      <CmsEditorAlert error={error} success={success} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[210px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 rounded-2xl border bg-white p-3 shadow-sm">
            {sectionNav.map((label) => (
              <a
                key={label}
                href={`#home-${label.toLowerCase().replace(/\s+/g, "-")}`}
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-black/5"
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>
        <div className="grid min-w-0 gap-6">
          <Section id="hero" title="Hero">
            <CmsMediaPicker
              label="Hero Image"
              value={form.heroMediaId}
              images={images}
              generalSettingsTypeValue="website-media"
              onChange={(value) => set("heroMediaId", value)}
            />
            {text("Subtitle", "heroSubtitle")}
            {text("Title", "heroTitle")}
            {text("Description", "heroDescription", true)}
            <RepeatPairs
              title="Hero Stats"
              rows={form.heroStats}
              max={3}
              onChange={(rows) => set("heroStats", rows)}
            />
            <div className="grid min-w-0 gap-4 md:grid-cols-2">
              <Field label="Floating Box Icon">
                <select
                  value={form.floatingIcon}
                  onChange={(event) =>
                    set(
                      "floatingIcon",
                      event.target.value as CmsHomePageInput["floatingIcon"],
                    )
                  }
                  className={control}
                >
                  {HOME_ICON_KEYS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </Field>
              {text("Floating Box Bold Text", "floatingBoldText")}
            </div>
            {text("Floating Box Regular Text", "floatingText", true)}
          </Section>
          <Section id="about" title="About">
            {text("Subtitle", "aboutSubtitle")}
            {text("Title", "aboutTitle")}
            {text("Description", "aboutDescription", true)}
            <IconCards
              rows={form.aboutCards}
              max={4}
              onChange={(rows) => set("aboutCards", rows)}
            />
            <CmsMediaPicker
              label="Big Image"
              value={form.aboutBigMediaId}
              images={images}
              generalSettingsTypeValue="website-media"
              onChange={(value) => set("aboutBigMediaId", value)}
            />
            {text("Big Image Title", "aboutBigTitle")}
            {text("Big Image Subtitle", "aboutBigSubtitle")}
            <CmsMediaPicker
              label="Small Image"
              value={form.aboutSmallMediaId}
              images={images}
              generalSettingsTypeValue="website-media"
              onChange={(value) => set("aboutSmallMediaId", value)}
            />
          </Section>
          <Section id="destinations" title="Destinations">
            {text("Subtitle", "destinationsSubtitle")}
            {text("Title", "destinationsTitle")}
            {text("Description", "destinationsDescription", true)}
            <Field label="Primary Destination">
              <select
                value={form.primaryDestinationId ?? ""}
                onChange={(event) => {
                  const id = event.target.value || null;
                  set("primaryDestinationId", id);
                  if (id)
                    set(
                      "secondaryDestinationIds",
                      form.secondaryDestinationIds.filter(
                        (item) => item !== id,
                      ),
                    );
                }}
                className={control}
              >
                <option value="">Use first published Destination</option>
                {destinations.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </Field>
            <ChipSelector
              label="Secondary Destinations"
              options={destinations.filter(
                (item) => item.id !== form.primaryDestinationId,
              )}
              value={form.secondaryDestinationIds}
              max={6}
              onChange={(value) => set("secondaryDestinationIds", value)}
            />
            {text("Section Link Text", "destinationsLinkText")}
          </Section>
          <Section id="expert-quote" title="Expert Quote">
            {text("Text", "expertText", true)}
            {text("Highlighted Text", "expertHighlightedText")}
            {text("Person Name", "expertName")}
            {text("Position", "expertPosition")}
          </Section>
          <Section id="tours" title="Tours">
            {text("Subtitle", "toursSubtitle")}
            {text("Title", "toursTitle")}
            {text("Description", "toursDescription", true)}
            <ChipSelector
              label="Primary Tours"
              options={packages.filter(
                (item) => !form.secondaryPackageIds.includes(item.id),
              )}
              value={form.primaryPackageIds}
              max={4}
              onChange={(value) => set("primaryPackageIds", value)}
            />
            <ChipSelector
              label="Secondary Tours"
              options={packages.filter(
                (item) => !form.primaryPackageIds.includes(item.id),
              )}
              value={form.secondaryPackageIds}
              max={4}
              onChange={(value) => set("secondaryPackageIds", value)}
            />
            {text("Section Link Text", "toursLinkText")}
          </Section>
          <Section id="adventures" title="Adventures">
            {text("Subtitle", "adventuresSubtitle")}
            {text("Title", "adventuresTitle")}
            {text("Description", "adventuresDescription", true)}
            <IconCards
              rows={form.adventures}
              max={8}
              onChange={(rows) => set("adventures", rows)}
            />
          </Section>
          <Section id="why-us" title="Why Us">
            {text("Subtitle", "whySubtitle")}
            {text("Title", "whyTitle")}
            {text("Description", "whyDescription", true)}
            <IconCards
              rows={form.whyCards}
              max={6}
              onChange={(rows) => set("whyCards", rows)}
            />
          </Section>
          <Section id="testimonials" title="Testimonials">
            {text("Subtitle", "testimonialsSubtitle")}
            {text("Title", "testimonialsTitle")}
            {text("Description", "testimonialsDescription", true)}
            <p className="text-sm leading-relaxed text-muted-foreground">
              This section automatically displays every counter from About CMS,
              in its saved order.
            </p>
          </Section>
          <Section id="gallery" title="Gallery">
            {text("Subtitle", "gallerySubtitle")}
            {text("Title", "galleryTitle")}
            {text("Description", "galleryDescription", true)}
            <ChipSelector
              label="Curated Media"
              options={gallery.map((item) => ({
                id: item.id,
                title: `${item.title} · ${item.type}`,
              }))}
              value={form.galleryMediaIds}
              max={8}
              onChange={(value) => set("galleryMediaIds", value)}
            />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {form.galleryMediaIds.flatMap((id) => {
                const item = gallery.find((candidate) => candidate.id === id);
                return item
                  ? [
                      <div
                        key={id}
                        className="overflow-hidden rounded-xl border bg-[#faf9f6]"
                      >
                        {item.type === "video" ? (
                          <video
                            src={item.preview}
                            muted
                            className="aspect-[4/3] w-full object-cover"
                          />
                        ) : (
                          <img
                            src={item.preview}
                            alt=""
                            className="aspect-[4/3] w-full object-cover"
                          />
                        )}
                        <p className="p-2 text-xs font-semibold">
                          {item.type === "video" ? "Video · " : "Image · "}
                          {item.title}
                        </p>
                      </div>,
                    ]
                  : [];
              })}
            </div>
            {text("Open Gallery Link Text", "galleryLinkText")}
          </Section>
          <Section id="journal" title="Journal">
            {text("Subtitle", "journalSubtitle")}
            {text("Title", "journalTitle")}
            {text("Description", "journalDescription", true)}
            <ChipSelector
              label="Top Blogs"
              options={blogs}
              value={form.blogIds}
              max={3}
              onChange={(value) => set("blogIds", value)}
            />
          </Section>
          <Section id="trust" title="Trust">
            <TextList
              rows={form.trustTexts}
              onChange={(rows) => set("trustTexts", rows)}
            />
          </Section>
          <Section id="newsletter" title="Newsletter">
            {text("Subtitle", "newsletterSubtitle")}
            {text("Title", "newsletterTitle")}
            {text("Description", "newsletterDescription", true)}
          </Section>
          <Section id="cta" title="CTA">
            {text("Subtitle", "ctaSubtitle")}
            {text("Title", "ctaTitle")}
            {text("Description", "ctaDescription", true)}
            <CmsMediaPicker
              label="CTA Image"
              value={form.ctaMediaId}
              images={images}
              generalSettingsTypeValue="website-media"
              onChange={(value) => set("ctaMediaId", value)}
            />
            {text("Main Button Text", "ctaMainText")}
            {text("Main Button Link", "ctaMainLink")}
            {text("Secondary Button Text", "ctaSecondaryText")}
            {text("Secondary Button Link", "ctaSecondaryLink")}
          </Section>
        </div>
      </div>
      <CmsFloatingSave
        busy={busy}
        label="Save Homepage"
        onClick={() => void save()}
      />
    </div>
  );
}
const control =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-gold";
function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={`home-${id}`}
      className="min-w-0 max-w-full scroll-mt-24 rounded-2xl border bg-white p-4 shadow-sm sm:p-6"
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-5 grid gap-5">{children}</div>
    </section>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid min-w-0 gap-2 text-xs font-semibold">
      {label}
      {children}
    </label>
  );
}
function ChipSelector({
  label,
  options,
  value,
  max,
  onChange,
}: {
  label: string;
  options: Option[];
  value: string[];
  max: number;
  onChange: (value: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const byId = new Map(options.map((item) => [item.id, item.title]));
  return (
    <div>
      <p className="text-xs font-semibold">
        {label} · maximum {max}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {value.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(value.filter((item) => item !== id))}
            className="rounded-full bg-[#0c1724] px-3 py-2 text-xs text-white"
          >
            {byId.get(id) ?? "Unavailable selection"} ×
          </button>
        ))}
      </div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={`Search ${label.toLowerCase()}…`}
        className={`${control} mt-3`}
      />
      {query && value.length < max ? (
        <div className="mt-2 max-h-44 overflow-auto rounded-xl border p-2">
          {options
            .filter(
              (item) =>
                !value.includes(item.id) &&
                item.title.toLowerCase().includes(query.toLowerCase()),
            )
            .slice(0, 12)
            .map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onChange([...value, item.id]);
                  setQuery("");
                }}
                className="block w-full rounded-lg p-2 text-left text-sm hover:bg-black/5"
              >
                {item.title}
              </button>
            ))}
        </div>
      ) : null}
    </div>
  );
}
function TextList({
  rows,
  onChange,
}: {
  rows: string[];
  onChange: (rows: string[]) => void;
}) {
  return (
    <div className="grid gap-3">
      {rows.map((row, index) => (
        <div key={index} className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <input
            value={row}
            onChange={(event) =>
              onChange(
                rows.map((item, itemIndex) =>
                  itemIndex === index ? event.target.value : item,
                ),
              )
            }
            className={`${control} min-w-0`}
          />
          <OrderButtons
            index={index}
            length={rows.length}
            move={(next) => {
              const copy = [...rows];
              [copy[index], copy[next]] = [copy[next]!, copy[index]!];
              onChange(copy);
            }}
            remove={() =>
              onChange(rows.filter((_, itemIndex) => itemIndex !== index))
            }
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, ""])}
        className="w-fit rounded-xl border border-dashed px-4 py-3 text-sm font-semibold"
      >
        <Plus className="mr-2 inline h-4 w-4" />
        Add Text
      </button>
    </div>
  );
}
function RepeatPairs({
  title,
  rows,
  max,
  onChange,
}: {
  title: string;
  rows: { value: string; text: string }[];
  max: number;
  onChange: (rows: { value: string; text: string }[]) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold">{title}</p>
      {rows.map((row, index) => (
        <div
          key={index}
          className="mt-3 grid gap-3 rounded-xl border p-4 md:grid-cols-[.35fr_1fr_auto]"
        >
          <input
            value={row.value}
            onChange={(event) =>
              onChange(
                rows.map((item, i) =>
                  i === index ? { ...item, value: event.target.value } : item,
                ),
              )
            }
            className={control}
          />
          <input
            value={row.text}
            onChange={(event) =>
              onChange(
                rows.map((item, i) =>
                  i === index ? { ...item, text: event.target.value } : item,
                ),
              )
            }
            className={control}
          />
          <OrderButtons
            index={index}
            length={rows.length}
            move={(next) => {
              const copy = [...rows];
              [copy[index], copy[next]] = [copy[next]!, copy[index]!];
              onChange(copy);
            }}
            remove={() => onChange(rows.filter((_, i) => i !== index))}
          />
        </div>
      ))}
      {rows.length < max ? (
        <button
          type="button"
          onClick={() => onChange([...rows, { value: "", text: "" }])}
          className="mt-3 rounded-xl border border-dashed px-4 py-2 text-sm"
        >
          Add Stat
        </button>
      ) : null}
    </div>
  );
}
function IconCards({
  rows,
  max,
  onChange,
}: {
  rows: { icon: string; title: string; description: string }[];
  max: number;
  onChange: (
    rows: { icon: string; title: string; description: string }[],
  ) => void;
}) {
  return (
    <div className="grid gap-3">
      {rows.map((row, index) => (
        <div key={index} className="rounded-2xl border bg-[#faf9f6] p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <select
              value={row.icon}
              onChange={(event) =>
                onChange(
                  rows.map((item, i) =>
                    i === index ? { ...item, icon: event.target.value } : item,
                  ),
                )
              }
              className={control}
            >
              {HOME_ICON_KEYS.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
            <input
              value={row.title}
              onChange={(event) =>
                onChange(
                  rows.map((item, i) =>
                    i === index ? { ...item, title: event.target.value } : item,
                  ),
                )
              }
              placeholder="Title"
              className={control}
            />
          </div>
          <textarea
            value={row.description}
            onChange={(event) =>
              onChange(
                rows.map((item, i) =>
                  i === index
                    ? { ...item, description: event.target.value }
                    : item,
                ),
              )
            }
            placeholder="Description"
            className={`${control} mt-3`}
          />
          <div className="mt-3 flex justify-end">
            <OrderButtons
              index={index}
              length={rows.length}
              move={(next) => {
                const copy = [...rows];
                [copy[index], copy[next]] = [copy[next]!, copy[index]!];
                onChange(copy);
              }}
              remove={() => onChange(rows.filter((_, i) => i !== index))}
            />
          </div>
        </div>
      ))}
      {rows.length < max ? (
        <button
          type="button"
          onClick={() =>
            onChange([
              ...rows,
              { icon: "mountain", title: "", description: "" },
            ])
          }
          className="w-fit rounded-xl border border-dashed px-4 py-3 text-sm"
        >
          <Plus className="mr-2 inline h-4 w-4" />
          Add Card
        </button>
      ) : null}
    </div>
  );
}
function OrderButtons({
  index,
  length,
  move,
  remove,
}: {
  index: number;
  length: number;
  move: (next: number) => void;
  remove: () => void;
}) {
  return (
    <span className="flex shrink-0 gap-1">
      <button
        type="button"
        disabled={!index}
        onClick={() => move(index - 1)}
        className="rounded-lg border p-2"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={index === length - 1}
        onClick={() => move(index + 1)}
        className="rounded-lg border p-2"
      >
        <ArrowDown className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={remove}
        className="rounded-lg border p-2 text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </span>
  );
}
