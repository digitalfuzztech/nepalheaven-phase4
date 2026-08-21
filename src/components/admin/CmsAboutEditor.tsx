import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
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
  cmsAboutPageSchema,
  type CmsAboutPageInput,
} from "@/lib/cms-page-content.schema";
import { updateCmsAboutPageFn } from "@/lib/cms-page-content.functions";
export function CmsAboutEditor({
  initial,
  images,
}: {
  initial: CmsAboutPageInput;
  images: CmsSelectableImage[];
}) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  async function save() {
    const parsed = cmsAboutPageSchema.safeParse(form);
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    setBusy(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      setForm(await updateCmsAboutPageFn({ data: parsed.data }));
      setSuccessMessage("About page saved.");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  const text = (label: string, key: keyof CmsAboutPageInput, area = false) => (
    <Field label={label}>
      {area ? (
        <textarea
          rows={5}
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
    </Field>
  );
  const reorder = <
    K extends "counters" | "team" | "milestones" | "awards" | "partners",
  >(
    key: K,
    index: number,
    d: -1 | 1,
  ) => {
    const rows = [...form[key]],
      n = index + d;
    if (n < 0 || n >= rows.length) return;
    [rows[index], rows[n]] = [rows[n]!, rows[index]!];
    setForm((x) => ({ ...x, [key]: rows }));
  };
  return (
    <div className="min-w-0 max-w-full">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          <Link
            to="/admin/cms"
            className="text-sm font-semibold text-muted-foreground"
          >
            ← Back to CMS
          </Link>
          <p className="text-xs font-bold uppercase text-gold">About CMS</p>
          <h1 className="mt-2 text-4xl font-semibold">About Page</h1>
        </div>
        <CmsSaveButton
          busy={busy}
          label="Save About Page"
          type="button"
          onClick={() => void save()}
        />
      </div>
      <CmsEditorAlert error={errorMessage} success={successMessage} />
      <div className="mt-8 grid gap-6">
        <Section title="Hero">
          <CmsMediaPicker
            label="Hero Image"
            value={form.heroMediaId}
            images={images}
            generalSettingsTypeValue="website-media"
            onChange={(heroMediaId) => setForm((x) => ({ ...x, heroMediaId }))}
          />
          {text("Subtitle", "heroSubtitle")}
          {text("Title", "heroTitle")}
          {text("Description", "heroDescription", true)}
        </Section>
        <Section title="Mission">
          {text("Title", "missionTitle")}
          {text("Description", "missionDescription", true)}
        </Section>
        <Section title="Vision">
          {text("Title", "visionTitle")}
          {text("Description", "visionDescription", true)}
        </Section>
        <Section title="The Story">
          {text("Title", "storyTitle")}
          {text("Story Text", "storyText", true)}
          <p className="text-xs text-muted-foreground">
            The public page splits this single story at the nearest sentence
            boundary to its word midpoint.
          </p>
        </Section>
        <Section title="Counters">
          <p className="text-sm text-muted-foreground">
            Maximum four counters.
          </p>
          {form.counters.map((row, i) => (
            <Card
              key={i}
              up={() => reorder("counters", i, -1)}
              down={() => reorder("counters", i, 1)}
              remove={() =>
                setForm((x) => ({
                  ...x,
                  counters: x.counters.filter((_, n) => n !== i),
                }))
              }
            >
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Number">
                  <input
                    type="number"
                    step="0.1"
                    value={row.number}
                    onChange={(e) =>
                      setForm((x) => ({
                        ...x,
                        counters: x.counters.map((v, n) =>
                          n === i
                            ? { ...v, number: Number(e.target.value) }
                            : v,
                        ),
                      }))
                    }
                    className={control}
                  />
                </Field>
                <Field label="Symbol">
                  <input
                    value={row.symbol}
                    onChange={(e) =>
                      setForm((x) => ({
                        ...x,
                        counters: x.counters.map((v, n) =>
                          n === i ? { ...v, symbol: e.target.value } : v,
                        ),
                      }))
                    }
                    className={control}
                  />
                </Field>
                <Field label="Counter Text">
                  <input
                    value={row.text}
                    onChange={(e) =>
                      setForm((x) => ({
                        ...x,
                        counters: x.counters.map((v, n) =>
                          n === i ? { ...v, text: e.target.value } : v,
                        ),
                      }))
                    }
                    className={control}
                  />
                </Field>
              </div>
            </Card>
          ))}
          {form.counters.length < 4 ? (
            <Add
              onClick={() =>
                setForm((x) => ({
                  ...x,
                  counters: [
                    ...x.counters,
                    { number: 0, symbol: "+", text: "" },
                  ],
                }))
              }
            >
              Add Counter
            </Add>
          ) : null}
        </Section>
        <Section title="Team">
          {form.team.map((row, i) => (
            <Card
              key={i}
              up={() => reorder("team", i, -1)}
              down={() => reorder("team", i, 1)}
              remove={() =>
                setForm((x) => ({
                  ...x,
                  team: x.team.filter((_, n) => n !== i),
                }))
              }
            >
              <CmsMediaPicker
                label="Photo"
                value={row.photoMediaId}
                images={images}
                generalSettingsTypeValue="team"
                onChange={(photoMediaId) =>
                  setForm((x) => ({
                    ...x,
                    team: x.team.map((v, n) =>
                      n === i ? { ...v, photoMediaId } : v,
                    ),
                  }))
                }
              />
              <Field label="Name">
                <input
                  value={row.name}
                  onChange={(e) =>
                    setForm((x) => ({
                      ...x,
                      team: x.team.map((v, n) =>
                        n === i ? { ...v, name: e.target.value } : v,
                      ),
                    }))
                  }
                  className={control}
                />
              </Field>
              <Field label="Position">
                <input
                  value={row.position}
                  onChange={(e) =>
                    setForm((x) => ({
                      ...x,
                      team: x.team.map((v, n) =>
                        n === i ? { ...v, position: e.target.value } : v,
                      ),
                    }))
                  }
                  className={control}
                />
              </Field>
              <Field label="Major Achievement">
                <textarea
                  value={row.achievement}
                  onChange={(e) =>
                    setForm((x) => ({
                      ...x,
                      team: x.team.map((v, n) =>
                        n === i ? { ...v, achievement: e.target.value } : v,
                      ),
                    }))
                  }
                  className={control}
                />
              </Field>
            </Card>
          ))}
          <Add
            onClick={() =>
              setForm((x) => ({
                ...x,
                team: [
                  ...x.team,
                  {
                    photoMediaId: null,
                    name: "",
                    position: "",
                    achievement: "",
                  },
                ],
              }))
            }
          >
            Add Team Member
          </Add>
        </Section>
        <Section title="Milestones">
          {form.milestones.map((row, i) => (
            <Card
              key={i}
              up={() => reorder("milestones", i, -1)}
              down={() => reorder("milestones", i, 1)}
              remove={() =>
                setForm((x) => ({
                  ...x,
                  milestones: x.milestones.filter((_, n) => n !== i),
                }))
              }
            >
              <Field label="Year">
                <input
                  value={row.year}
                  onChange={(e) =>
                    setForm((x) => ({
                      ...x,
                      milestones: x.milestones.map((v, n) =>
                        n === i ? { ...v, year: e.target.value } : v,
                      ),
                    }))
                  }
                  className={control}
                />
              </Field>
              <Field label="Title">
                <input
                  value={row.title}
                  onChange={(e) =>
                    setForm((x) => ({
                      ...x,
                      milestones: x.milestones.map((v, n) =>
                        n === i ? { ...v, title: e.target.value } : v,
                      ),
                    }))
                  }
                  className={control}
                />
              </Field>
              <Field label="Description">
                <textarea
                  value={row.description}
                  onChange={(e) =>
                    setForm((x) => ({
                      ...x,
                      milestones: x.milestones.map((v, n) =>
                        n === i ? { ...v, description: e.target.value } : v,
                      ),
                    }))
                  }
                  className={control}
                />
              </Field>
            </Card>
          ))}
          <Add
            onClick={() =>
              setForm((x) => ({
                ...x,
                milestones: [
                  ...x.milestones,
                  { year: "", title: "", description: "" },
                ],
              }))
            }
          >
            Add Milestone
          </Add>
        </Section>
        {(["awards", "partners"] as const).map((key) => (
          <Section
            key={key}
            title={
              key === "awards"
                ? "Recognitions / Awards"
                : "Accredited By / Partners"
            }
          >
            {form[key].map((value, i) => (
              <Card
                key={i}
                up={() => reorder(key, i, -1)}
                down={() => reorder(key, i, 1)}
                remove={() =>
                  setForm((x) => ({
                    ...x,
                    [key]: x[key].filter((_, n) => n !== i),
                  }))
                }
              >
                <input
                  value={value}
                  onChange={(e) =>
                    setForm((x) => ({
                      ...x,
                      [key]: x[key].map((v, n) =>
                        n === i ? e.target.value : v,
                      ),
                    }))
                  }
                  className={control}
                />
              </Card>
            ))}
            <Add
              onClick={() => setForm((x) => ({ ...x, [key]: [...x[key], ""] }))}
            >
              Add Item
            </Add>
          </Section>
        ))}
      </div>
      <CmsFloatingSave
        busy={busy}
        label="Save About Page"
        onClick={() => void save()}
      />
    </div>
  );
}
const control = "min-w-0 w-full max-w-full rounded-xl border px-4 py-3 text-sm";
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 max-w-full rounded-2xl border bg-white p-4 sm:p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5 grid min-w-0 gap-4">{children}</div>
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
function Card({
  children,
  up,
  down,
  remove,
}: {
  children: ReactNode;
  up: () => void;
  down: () => void;
  remove: () => void;
}) {
  return (
    <div className="min-w-0 max-w-full rounded-2xl border bg-[#faf9f6] p-4">
      <div className="mb-3 flex justify-end gap-2">
        <button type="button" onClick={up} className="rounded-lg border p-2">
          <ArrowUp className="h-4 w-4" />
        </button>
        <button type="button" onClick={down} className="rounded-lg border p-2">
          <ArrowDown className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={remove}
          className="rounded-lg border p-2 text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="grid min-w-0 gap-4">{children}</div>
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
      className="w-fit rounded-xl border border-dashed px-4 py-3"
    >
      <Plus className="mr-2 inline h-4 w-4" />
      {children}
    </button>
  );
}
