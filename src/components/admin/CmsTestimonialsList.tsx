import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { deleteCmsTestimonialFn } from "@/lib/cms-testimonials.functions";
import { CmsEditorAlert } from "@/components/admin/CmsEditorControls";
type Row = {
  id: string;
  name: string;
  content: string;
  rating: string | null;
  location: string | null;
};
export function CmsTestimonialsList({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial),
    [query, setQuery] = useState(""),
    [target, setTarget] = useState<Row | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const shown = useMemo(
    () =>
      rows.filter((x) =>
        `${x.name} ${x.content}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [rows, query],
  );
  async function remove() {
    if (!target) return;
    setError("");
    setBusy(true);
    try {
      await deleteCmsTestimonialFn({ data: { id: target.id } });
      setRows((x) => x.filter((row) => row.id !== target.id));
      setTarget(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Testimonial could not be deleted.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <Link
            to="/admin/cms"
            className="text-sm font-semibold text-muted-foreground"
          >
            ← Back to CMS
          </Link>
          <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-gold">
            Testimonials CMS
          </p>
          <h1 className="mt-2 text-4xl font-semibold">Testimonials</h1>
        </div>
        <Link
          to="/admin/cms/testimonials/new"
          className="inline-flex items-center gap-2 rounded-full bg-[#0c1724] px-5 py-3 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4 text-gold" />
          Add Testimonial
        </Link>
      </div>
      <CmsEditorAlert error={error} />
      <label className="relative mt-8 block max-w-xl">
        <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search testimonials"
          className="w-full rounded-xl border py-3 pl-11 pr-4"
        />
      </label>
      <div className="mt-6 overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full min-w-[700px] text-left">
          <thead className="border-b bg-[#faf9f6] text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-4">Person</th>
              <th>Testimonial</th>
              <th>Rating</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="p-4 font-semibold">
                  {row.name}
                  <span className="block text-xs font-normal text-muted-foreground">
                    {row.location}
                  </span>
                </td>
                <td className="max-w-xl py-4 text-sm text-muted-foreground">
                  <span className="line-clamp-2">{row.content}</span>
                </td>
                <td>{row.rating ?? "5"} ★</td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      to="/admin/cms/testimonials/$id"
                      params={{ id: row.id }}
                      className="rounded-lg border p-2"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => setTarget(row)}
                      className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {target ? (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <h2 className="mt-4 text-2xl font-semibold">
              Delete {target.name}'s testimonial?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              This deletes the testimonial and its directly uploaded photo.
              Associated Destinations, Packages, and Experiences remain
              untouched.
            </p>
            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={() => setTarget(null)}
                className="rounded-xl border px-5 py-2.5"
              >
                Cancel
              </button>
              <button
                disabled={busy}
                onClick={() => void remove()}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-white"
              >
                {busy ? "Deleting..." : "Delete Testimonial"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
