import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ImageIcon, Star, Upload } from "lucide-react";
import {
  CmsEditorAlert,
  CmsFloatingSave,
  CmsSaveButton,
} from "@/components/admin/CmsEditorControls";
import { countryOptions } from "@/lib/countries";
import {
  cmsTestimonialInputSchema,
  type CmsTestimonialInput,
} from "@/lib/cms-testimonials.schema";
import {
  saveCmsTestimonialFn,
  uploadCmsTestimonialPhotoFn,
} from "@/lib/cms-testimonials.functions";

type Option = { id: string; title: string };
type Associations = Record<"destination" | "package" | "experience", Option[]>;
export function CmsTestimonialEditor({
  initial,
  associations,
  avatarUrl,
}: {
  initial: CmsTestimonialInput;
  associations: Associations;
  avatarUrl?: string | null;
}) {
  const navigate = useNavigate();
  const countries = useMemo(() => countryOptions(), []);
  const [form, setForm] = useState(initial),
    [photo, setPhoto] = useState<File | null>(null),
    [preview, setPreview] = useState(avatarUrl ?? ""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  useEffect(() => {
    if (!photo) return;
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);
  async function save() {
    setError("");
    setSuccess("");
    const parsed = cmsTestimonialInputSchema.safeParse(form);
    if (!parsed.success)
      return setError(
        parsed.error.issues[0]?.message ?? "Check the testimonial.",
      );
    setBusy(true);
    try {
      const saved = await saveCmsTestimonialFn({ data: parsed.data });
      if (photo) {
        const body = new FormData();
        body.set("id", saved.id);
        body.set("photo", photo);
        const uploaded = await uploadCmsTestimonialPhotoFn({ data: body });
        setPreview(uploaded.url);
        setPhoto(null);
      }
      setForm({
        id: saved.id,
        name: saved.name,
        content: saved.content,
        rating: saved.rating,
        countryCode: saved.countryCode,
        associationType: saved.associationType,
        associatedEntityId: saved.associatedEntityId,
        sortOrder: saved.sortOrder,
      });
      setSuccess("Testimonial saved successfully.");
      if (!initial.id)
        await navigate({
          to: "/admin/cms/testimonials/$id",
          params: { id: saved.id },
          replace: true,
        });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Testimonial could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  const options = form.associationType
    ? associations[form.associationType]
    : [];
  return (
    <div className="min-w-0 max-w-full pb-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <Link
            to="/admin/cms/testimonials"
            className="text-sm font-semibold text-muted-foreground"
          >
            ← Back to Testimonials
          </Link>
          <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-gold">
            Testimonials CMS
          </p>
          <h1 className="mt-2 text-4xl font-semibold">
            {initial.id ? "Edit Testimonial" : "Add Testimonial"}
          </h1>
        </div>
        <CmsSaveButton
          busy={busy}
          label="Save Testimonial"
          onClick={() => void save()}
        />
      </div>
      <CmsEditorAlert error={error} success={success} />
      <div className="mt-8 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,.72fr)]">
        <section className="min-w-0 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Traveller story</h2>
          <div className="mt-5 grid gap-5">
            <Field label="Person Name">
              <input
                className={control}
                value={form.name}
                onChange={(e) =>
                  setForm((x) => ({ ...x, name: e.target.value }))
                }
              />
            </Field>
            <Field label="Testimonial Text">
              <textarea
                rows={7}
                className={control}
                value={form.content}
                onChange={(e) =>
                  setForm((x) => ({ ...x, content: e.target.value }))
                }
              />
            </Field>
            <Field label="Star Rating">
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min={1}
                  max={5}
                  className={control}
                  value={form.rating}
                  onChange={(e) =>
                    setForm((x) => ({ ...x, rating: Number(e.target.value) }))
                  }
                />
                <span className="flex text-gold">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < form.rating ? "fill-current" : ""}`}
                    />
                  ))}
                </span>
              </div>
            </Field>
            <Field label="Country">
              <select
                className={control}
                value={form.countryCode}
                onChange={(e) =>
                  setForm((x) => ({ ...x, countryCode: e.target.value }))
                }
              >
                {countries.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sort Order">
              <input
                type="number"
                min={0}
                className={control}
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((x) => ({ ...x, sortOrder: Number(e.target.value) }))
                }
              />
            </Field>
          </div>
        </section>
        <div className="grid min-w-0 content-start gap-6">
          <section className="min-w-0 rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Photo</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Use a clear, square-friendly traveller portrait. JPG, PNG or WebP
              works best.
            </p>
            <div className="mt-5 overflow-hidden rounded-2xl border border-black/10 bg-[#faf9f6]">
              {preview ? (
                <img
                  src={preview}
                  alt="Testimonial preview"
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="grid aspect-square place-items-center border-b border-dashed border-black/15 px-6 text-center">
                  <div>
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-gold shadow-sm">
                      <ImageIcon className="h-6 w-6" aria-hidden />
                    </span>
                    <p className="mt-4 text-sm font-semibold text-[#0c1724]">
                      No photo selected
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your selected photo previews here immediately.
                    </p>
                  </div>
                </div>
              )}
              <div className="p-4">
                <label className="inline-flex max-w-full cursor-pointer items-center gap-2 rounded-xl bg-[#0c1724] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#16283b]">
                  <Upload className="h-4 w-4 shrink-0 text-gold" aria-hidden />
                  <span className="truncate">
                    {photo?.name ??
                      (preview ? "Replace Photo" : "Upload Photo")}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                    className="sr-only"
                  />
                </label>
                <p className="mt-3 text-xs text-muted-foreground">
                  The photo is uploaded when you save the testimonial.
                </p>
              </div>
            </div>
          </section>
          <section className="min-w-0 rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Association</h2>
            <div className="mt-5 grid gap-5">
              <Field label="Association Type">
                <select
                  className={control}
                  value={form.associationType ?? ""}
                  onChange={(e) =>
                    setForm((x) => ({
                      ...x,
                      associationType: e.target.value
                        ? (e.target
                            .value as CmsTestimonialInput["associationType"])
                        : null,
                      associatedEntityId: null,
                    }))
                  }
                >
                  <option value="">None</option>
                  <option value="destination">Destination</option>
                  <option value="package">Package</option>
                  <option value="experience">Experience</option>
                </select>
              </Field>
              {form.associationType ? (
                <Field label="Associated Item">
                  <select
                    className={control}
                    value={form.associatedEntityId ?? ""}
                    onChange={(e) =>
                      setForm((x) => ({
                        ...x,
                        associatedEntityId: e.target.value || null,
                      }))
                    }
                  >
                    <option value="">Choose an item</option>
                    {options.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : null}
            </div>
          </section>
        </div>
      </div>
      <CmsFloatingSave
        busy={busy}
        label="Save Testimonial"
        onClick={() => void save()}
      />
    </div>
  );
}
const control =
  "min-w-0 w-full max-w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-gold";
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-xs font-semibold">
      {label}
      {children}
    </label>
  );
}
