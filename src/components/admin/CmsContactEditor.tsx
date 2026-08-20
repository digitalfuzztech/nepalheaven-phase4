import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import {
  CmsMediaPicker,
  type CmsSelectableImage,
} from "@/components/admin/CmsMediaPicker";
import {
  cmsContactPageSchema,
  type CmsContactPageInput,
} from "@/lib/cms-page-content.schema";
import { updateCmsContactPageFn } from "@/lib/cms-page-content.functions";
export function CmsContactEditor({
  initial,
  images,
}: {
  initial: CmsContactPageInput;
  images: CmsSelectableImage[];
}) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  async function save() {
    const parsed = cmsContactPageSchema.safeParse(form);
    if (!parsed.success) {
      setMsg(parsed.error.issues[0]?.message ?? "Check form.");
      return;
    }
    setBusy(true);
    try {
      setForm(await updateCmsContactPageFn({ data: parsed.data }));
      setMsg("Contact page saved.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  function move(i: number, d: -1 | 1) {
    const rows = [...form.faqs],
      n = i + d;
    if (n < 0 || n >= rows.length) return;
    [rows[i], rows[n]] = [rows[n]!, rows[i]!];
    setForm((x) => ({ ...x, faqs: rows }));
  }
  return (
    <div>
      <div className="flex justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-gold">Contact CMS</p>
          <h1 className="mt-2 text-4xl font-semibold">Contact Page</h1>
        </div>
        <button
          disabled={busy}
          onClick={() => void save()}
          className="rounded-xl bg-[#0c1724] px-6 py-3 text-white"
        >
          <Save className="mr-2 inline h-4 w-4" />
          {busy ? "Saving..." : "Save Contact Page"}
        </button>
      </div>
      {msg ? (
        <p className="mt-5 rounded-xl border bg-white p-4">{msg}</p>
      ) : null}
      <div className="mt-8 grid gap-6">
        <section className={section}>
          <h2 className="text-xl">Hero</h2>
          <CmsMediaPicker
            label="Hero Image"
            value={form.heroMediaId}
            images={images}
            generalSettingsTypeValue="website-media"
            onChange={(heroMediaId) => setForm((x) => ({ ...x, heroMediaId }))}
          />
          {(["heroSubtitle", "heroTitle", "heroDescription"] as const).map(
            (key) => (
              <label key={key} className="grid gap-2 text-xs font-semibold">
                {key === "heroSubtitle"
                  ? "Subtitle"
                  : key === "heroTitle"
                    ? "Title"
                    : "Description"}
                {key === "heroDescription" ? (
                  <textarea
                    rows={4}
                    value={form[key]}
                    onChange={(e) =>
                      setForm((x) => ({ ...x, [key]: e.target.value }))
                    }
                    className={control}
                  />
                ) : (
                  <input
                    value={form[key]}
                    onChange={(e) =>
                      setForm((x) => ({ ...x, [key]: e.target.value }))
                    }
                    className={control}
                  />
                )}
              </label>
            ),
          )}
        </section>
        <section className={section}>
          <h2 className="text-xl">Contact FAQs</h2>
          {form.faqs.map((row, i) => (
            <div key={i} className="rounded-2xl border bg-[#faf9f6] p-4">
              <div className="mb-3 flex justify-end gap-2">
                <button onClick={() => move(i, -1)} className={button}>
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button onClick={() => move(i, 1)} className={button}>
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    setForm((x) => ({
                      ...x,
                      faqs: x.faqs.filter((_, n) => n !== i),
                    }))
                  }
                  className={button}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
              <input
                value={row.question}
                onChange={(e) =>
                  setForm((x) => ({
                    ...x,
                    faqs: x.faqs.map((v, n) =>
                      n === i ? { ...v, question: e.target.value } : v,
                    ),
                  }))
                }
                placeholder="Question"
                className={control}
              />
              <textarea
                rows={4}
                value={row.answer}
                onChange={(e) =>
                  setForm((x) => ({
                    ...x,
                    faqs: x.faqs.map((v, n) =>
                      n === i ? { ...v, answer: e.target.value } : v,
                    ),
                  }))
                }
                placeholder="Answer"
                className={`${control} mt-3`}
              />
            </div>
          ))}
          <button
            onClick={() =>
              setForm((x) => ({
                ...x,
                faqs: [...x.faqs, { question: "", answer: "" }],
              }))
            }
            className="w-fit rounded-xl border border-dashed px-4 py-3"
          >
            <Plus className="mr-2 inline h-4 w-4" />
            Add FAQ
          </button>
        </section>
      </div>
    </div>
  );
}
const section = "grid gap-4 rounded-2xl border bg-white p-6",
  control = "w-full rounded-xl border px-4 py-3",
  button = "rounded-lg border p-2";
