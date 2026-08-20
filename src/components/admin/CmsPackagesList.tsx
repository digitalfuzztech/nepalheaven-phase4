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
import type { CmsPackageListItem } from "@/lib/cms-packages.server";
import {
  deleteCmsPackageFn,
  updateCmsPackageStatusFn,
} from "@/lib/cms-packages.functions";

export function CmsPackagesList({
  packages,
}: {
  packages: CmsPackageListItem[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<{
    id: string;
    action: "status" | "delete";
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CmsPackageListItem | null>(
    null,
  );
  const [error, setError] = useState("");
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value
      ? packages.filter((item) =>
          `${item.title} ${item.style ?? ""} ${item.difficulty ?? ""} ${item.duration}`
            .toLowerCase()
            .includes(value),
        )
      : packages;
  }, [packages, query]);
  const published = packages.filter((item) => item.status).length;

  async function changeStatus(item: CmsPackageListItem) {
    setPending({ id: item.id, action: "status" });
    setError("");
    try {
      await updateCmsPackageStatusFn({
        data: { id: item.id, status: !item.status },
      });
      await router.invalidate();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Package status could not be changed.",
      );
    } finally {
      setPending(null);
    }
  }
  async function confirmDelete() {
    if (!deleteTarget) return;
    setPending({ id: deleteTarget.id, action: "delete" });
    setError("");
    try {
      await deleteCmsPackageFn({ data: { id: deleteTarget.id } });
      setDeleteTarget(null);
      await router.invalidate();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Package could not be deleted.",
      );
    } finally {
      setPending(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            Package CMS
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0c1724]">
            Packages
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage package content, pricing and publishing.
          </p>
        </div>
        <Link
          to="/admin/cms/packages/new"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0c1724] px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4 text-gold" />
          Create Package
        </Link>
      </div>
      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <Link
        to="/admin/cms/packages/listing-page"
        className="mt-7 block rounded-2xl border border-gold/25 bg-white p-6 shadow-sm transition hover:border-gold"
      >
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">
          Public page
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[#0c1724]">
          Edit packages listing page
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the hero and search presentation for /packages.
        </p>
      </Link>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Total Packages" value={packages.length} />
        <Stat label="Published" value={published} />
        <Stat label="Unpublished" value={packages.length - published} />
      </div>
      <label className="mt-6 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search packages…"
          className="w-full bg-transparent text-sm outline-none"
        />
      </label>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-black/10 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left">
          <thead className="border-b border-black/10 bg-[#f8f8f6] text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-4">Package</th>
              <th className="px-5 py-4">Package Type</th>
              <th className="px-5 py-4">Duration</th>
              <th className="px-5 py-4">Difficulty</th>
              <th className="px-5 py-4">From</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr
                key={item.id}
                className="border-b border-black/5 last:border-0"
              >
                <td className="px-5 py-4 font-semibold text-[#0c1724]">
                  {item.title}
                </td>
                <td className="px-5 py-4 text-sm">{item.style || "—"}</td>
                <td className="px-5 py-4 text-sm">{item.duration}</td>
                <td className="px-5 py-4 text-sm">{item.difficulty || "—"}</td>
                <td className="px-5 py-4 text-sm">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: item.currency,
                    maximumFractionDigits: 0,
                  }).format(item.startingPrice)}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status ? "bg-emerald-50 text-emerald-700" : "bg-black/5 text-muted-foreground"}`}
                  >
                    {item.status ? "Published" : "Unpublished"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      to="/admin/cms/packages/$id"
                      params={{ id: item.id }}
                      className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    {item.status ? (
                      <a
                        href={`/packages/${item.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </a>
                    ) : null}
                    <button
                      disabled={pending?.id === item.id}
                      onClick={() => void changeStatus(item)}
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700"
                    >
                      {pending?.id === item.id &&
                      pending.action === "status" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : item.status ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                      {item.status ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      disabled={pending?.id === item.id}
                      onClick={() => setDeleteTarget(item)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-14 text-center text-sm text-muted-foreground"
                >
                  No packages found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {deleteTarget ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={() => !pending && setDeleteTarget(null)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-3xl bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex gap-4 border-b p-6">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-red-50 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                  Permanent action
                </p>
                <h2 className="mt-1 text-xl font-semibold">Delete package?</h2>
              </div>
            </div>
            <div className="p-6 text-sm text-muted-foreground">
              <p>
                You are about to permanently delete{" "}
                <strong className="text-[#0c1724]">{deleteTarget.title}</strong>
                .
              </p>
              <div className="mt-5 rounded-2xl bg-red-50 p-4">
                <p className="font-bold uppercase text-red-700">
                  This will delete
                </p>
                <p className="mt-2 leading-6">
                  Package, highlights, itinerary, pricing records, inclusions,
                  exclusions, reviews, FAQs, and its directly uploaded hero
                  image.
                </p>
              </div>
              <div className="mt-4 rounded-2xl bg-[#f8f8f6] p-4">
                <p className="font-bold uppercase text-[#0c1724]">
                  Will not delete
                </p>
                <p className="mt-2 leading-6">
                  Destinations, Media Library assets, unrelated packages, leads
                  or bookings. A package with an existing booking must be
                  unpublished instead.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t bg-[#f8f8f6] p-5">
              <button
                disabled={Boolean(pending)}
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={Boolean(pending)}
                onClick={() => void confirmDelete()}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white"
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-[#0c1724]">{value}</p>
    </div>
  );
}
