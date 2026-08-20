import { useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type { CmsOtherSettingsOption } from "@/lib/cms-other-settings.constants";
import type { CmsPackageSaveInput } from "@/lib/cms-packages.schema";
import { cmsPackageSaveSchema } from "@/lib/cms-packages.schema";
import { countryOptions } from "@/lib/countries";
import {
  createCmsPackageFn,
  updateCmsPackageFn,
  uploadCmsPackageMainImageFn,
} from "@/lib/cms-packages.functions";

type EditorData = NonNullable<
  Awaited<
    ReturnType<
      typeof import("@/lib/cms-packages.server").getCmsPackageEditorData
    >
  >
>;
type ListKey = "highlights" | "inclusions" | "exclusions";

export function CmsPackageEditor({
  data,
  options,
  mode,
}: {
  data: EditorData;
  options: CmsOtherSettingsOption[];
  mode: "create" | "edit";
}) {
  const navigate = useNavigate();
  const router = useRouter();
  const detail = data.detail;
  const packageTypes = options.filter((o) => o.groupKey === "package_type");
  const difficulties = options.filter((o) => o.groupKey === "difficulty");
  const pricingTiers = options.filter(
    (o) => o.groupKey === "package_pricing_tier",
  );
  const [form, setForm] = useState<CmsPackageSaveInput>(() =>
    detail
      ? {
          id: detail.package.id,
          title: detail.package.title,
          packageTypeOptionId:
            detail.package.packageTypeOptionId ??
            packageTypes.find((o) => o.name === detail.package.style)?.id ??
            packageTypes[0]?.id ??
            "",
          description:
            detail.package.shortDescription ?? detail.package.description ?? "",
          overview:
            detail.package.overview ?? detail.package.description ?? null,
          durationMinDays:
            detail.package.durationMinDays ?? detail.package.days ?? 1,
          durationMaxDays:
            detail.package.durationMaxDays ?? detail.package.days ?? 1,
          difficultyOptionId:
            detail.package.difficultyOptionId ??
            difficulties.find((o) => o.name === detail.package.difficulty)
              ?.id ??
            difficulties[0]?.id ??
            "",
          groupSizeMin: detail.package.groupSizeMin ?? 2,
          groupSizeMax: detail.package.groupSizeMax ?? 12,
          rating: Number(detail.package.rating ?? 0),
          reviewCount: detail.package.reviewCount,
          startingPrice: Number(detail.package.startingPrice ?? 0),
          oldPrice:
            detail.package.oldPrice === null
              ? null
              : Number(detail.package.oldPrice),
          destinationIds: detail.destinationLinks.map((x) => x.destinationId),
          highlights: detail.highlights.map((x) => x.item),
          itineraries: detail.itineraries.map((x) => ({
            minDay: x.minDay ?? x.day ?? 1,
            maxDay: x.maxDay ?? x.day ?? 1,
            title: x.title,
            description: x.description ?? "",
          })),
          tiers: detail.tiers.map((x) => {
            const tierOptionId =
              x.tierOptionId ?? pricingTiers.find((o) => o.name === x.name)?.id;
            return {
              id: x.id,
              tierOptionId: tierOptionId ?? null,
              name: x.name,
              price: Number(x.price),
              note: x.description ?? "",
            };
          }),
          inclusions: detail.inclusions.map((x) => x.item),
          exclusions: detail.exclusions.map((x) => x.item),
          reviews: detail.reviews.map((x) => ({
            rating: Number(x.rating),
            reviewText: x.reviewText,
            customerName: x.customerName,
            customerCountryCode: x.customerCountryCode,
          })),
          faqs: detail.faqs.map((x) => ({
            question: x.question,
            answer: x.answer,
          })),
          seoTitle: detail.package.seoTitle,
          seoDescription: detail.package.seoDescription,
          sortOrder: detail.package.sortOrder,
        }
      : {
          title: "",
          packageTypeOptionId: packageTypes[0]?.id ?? "",
          description: "",
          overview: null,
          durationMinDays: 1,
          durationMaxDays: 1,
          difficultyOptionId: difficulties[0]?.id ?? "",
          groupSizeMin: 2,
          groupSizeMax: 12,
          rating: 0,
          reviewCount: 0,
          startingPrice: 0,
          oldPrice: null,
          destinationIds: [],
          highlights: [],
          itineraries: [],
          tiers: [],
          inclusions: [],
          exclusions: [],
          reviews: [],
          faqs: [],
          seoTitle: null,
          seoDescription: null,
          sortOrder: 0,
        },
  );
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");
  const countries = useMemo(() => countryOptions(), []);
  const selectedDestinations = data.destinations.filter((d) =>
    form.destinationIds.includes(d.id),
  );
  const availableDestinations = data.destinations
    .filter(
      (d) =>
        !form.destinationIds.includes(d.id) &&
        d.name.toLowerCase().includes(destinationSearch.toLowerCase()),
    )
    .slice(0, 12);
  const update = <K extends keyof CmsPackageSaveInput>(
    key: K,
    value: CmsPackageSaveInput[K],
  ) => setForm((current) => ({ ...current, [key]: value }));
  const updateArray = <K extends keyof CmsPackageSaveInput>(
    key: K,
    index: number,
    value: CmsPackageSaveInput[K] extends Array<infer T> ? T : never,
  ) =>
    setForm((current) => ({
      ...current,
      [key]: (current[key] as unknown[]).map((item, i) =>
        i === index ? value : item,
      ),
    }));
  const removeArray = (key: keyof CmsPackageSaveInput, index: number) =>
    setForm((current) => ({
      ...current,
      [key]: (current[key] as unknown[]).filter((_, i) => i !== index),
    }));
  const moveArray = (
    key: keyof CmsPackageSaveInput,
    index: number,
    direction: -1 | 1,
  ) =>
    setForm((current) => {
      const array = [...(current[key] as unknown[])];
      const next = index + direction;
      if (next < 0 || next >= array.length) return current;
      [array[index], array[next]] = [array[next], array[index]];
      return { ...current, [key]: array };
    });
  async function save() {
    setError("");
    setSuccess("");
    const parsed = cmsPackageSaveSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "create") {
        const fd = new FormData();
        fd.set("packageData", JSON.stringify(parsed.data));
        if (file) fd.set("mainImage", file);
        const result = await createCmsPackageFn({ data: fd });
        await navigate({
          to: "/admin/cms/packages/$id",
          params: { id: result.id },
        });
      } else {
        await updateCmsPackageFn({ data: parsed.data });
        if (file && detail) {
          const fd = new FormData();
          fd.set("id", detail.package.id);
          fd.set("mainImage", file);
          await uploadCmsPackageMainImageFn({ data: fd });
          setFile(null);
        }
        setSuccess("Package saved successfully.");
        await router.invalidate();
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Package could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  function listField(key: ListKey, title: string) {
    return (
      <Section
        title={title}
        description={`Add, edit, remove and order package ${title.toLowerCase()}.`}
      >
        <TextList
          values={form[key]}
          onChange={(values) => update(key, values)}
        />
      </Section>
    );
  }
  return (
    <div className="pb-16">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <Link
            to="/admin/cms/packages"
            className="text-sm font-semibold text-muted-foreground"
          >
            ← Back to packages
          </Link>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-gold">
            Package CMS
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-[#0c1724]">
            {mode === "create" ? "Create Package" : form.title}
          </h1>
          {detail ? (
            <p className="mt-2 text-sm text-muted-foreground">
              /packages/{detail.package.slug}
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              New packages remain unpublished until you publish them.
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0c1724] px-5 py-3 text-sm font-semibold text-white"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4 text-gold" />
          )}
          {busy ? "Saving…" : "Save Package"}
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
          title="Package Identity"
          description="Core public package information."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Title">
              <input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className={input}
              />
            </Field>
            <Field label="Package Type">
              <select
                value={form.packageTypeOptionId}
                onChange={(e) => update("packageTypeOptionId", e.target.value)}
                className={input}
              >
                <option value="">Select package type</option>
                {packageTypes.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Description">
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className={textarea}
            />
          </Field>
        </Section>
        <Section
          title="Package Main Image"
          description="Direct upload for the package detail page. This is independent from Media Library."
        >
          {detail?.package.heroImage ? (
            <img
              src={detail.package.heroImage}
              alt=""
              className="mb-4 aspect-[16/6] w-full rounded-2xl object-cover"
            />
          ) : null}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold">
            <Upload className="h-4 w-4" />
            {file?.name ??
              (detail ? "Replace hero image" : "Choose hero image")}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </Section>
        <Section
          title="Trip Details"
          description="Structured duration, difficulty, group size and administered rating."
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <NumberField
              label="Minimum Days"
              value={form.durationMinDays}
              min={1}
              onChange={(v) => update("durationMinDays", v)}
            />
            <NumberField
              label="Maximum Days"
              value={form.durationMaxDays}
              min={1}
              onChange={(v) => update("durationMaxDays", v)}
            />
            <Field label="Difficulty">
              <select
                value={form.difficultyOptionId}
                onChange={(e) => update("difficultyOptionId", e.target.value)}
                className={input}
              >
                <option value="">Select difficulty</option>
                {difficulties.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </Field>
            <NumberField
              label="Sort Order"
              value={form.sortOrder}
              min={0}
              onChange={(v) => update("sortOrder", v)}
            />
            <NumberField
              label="Minimum Group Size"
              value={form.groupSizeMin}
              min={1}
              onChange={(v) => update("groupSizeMin", v)}
            />
            <NumberField
              label="Maximum Group Size"
              value={form.groupSizeMax}
              min={1}
              onChange={(v) => update("groupSizeMax", v)}
            />
            <NumberField
              label="Rating"
              value={form.rating}
              min={0}
              max={5}
              step={0.1}
              onChange={(v) => update("rating", v)}
            />
            <NumberField
              label="Total Reviews"
              value={form.reviewCount}
              min={0}
              onChange={(v) => update("reviewCount", v)}
            />
            <NumberField
              label="Current / Starting Price"
              value={form.startingPrice}
              min={0}
              step={0.01}
              onChange={(v) => update("startingPrice", v)}
            />
            <OptionalNumberField
              label="Original Price (crossed out)"
              value={form.oldPrice}
              min={0}
              step={0.01}
              onChange={(v) => update("oldPrice", v)}
            />
          </div>
        </Section>
        <Section
          title="Package Destinations"
          description="Search all published and unpublished destinations. Selected associations power existing Destination Related Tours."
        >
          <div className="flex flex-wrap gap-2">
            {selectedDestinations.map((d) => (
              <button
                type="button"
                key={d.id}
                onClick={() =>
                  update(
                    "destinationIds",
                    form.destinationIds.filter((id) => id !== d.id),
                  )
                }
                className="inline-flex items-center gap-2 rounded-full bg-[#0c1724] px-3 py-2 text-xs font-semibold text-white"
              >
                {d.name}
                {!d.status ? (
                  <span className="text-white/50">(unpublished)</span>
                ) : null}
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
          <label className="mt-4 flex items-center gap-2 rounded-xl border px-4 py-3">
            <Search className="h-4 w-4" />
            <input
              value={destinationSearch}
              onChange={(e) => setDestinationSearch(e.target.value)}
              placeholder="Search destinations…"
              className="w-full outline-none"
            />
          </label>
          {destinationSearch ? (
            <div className="mt-2 grid gap-1 rounded-xl border bg-white p-2">
              {availableDestinations.map((d) => (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => {
                    update("destinationIds", [...form.destinationIds, d.id]);
                    setDestinationSearch("");
                  }}
                  className="rounded-lg px-3 py-2 text-left text-sm hover:bg-black/5"
                >
                  {d.name}{" "}
                  {!d.status ? (
                    <span className="text-muted-foreground">· Unpublished</span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </Section>
        <Section
          title="Tour Overview"
          description="Long-form overview shown on the package detail page."
        >
          <textarea
            rows={7}
            value={form.overview ?? ""}
            onChange={(e) => update("overview", e.target.value || null)}
            className={textarea}
          />
        </Section>
        {listField("highlights", "Highlights")}
        <Section
          title="Itinerary"
          description="Add structured day ranges and reorder rows."
        >
          {form.itineraries.map((item, i) => (
            <Card
              key={i}
              index={i}
              count={form.itineraries.length}
              onMove={(d) => moveArray("itineraries", i, d)}
              onRemove={() => removeArray("itineraries", i)}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <NumberField
                  label="Minimum Day"
                  value={item.minDay}
                  min={1}
                  onChange={(v) =>
                    updateArray("itineraries", i, { ...item, minDay: v })
                  }
                />
                <NumberField
                  label="Maximum Day"
                  value={item.maxDay}
                  min={1}
                  onChange={(v) =>
                    updateArray("itineraries", i, { ...item, maxDay: v })
                  }
                />
              </div>
              <Field label="Title">
                <input
                  value={item.title}
                  onChange={(e) =>
                    updateArray("itineraries", i, {
                      ...item,
                      title: e.target.value,
                    })
                  }
                  className={input}
                />
              </Field>
              <Field label="Description">
                <textarea
                  rows={4}
                  value={item.description}
                  onChange={(e) =>
                    updateArray("itineraries", i, {
                      ...item,
                      description: e.target.value,
                    })
                  }
                  className={textarea}
                />
              </Field>
            </Card>
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
        <Section
          title="Pricing"
          description="Tier options load live from Other Settings. Prices are stored numerically."
        >
          {form.tiers.map((item, i) => (
            <Card
              key={i}
              index={i}
              count={form.tiers.length}
              onMove={(d) => moveArray("tiers", i, d)}
              onRemove={() => removeArray("tiers", i)}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Pricing Tier">
                  <select
                    value={item.tierOptionId ?? ""}
                    onChange={(e) =>
                      updateArray("tiers", i, {
                        ...item,
                        tierOptionId: e.target.value || null,
                        name:
                          pricingTiers.find(
                            (option) => option.id === e.target.value,
                          )?.name ?? item.name,
                      })
                    }
                    className={input}
                  >
                    <option value="">
                      {item.id ? `Legacy: ${item.name}` : "Select tier"}
                    </option>
                    {pricingTiers.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <NumberField
                  label="Price"
                  value={item.price}
                  min={0}
                  step={0.01}
                  onChange={(v) =>
                    updateArray("tiers", i, { ...item, price: v })
                  }
                />
              </div>
              <Field label="Features / Tier Note">
                <textarea
                  rows={3}
                  value={item.note}
                  onChange={(e) =>
                    updateArray("tiers", i, { ...item, note: e.target.value })
                  }
                  className={textarea}
                />
              </Field>
            </Card>
          ))}
          {pricingTiers[0] ? (
            <Add
              onClick={() =>
                update("tiers", [
                  ...form.tiers,
                  {
                    tierOptionId: pricingTiers[0]!.id,
                    name: pricingTiers[0]!.name,
                    price: 0,
                    note: "",
                  },
                ])
              }
            >
              Add Pricing Card
            </Add>
          ) : (
            <p className="text-sm text-amber-700">
              Add a Package Pricing Tier in Other Settings before creating a pricing card.
            </p>
          )}
        </Section>
        {listField("inclusions", "Inclusions")}
        {listField("exclusions", "Exclusions")}
        <Section
          title="Reviews"
          description="Package-specific review cards with half-star ratings."
        >
          {form.reviews.map((item, i) => (
            <Card
              key={i}
              index={i}
              count={form.reviews.length}
              onMove={(d) => moveArray("reviews", i, d)}
              onRemove={() => removeArray("reviews", i)}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <NumberField
                  label="Star Rating"
                  value={item.rating}
                  min={1}
                  max={5}
                  step={0.5}
                  onChange={(v) =>
                    updateArray("reviews", i, { ...item, rating: v })
                  }
                />
                <Field label="Customer Name">
                  <input
                    value={item.customerName}
                    onChange={(e) =>
                      updateArray("reviews", i, {
                        ...item,
                        customerName: e.target.value,
                      })
                    }
                    className={input}
                  />
                </Field>
              </div>
              <Field label="Customer Country">
                <select
                  value={item.customerCountryCode}
                  onChange={(e) =>
                    updateArray("reviews", i, {
                      ...item,
                      customerCountryCode: e.target.value,
                    })
                  }
                  className={input}
                >
                  <option value="">Select country</option>
                  {countries.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Review Text">
                <textarea
                  rows={4}
                  value={item.reviewText}
                  onChange={(e) =>
                    updateArray("reviews", i, {
                      ...item,
                      reviewText: e.target.value,
                    })
                  }
                  className={textarea}
                />
              </Field>
            </Card>
          ))}
          <Add
            onClick={() =>
              update("reviews", [
                ...form.reviews,
                {
                  rating: 5,
                  reviewText: "",
                  customerName: "",
                  customerCountryCode: "NP",
                },
              ])
            }
          >
            Add Review
          </Add>
        </Section>
        <Section
          title="FAQs"
          description="Package-specific questions and answers."
        >
          {form.faqs.map((item, i) => (
            <Card
              key={i}
              index={i}
              count={form.faqs.length}
              onMove={(d) => moveArray("faqs", i, d)}
              onRemove={() => removeArray("faqs", i)}
            >
              <Field label="Question">
                <input
                  value={item.question}
                  onChange={(e) =>
                    updateArray("faqs", i, {
                      ...item,
                      question: e.target.value,
                    })
                  }
                  className={input}
                />
              </Field>
              <Field label="Answer">
                <textarea
                  rows={4}
                  value={item.answer}
                  onChange={(e) =>
                    updateArray("faqs", i, { ...item, answer: e.target.value })
                  }
                  className={textarea}
                />
              </Field>
            </Card>
          ))}
          <Add
            onClick={() =>
              update("faqs", [...form.faqs, { question: "", answer: "" }])
            }
          >
            Add FAQ
          </Add>
        </Section>
        <Section
          title="SEO"
          description="Optional package-specific search metadata."
        >
          <Field label="SEO Title">
            <input
              value={form.seoTitle ?? ""}
              onChange={(e) => update("seoTitle", e.target.value || null)}
              className={input}
            />
          </Field>
          <Field label="SEO Description">
            <textarea
              rows={3}
              value={form.seoDescription ?? ""}
              onChange={(e) => update("seoDescription", e.target.value || null)}
              className={textarea}
            />
          </Field>
        </Section>
      </div>
      <div className="sticky bottom-4 mt-6 flex justify-end">
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0c1724] px-6 py-3 text-sm font-semibold text-white shadow-xl disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin text-gold" />
          ) : (
            <Save className="h-4 w-4 text-gold" />
          )}
          {busy ? "Saving..." : "Save Package"}
        </button>
      </div>
    </div>
  );
}
const input =
  "h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-gold";
const textarea =
  "mt-1 w-full resize-y rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-gold";
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
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm lg:p-6">
      <h2 className="text-lg font-semibold text-[#0c1724]">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-xs font-semibold text-[#0c1724]">
      {label}
      {children}
    </label>
  );
}
function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max?: number;
  step?: number;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className={input}
      />
    </Field>
  );
}
function OptionalNumberField({
  label,
  value,
  onChange,
  min,
  step = 1,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  min: number;
  step?: number;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        value={value ?? ""}
        min={min}
        step={step}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
        className={input}
      />
    </Field>
  );
}
function Add({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-fit items-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm font-semibold"
    >
      <Plus className="h-4 w-4 text-gold" />
      {children}
    </button>
  );
}
function Card({
  index,
  count,
  onMove,
  onRemove,
  children,
}: {
  index: number;
  count: number;
  onMove: (d: -1 | 1) => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-[#faf9f6] p-4">
      <div className="mb-4 flex justify-end gap-2">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => onMove(-1)}
          className="rounded-lg border bg-white p-2 disabled:opacity-30"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={index === count - 1}
          onClick={() => onMove(1)}
          className="rounded-lg border bg-white p-2 disabled:opacity-30"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg border border-red-200 bg-white p-2 text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}
function TextList({
  values,
  onChange,
}: {
  values: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <>
      {values.map((value, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={value}
            onChange={(e) =>
              onChange(values.map((x, n) => (n === i ? e.target.value : x)))
            }
            className={input}
          />
          <button
            type="button"
            disabled={i === 0}
            onClick={() => {
              const a = [...values];
              const previous = a[i - 1];
              const current = a[i];
              if (previous === undefined || current === undefined) return;
              a[i - 1] = current;
              a[i] = previous;
              onChange(a);
            }}
            className="rounded-lg border p-2 disabled:opacity-30"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={i === values.length - 1}
            onClick={() => {
              const a = [...values];
              const next = a[i + 1];
              const current = a[i];
              if (next === undefined || current === undefined) return;
              a[i + 1] = current;
              a[i] = next;
              onChange(a);
            }}
            className="rounded-lg border p-2 disabled:opacity-30"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onChange(values.filter((_, n) => n !== i))}
            className="rounded-lg border border-red-200 p-2 text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Add onClick={() => onChange([...values, ""])}>Add Item</Add>
    </>
  );
}
