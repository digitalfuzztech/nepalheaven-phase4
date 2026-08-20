import { useMemo, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import type { CmsExperienceListItem } from "@/lib/cms-experiences.server";
import {
  deleteCmsExperienceFn,
  updateCmsExperienceStatusFn,
} from "@/lib/cms-experiences.functions";
export function CmsExperiencesList({
  experiences,
}: {
  experiences: CmsExperienceListItem[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<CmsExperienceListItem | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");
  const filtered = useMemo(
    () =>
      experiences.filter((item) =>
        `${item.title} ${item.type ?? ""}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      ),
    [experiences, query],
  );
  const published = experiences.filter((item) => item.status).length;
  async function status(item: CmsExperienceListItem) {
    setPending(item.id);
    try {
      await updateCmsExperienceStatusFn({
        data: { id: item.id, status: !item.status },
      });
      await router.invalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Status could not be changed.");
    } finally {
      setPending(null);
    }
  }
  async function remove() {
    if (!target) return;
    setPending(target.id);
    try {
      await deleteCmsExperienceFn({ data: { id: target.id } });
      setTarget(null);
      await router.invalidate();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Experience could not be deleted.",
      );
    } finally {
      setPending(null);
    }
  }
  return (
    <div>
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <Link
            to="/admin/cms"
            className="text-sm font-semibold text-muted-foreground"
          >
            ← Back to CMS
          </Link>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-gold">
            Experience CMS
          </p>
          <h1 className="mt-2 text-4xl font-semibold">Experiences</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage experience content, relationships and publishing.
          </p>
        </div>
        <Link
          to="/admin/cms/experiences/new"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0c1724] px-5 py-3 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4 text-gold" />
          Create Experience
        </Link>
      </div>
      {error ? (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <Link
        to="/admin/cms/experiences/listing-page"
        className="mt-7 block rounded-2xl border border-gold/25 bg-white p-6 shadow-sm"
      >
        <p className="text-xs font-bold uppercase tracking-[.14em] text-gold">
          Public page
        </p>
        <h2 className="mt-2 text-xl font-semibold">
          Edit experiences listing page
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the existing /experiences hero and sections.
        </p>
      </Link>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Total Experiences", experiences.length],
          ["Published", published],
          ["Unpublished", experiences.length - published],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <label className="mt-6 flex items-center gap-3 rounded-2xl border bg-white px-4 py-3">
        <Search className="h-4 w-4" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search experiences…"
          className="w-full outline-none"
        />
      </label>
      <div className="mt-5 overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full min-w-[760px] text-left">
          <thead className="border-b bg-[#f8f8f6] text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-4">Experience</th>
              <th>Type</th>
              <th>Packages</th>
              <th>Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="p-4 font-semibold">{item.title}</td>
                <td>{item.type ?? "—"}</td>
                <td>{item.packageCount}</td>
                <td>{item.status ? "Published" : "Unpublished"}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      to="/admin/cms/experiences/$id"
                      params={{ id: item.id }}
                      className="rounded-lg border p-2"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    {item.status ? (
                      <a
                        href={`/experiences/${item.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border p-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : null}
                    <button
                      disabled={pending === item.id}
                      onClick={() => void status(item)}
                      className="rounded-lg border border-amber-200 bg-amber-50 p-2"
                    >
                      {pending === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : item.status ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setTarget(item)}
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
              Delete {target.title}?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              This deletes the Experience, its hero, highlights, itinerary,
              FAQs, inclusions, exclusions and package links. Packages and Media
              Library files remain.
            </p>
            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={() => setTarget(null)}
                className="rounded-xl border px-5 py-2.5"
              >
                Cancel
              </button>
              <button
                disabled={pending === target.id}
                onClick={() => void remove()}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-white"
              >
                Delete Experience
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
