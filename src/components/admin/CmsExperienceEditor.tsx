import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  CmsEditorAlert,
  CmsFloatingSave,
  CmsSaveButton,
} from "@/components/admin/CmsEditorControls";
import type { CmsOtherSettingsOption } from "@/lib/cms-other-settings.constants";
import {
  cmsExperienceSaveSchema,
  type CmsExperienceSaveInput,
} from "@/lib/cms-experiences.schema";
import {
  createCmsExperienceFn,
  updateCmsExperienceFn,
  uploadCmsExperienceMainImageFn,
} from "@/lib/cms-experiences.functions";
type Data = NonNullable<
  Awaited<
    ReturnType<
      typeof import("@/lib/cms-experiences.server").getCmsExperienceEditorData
    >
  >
>;
type ListKey = "highlights" | "inclusions" | "exclusions";
export function CmsExperienceEditor({
  data,
  options,
  mode,
}: {
  data: Data;
  options: CmsOtherSettingsOption[];
  mode: "create" | "edit";
}) {
  const detail = data.detail;
  const types = options.filter((o) => o.groupKey === "experience_type");
  const navigate = useNavigate();
  const router = useRouter();
  const [form, setForm] = useState<CmsExperienceSaveInput>(() =>
    detail
      ? {
          id: detail.core.id,
          title: detail.core.name,
          experienceTypeOptionId:
            detail.core.experienceTypeOptionId ??
            types.find((o) => o.name === detail.core.experienceType)?.id ??
            types[0]?.id ??
            "",
          description:
            detail.core.shortDescription ?? detail.core.description ?? "",
          cardLinkText: detail.core.cardLinkText ?? "View journeys",
          overview: detail.core.overview ?? detail.core.description,
          highlights: detail.highlights.map((x) => x.item),
          inclusions: detail.inclusions.map((x) => x.item),
          exclusions: detail.exclusions.map((x) => x.item),
          relatedPackageIds: detail.links.map((x) => x.packageId),
          itineraries: detail.itineraries.map((x) => ({
            minDay: x.minDay,
            maxDay: x.maxDay,
            title: x.title,
            description: x.description ?? "",
          })),
          faqs: detail.faqs.map((x) => ({
            question: x.question,
            answer: x.answer,
          })),
          seoTitle: detail.core.seoTitle,
          seoDescription: detail.core.seoDescription,
          sortOrder: detail.core.sortOrder,
        }
      : {
          title: "",
          experienceTypeOptionId: types[0]?.id ?? "",
          description: "",
          cardLinkText: "View journeys",
          overview: null,
          highlights: [],
          inclusions: [],
          exclusions: [],
          relatedPackageIds: [],
          itineraries: [],
          faqs: [],
          seoTitle: null,
          seoDescription: null,
          sortOrder: 0,
        },
  );
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const selected = data.packages.filter((p) =>
    form.relatedPackageIds.includes(p.id),
  );
  useEffect(
    () => () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    },
    [filePreview],
  );

  function chooseHero(nextFile: File | null) {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFile(nextFile);
    setFilePreview(nextFile ? URL.createObjectURL(nextFile) : null);
  }
  const available = data.packages
    .filter(
      (p) =>
        !form.relatedPackageIds.includes(p.id) &&
        p.title.toLowerCase().includes(search.toLowerCase()),
    )
    .slice(0, 12);
  const update = <K extends keyof CmsExperienceSaveInput>(
    key: K,
    value: CmsExperienceSaveInput[K],
  ) => setForm((x) => ({ ...x, [key]: value }));
  const move = <K extends "itineraries" | "faqs">(
    key: K,
    index: number,
    d: -1 | 1,
  ) => {
    const rows = [...form[key]];
    const next = index + d;
    if (next < 0 || next >= rows.length) return;
    [rows[index], rows[next]] = [rows[next]!, rows[index]!];
    update(key, rows as CmsExperienceSaveInput[K]);
  };
  async function save() {
    setError("");
    setSuccess("");
    const parsed = cmsExperienceSaveSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "create") {
        const fd = new FormData();
        fd.set("experienceData", JSON.stringify(parsed.data));
        if (file) fd.set("mainImage", file);
        const result = await createCmsExperienceFn({ data: fd });
        await navigate({
          to: "/admin/cms/experiences/$id",
          params: { id: result.id },
        });
      } else {
        await updateCmsExperienceFn({ data: parsed.data });
        if (file && detail) {
          const fd = new FormData();
          fd.set("id", detail.core.id);
          fd.set("mainImage", file);
          await uploadCmsExperienceMainImageFn({ data: fd });
          chooseHero(null);
        }
        setSuccess("Experience saved successfully.");
        await router.invalidate();
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Experience could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  const list = (key: ListKey, title: string) => (
    <Section title={title}>
      {form[key].map((value, i) => (
        <Row
          key={i}
          onUp={() => {
            if (i) {
              const a = [...form[key]];
              [a[i - 1], a[i]] = [a[i]!, a[i - 1]!];
              update(key, a);
            }
          }}
          onDown={() => {
            if (i < form[key].length - 1) {
              const a = [...form[key]];
              [a[i + 1], a[i]] = [a[i]!, a[i + 1]!];
              update(key, a);
            }
          }}
          onRemove={() =>
            update(
              key,
              form[key].filter((_, n) => n !== i),
            )
          }
        >
          <input
            value={value}
            onChange={(e) =>
              update(
                key,
                form[key].map((x, n) => (n === i ? e.target.value : x)),
              )
            }
            className={input}
          />
        </Row>
      ))}
      <Add onClick={() => update(key, [...form[key], ""])}>Add Item</Add>
    </Section>
  );
  return (
    <div className="pb-16">
      <div className="flex justify-between gap-5">
        <div>
          <Link
            to="/admin/cms/experiences"
            className="text-sm font-semibold text-muted-foreground"
          >
            ← Back to Experiences
          </Link>
          <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-gold">
            Experience CMS
          </p>
          <h1 className="mt-2 text-4xl font-semibold">
            {mode === "create" ? "Create Experience" : form.title}
          </h1>
        </div>
        <CmsSaveButton
          busy={busy}
          label="Save Experience"
          type="button"
          onClick={() => void save()}
        />
      </div>
      <CmsEditorAlert error={error} success={success} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav
            className="sticky top-24 rounded-2xl border bg-white p-4 shadow-sm"
            aria-label="Experience editor sections"
          >
            {[
              "Experience Identity",
              "Detail Hero Image",
              "Overview",
              "Highlights",
              "Itinerary",
              "Inclusions",
              "Exclusions",
              "Related Packages",
              "FAQs",
              "SEO",
            ].map((label) => (
              <a
                key={label}
                href={`#${sectionId(label)}`}
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-[#faf9f6] hover:text-[#0c1724]"
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>
        <div className="grid min-w-0 gap-6">
          <Section title="Experience Identity">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title">
                <input
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  className={input}
                />
              </Field>
              <Field label="Experience Type">
                <select
                  value={form.experienceTypeOptionId}
                  onChange={(e) =>
                    update("experienceTypeOptionId", e.target.value)
                  }
                  className={input}
                >
                  {types.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Card Link Text">
                <input
                  value={form.cardLinkText}
                  onChange={(e) => update("cardLinkText", e.target.value)}
                  className={input}
                />
              </Field>
              <Field label="Sort Order">
                <input
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) => update("sortOrder", Number(e.target.value))}
                  className={input}
                />
              </Field>
            </div>
            <Field label="Description">
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className={area}
              />
            </Field>
          </Section>
          <Section title="Detail Hero Image">
            {filePreview || detail?.core.heroImage ? (
              <img
                src={filePreview ?? detail?.core.heroImage ?? ""}
                alt=""
                className="aspect-[16/6] w-full rounded-2xl object-cover"
              />
            ) : null}
            <label className="inline-flex w-fit cursor-pointer gap-2 rounded-xl border px-4 py-3">
              <Upload className="h-4 w-4" />
              {file?.name ?? "Choose hero image"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => chooseHero(e.target.files?.[0] ?? null)}
              />
            </label>
          </Section>
          <Section title="Overview">
            <textarea
              rows={7}
              value={form.overview ?? ""}
              onChange={(e) => update("overview", e.target.value || null)}
              className={area}
            />
          </Section>
          {list("highlights", "Highlights")}
          <Section title="Itinerary">
            {form.itineraries.map((row, i) => (
              <Row
                key={i}
                onUp={() => move("itineraries", i, -1)}
                onDown={() => move("itineraries", i, 1)}
                onRemove={() =>
                  update(
                    "itineraries",
                    form.itineraries.filter((_, n) => n !== i),
                  )
                }
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Minimum Day">
                    <input
                      type="number"
                      min={1}
                      value={row.minDay}
                      onChange={(e) =>
                        update(
                          "itineraries",
                          form.itineraries.map((x, n) =>
                            n === i
                              ? { ...x, minDay: Number(e.target.value) }
                              : x,
                          ),
                        )
                      }
                      className={input}
                    />
                  </Field>
                  <Field label="Maximum Day">
                    <input
                      type="number"
                      min={1}
                      value={row.maxDay}
                      onChange={(e) =>
                        update(
                          "itineraries",
                          form.itineraries.map((x, n) =>
                            n === i
                              ? { ...x, maxDay: Number(e.target.value) }
                              : x,
                          ),
                        )
                      }
                      className={input}
                    />
                  </Field>
                </div>
                <Field label="Title">
                  <input
                    value={row.title}
                    onChange={(e) =>
                      update(
                        "itineraries",
                        form.itineraries.map((x, n) =>
                          n === i ? { ...x, title: e.target.value } : x,
                        ),
                      )
                    }
                    className={input}
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    rows={4}
                    value={row.description}
                    onChange={(e) =>
                      update(
                        "itineraries",
                        form.itineraries.map((x, n) =>
                          n === i ? { ...x, description: e.target.value } : x,
                        ),
                      )
                    }
                    className={area}
                  />
                </Field>
              </Row>
            ))}
            <Add
              onClick={() =>
                update("itineraries", [
                  ...form.itineraries,
                  { minDay: 1, maxDay: 1, title: "", description: "" },
                ])
              }
            >
              Add Itinerary Row
            </Add>
          </Section>
          <Section title="Related Packages">
            <div className="flex flex-wrap gap-2">
              {selected.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    update(
                      "relatedPackageIds",
                      form.relatedPackageIds.filter((id) => id !== p.id),
                    )
                  }
                  className="rounded-full bg-[#0c1724] px-3 py-2 text-xs text-white"
                >
                  {p.title}
                  {!p.status ? " · Unpublished" : ""}{" "}
                  <X className="inline h-3 w-3" />
                </button>
              ))}
            </div>
            <label className="flex gap-2 rounded-xl border px-4 py-3">
              <Search className="h-4 w-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search packages…"
                className="w-full outline-none"
              />
            </label>
            {search ? (
              <div className="rounded-xl border p-2">
                {available.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      update("relatedPackageIds", [
                        ...form.relatedPackageIds,
                        p.id,
                      ]);
                      setSearch("");
                    }}
                    className="block w-full rounded-lg p-2 text-left hover:bg-black/5"
                  >
                    {p.title}
                    {!p.status ? " · Unpublished" : ""}
                  </button>
                ))}
              </div>
            ) : null}
          </Section>
          {list("inclusions", "Inclusions")}
          {list("exclusions", "Exclusions")}
          <Section title="FAQs">
            {form.faqs.map((row, i) => (
              <Row
                key={i}
                onUp={() => move("faqs", i, -1)}
                onDown={() => move("faqs", i, 1)}
                onRemove={() =>
                  update(
                    "faqs",
                    form.faqs.filter((_, n) => n !== i),
                  )
                }
              >
                <Field label="Question">
                  <input
                    value={row.question}
                    onChange={(e) =>
                      update(
                        "faqs",
                        form.faqs.map((x, n) =>
                          n === i ? { ...x, question: e.target.value } : x,
                        ),
                      )
                    }
                    className={input}
                  />
                </Field>
                <Field label="Answer">
                  <textarea
                    rows={4}
                    value={row.answer}
                    onChange={(e) =>
                      update(
                        "faqs",
                        form.faqs.map((x, n) =>
                          n === i ? { ...x, answer: e.target.value } : x,
                        ),
                      )
                    }
                    className={area}
                  />
                </Field>
              </Row>
            ))}
            <Add
              onClick={() =>
                update("faqs", [...form.faqs, { question: "", answer: "" }])
              }
            >
              Add FAQ
            </Add>
          </Section>
          <Section title="SEO">
            <Field label="SEO Title">
              <input
                value={form.seoTitle ?? ""}
                onChange={(e) => update("seoTitle", e.target.value || null)}
                className={input}
              />
            </Field>
            <Field label="SEO Description">
              <textarea
                value={form.seoDescription ?? ""}
                onChange={(e) =>
                  update("seoDescription", e.target.value || null)
                }
                className={area}
              />
            </Field>
          </Section>
        </div>
      </div>
      <CmsFloatingSave
        busy={busy}
        label="Save Experience"
        onClick={() => void save()}
      />
    </div>
  );
}
const input =
  "h-11 w-full rounded-xl border bg-white px-4 text-sm outline-none focus:border-gold";
const area =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-gold";
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      id={sectionId(title)}
      className="scroll-mt-24 rounded-2xl border bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  );
}
function sectionId(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-xs font-semibold">
      {label}
      {children}
    </label>
  );
}
function Row({
  children,
  onUp,
  onDown,
  onRemove,
}: {
  children: ReactNode;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border bg-[#faf9f6] p-4">
      <div className="mb-3 flex justify-end gap-2">
        <button type="button" onClick={onUp} className="rounded-lg border p-2">
          <ArrowUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDown}
          className="rounded-lg border p-2"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg border border-red-200 p-2 text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}
function Add({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-fit gap-2 rounded-xl border border-dashed px-4 py-3 text-sm font-semibold"
    >
      <Plus className="h-4 w-4 text-gold" />
      {children}
    </button>
  );
}
