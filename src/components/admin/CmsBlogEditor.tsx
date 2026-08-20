import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  Image,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import type { CmsOtherSettingsOption } from "@/lib/cms-other-settings.constants";
import {
  cmsBlogSaveSchema,
  type CmsBlogSaveInput,
} from "@/lib/cms-blog.schema";
import { saveCmsBlogFn } from "@/lib/cms-blog.functions";
type Data = NonNullable<
  Awaited<
    ReturnType<typeof import("@/lib/cms-blog.server").getCmsBlogEditorData>
  >
>;
export function CmsBlogEditor({
  data,
  options,
  mode,
}: {
  data: Data;
  options: CmsOtherSettingsOption[];
  mode: "create" | "edit";
}) {
  const detail = data.detail;
  const types = options.filter((o) => o.groupKey === "blog_type");
  const navigate = useNavigate();
  const legacyBlocks =
    detail && !detail.blocks.length && detail.post.content
      ? [
          {
            clientId: "legacy-content",
            type: "text" as const,
            content: detail.post.content,
            altText: "",
            caption: "",
          },
        ]
      : [];
  const [form, setForm] = useState<CmsBlogSaveInput>(() =>
    detail
      ? {
          id: detail.post.id,
          blogTypeOptionId:
            detail.post.blogTypeOptionId ??
            types.find((o) => o.name === detail.category?.name)?.id ??
            types[0]?.id ??
            "",
          title: detail.post.title,
          excerpt: detail.post.excerpt ?? "",
          authorName: detail.post.authorName ?? "",
          authorRole: detail.post.authorRole ?? "",
          aboutAuthor: detail.post.aboutAuthor,
          publishedAt: detail.post.publishedAt?.toISOString() ?? null,
          readingTimeMinutes: detail.post.readingTimeMinutes ?? 5,
          highlights: detail.highlights.map((x) => x.item),
          blocks: detail.blocks.length
            ? detail.blocks.map((x) => ({
                id: x.id,
                clientId: x.id,
                type: x.type,
                content: x.content ?? "",
                altText: x.altText ?? "",
                caption: x.caption ?? "",
              }))
            : legacyBlocks,
          seoTitle: detail.post.seoTitle,
          seoDescription: detail.post.seoDescription,
        }
      : {
          blogTypeOptionId: types[0]?.id ?? "",
          title: "",
          excerpt: "",
          authorName: "",
          authorRole: "",
          aboutAuthor: null,
          publishedAt: null,
          readingTimeMinutes: 5,
          highlights: [],
          blocks: [],
          seoTitle: null,
          seoDescription: null,
        },
  );
  const [hero, setHero] = useState<File | null>(null);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const existingImage = (id?: string) =>
    id ? detail?.blocks.find((x) => x.id === id)?.imageUrl : null;
  const update = <K extends keyof CmsBlogSaveInput>(
    key: K,
    value: CmsBlogSaveInput[K],
  ) => setForm((x) => ({ ...x, [key]: value }));
  const newId = () => globalThis.crypto.randomUUID();
  function add(type: "text" | "highlight" | "image") {
    update("blocks", [
      ...form.blocks,
      { clientId: newId(), type, content: "", altText: "", caption: "" },
    ]);
  }
  function block(
    index: number,
    patch: Partial<CmsBlogSaveInput["blocks"][number]>,
  ) {
    update(
      "blocks",
      form.blocks.map((x, n) => (n === index ? { ...x, ...patch } : x)),
    );
  }
  function move(index: number, d: -1 | 1) {
    const rows = [...form.blocks],
      n = index + d;
    if (n < 0 || n >= rows.length) return;
    [rows[index], rows[n]] = [rows[n]!, rows[index]!];
    update("blocks", rows);
  }
  async function save() {
    setError("");
    const parsed = cmsBlogSaveSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("blogData", JSON.stringify(parsed.data));
      if (hero) fd.set("heroImage", hero);
      for (const [key, file] of Object.entries(files))
        fd.set(`blockFile:${key}`, file);
      const result = await saveCmsBlogFn({ data: fd });
      await navigate({ to: "/admin/cms/blog/$id", params: { id: result.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Blog could not be saved.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="pb-16">
      <div className="flex justify-between">
        <div>
          <Link
            to="/admin/cms/blog"
            className="text-sm font-semibold text-muted-foreground"
          >
            ← Back to Blog
          </Link>
          <p className="mt-5 text-xs font-bold uppercase text-gold">Blog CMS</p>
          <h1 className="mt-2 text-4xl font-semibold">
            {mode === "create" ? "Add Blog Post" : form.title}
          </h1>
        </div>
        <SaveBtn busy={busy} save={save} />
      </div>
      {error ? (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </p>
      ) : null}
      <div className="mt-8 grid gap-6">
        <Section title="Blog Identity">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Blog Type">
              <select
                value={form.blogTypeOptionId}
                onChange={(e) => update("blogTypeOptionId", e.target.value)}
                className={input}
              >
                {types.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Title">
              <input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className={input}
              />
            </Field>
            <Field label="Author">
              <input
                value={form.authorName}
                onChange={(e) => update("authorName", e.target.value)}
                className={input}
              />
            </Field>
            <Field label="Position">
              <input
                value={form.authorRole}
                onChange={(e) => update("authorRole", e.target.value)}
                className={input}
              />
            </Field>
            <Field label="Published Date">
              <input
                type="datetime-local"
                value={form.publishedAt?.slice(0, 16) ?? ""}
                onChange={(e) =>
                  update(
                    "publishedAt",
                    e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  )
                }
                className={input}
              />
            </Field>
            <Field label="Time to Read (minutes)">
              <input
                type="number"
                min={1}
                value={form.readingTimeMinutes}
                onChange={(e) =>
                  update("readingTimeMinutes", Number(e.target.value))
                }
                className={input}
              />
            </Field>
          </div>
          <Field label="Blog Description / Excerpt">
            <textarea
              rows={4}
              value={form.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              className={area}
            />
          </Field>
        </Section>
        <Section title="Detail Hero Image">
          {detail?.post.coverImage ? (
            <img
              src={detail.post.coverImage}
              alt=""
              className="aspect-[16/6] w-full rounded-2xl object-cover"
            />
          ) : null}
          <label className="w-fit cursor-pointer rounded-xl border px-4 py-3">
            <Upload className="mr-2 inline h-4 w-4" />
            {hero?.name ?? "Choose hero image"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => setHero(e.target.files?.[0] ?? null)}
            />
          </label>
        </Section>
        <Section title="Highlighted Texts">
          {form.highlights.map((v, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={v}
                onChange={(e) =>
                  update(
                    "highlights",
                    form.highlights.map((x, n) =>
                      n === i ? e.target.value : x,
                    ),
                  )
                }
                className={input}
              />
              <button
                type="button"
                onClick={() =>
                  update(
                    "highlights",
                    form.highlights.filter((_, n) => n !== i),
                  )
                }
                className="rounded-xl border p-3 text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => update("highlights", [...form.highlights, ""])}
            className="w-fit rounded-xl border border-dashed px-4 py-3"
          >
            <Plus className="mr-2 inline h-4 w-4" />
            Add Highlight
          </button>
        </Section>
        <Section title="Structured Blog Content">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => add("text")}
              className={addButton}
            >
              <Plus className="h-4 w-4" />
              Add Text
            </button>
            <button
              type="button"
              onClick={() => add("highlight")}
              className={addButton}
            >
              <Plus className="h-4 w-4" />
              Add Highlight
            </button>
            <button
              type="button"
              onClick={() => add("image")}
              className={addButton}
            >
              <Image className="h-4 w-4" />
              Add Image
            </button>
          </div>
          {form.blocks.map((row, i) => (
            <div
              key={row.clientId}
              className="rounded-2xl border bg-[#faf9f6] p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <strong className="capitalize">{row.type} Block</strong>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    className="rounded-lg border p-2"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    className="rounded-lg border p-2"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      update(
                        "blocks",
                        form.blocks.filter((_, n) => n !== i),
                      )
                    }
                    className="rounded-lg border p-2 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {row.type !== "image" ? (
                <textarea
                  rows={row.type === "highlight" ? 3 : 7}
                  value={row.content}
                  onChange={(e) => block(i, { content: e.target.value })}
                  className={area}
                />
              ) : (
                <div className="grid gap-4">
                  {existingImage(row.id) ? (
                    <img
                      src={existingImage(row.id)!}
                      alt=""
                      className="max-h-64 rounded-xl object-cover"
                    />
                  ) : null}
                  <label className="w-fit cursor-pointer rounded-xl border bg-white px-4 py-3">
                    <Upload className="mr-2 inline h-4 w-4" />
                    {files[row.clientId]?.name ??
                      (row.id ? "Replace image" : "Choose image")}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file)
                          setFiles((x) => ({ ...x, [row.clientId]: file }));
                      }}
                    />
                  </label>
                  <Field label="Alt Text">
                    <input
                      value={row.altText}
                      onChange={(e) => block(i, { altText: e.target.value })}
                      className={input}
                    />
                  </Field>
                  <Field label="Caption">
                    <input
                      value={row.caption}
                      onChange={(e) => block(i, { caption: e.target.value })}
                      className={input}
                    />
                  </Field>
                </div>
              )}
            </div>
          ))}
        </Section>
        <Section title="About the Author">
          <textarea
            rows={5}
            value={form.aboutAuthor ?? ""}
            onChange={(e) => update("aboutAuthor", e.target.value || null)}
            className={area}
          />
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
              onChange={(e) => update("seoDescription", e.target.value || null)}
              className={area}
            />
          </Field>
        </Section>
      </div>
      <div className="sticky bottom-4 mt-6 flex justify-end">
        <SaveBtn busy={busy} save={save} />
      </div>
    </div>
  );
}
const input =
    "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-gold",
  area = input,
  addButton =
    "inline-flex gap-2 rounded-xl border border-dashed px-4 py-3 text-sm font-semibold";
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-white p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-xs font-semibold">
      {label}
      {children}
    </label>
  );
}
function SaveBtn({ busy, save }: { busy: boolean; save: () => Promise<void> }) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void save()}
      className="rounded-xl bg-[#0c1724] px-6 py-3 text-white shadow-xl"
    >
      {busy ? (
        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
      ) : (
        <Save className="mr-2 inline h-4 w-4 text-gold" />
      )}
      {busy ? "Saving..." : "Save Blog"}
    </button>
  );
}
