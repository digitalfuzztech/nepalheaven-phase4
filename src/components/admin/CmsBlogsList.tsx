import { useMemo, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  ExternalLink,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import type { CmsBlogListItem } from "@/lib/cms-blog.server";
import {
  deleteCmsBlogFn,
  updateCmsBlogStatusFn,
} from "@/lib/cms-blog.functions";
export function CmsBlogsList({ posts }: { posts: CmsBlogListItem[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [target, setTarget] = useState<CmsBlogListItem | null>(null);
  const [error, setError] = useState("");
  const filtered = useMemo(
    () =>
      posts.filter((p) =>
        `${p.title} ${p.type} ${p.author}`
          .toLowerCase()
          .includes(q.toLowerCase()),
      ),
    [posts, q],
  );
  const published = posts.filter((p) => p.status === "published").length;
  async function status(p: CmsBlogListItem) {
    try {
      await updateCmsBlogStatusFn({
        data: {
          id: p.id,
          status: p.status === "published" ? "draft" : "published",
        },
      });
      await router.invalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not change status.");
    }
  }
  async function remove() {
    if (!target) return;
    try {
      await deleteCmsBlogFn({ data: { id: target.id } });
      setTarget(null);
      await router.invalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete Blog.");
    }
  }
  return (
    <div>
      <div className="flex justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase text-gold">Blog CMS</p>
          <h1 className="mt-2 text-4xl font-semibold">Blog</h1>
        </div>
        <Link
          to="/admin/cms/blog/new"
          className="rounded-full bg-[#0c1724] px-5 py-3 text-white"
        >
          <Plus className="mr-2 inline h-4 w-4" />
          Add Blog Post
        </Link>
      </div>
      {error ? (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
          {error}
        </p>
      ) : null}
      <Link
        to="/admin/cms/blog/listing-page"
        className="mt-7 block rounded-2xl border border-gold/25 bg-white p-6"
      >
        <p className="text-xs uppercase text-gold">Public page</p>
        <h2 className="mt-2 text-xl font-semibold">Edit Blog Listing Page</h2>
      </Link>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Total Posts", posts.length],
          ["Published", published],
          ["Unpublished", posts.length - published],
        ].map(([l, v]) => (
          <div key={l} className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-muted-foreground">{l}</p>
            <p className="mt-2 text-3xl">{v}</p>
          </div>
        ))}
      </div>
      <label className="mt-6 flex gap-2 rounded-xl border bg-white p-3">
        <Search className="h-4 w-4" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search Blog posts…"
          className="w-full outline-none"
        />
      </label>
      <div className="mt-5 overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b bg-[#f8f8f6]">
              <th className="p-4">Title</th>
              <th>Blog Type</th>
              <th>Author</th>
              <th>Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-4 font-semibold">{p.title}</td>
                <td>{p.type}</td>
                <td>{p.author}</td>
                <td>{p.status}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      to="/admin/cms/blog/$id"
                      params={{ id: p.id }}
                      className="rounded-lg border p-2"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    {p.status === "published" ? (
                      <a
                        href={`/blog/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border p-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : null}
                    <button
                      onClick={() => void status(p)}
                      className="rounded-lg border p-2"
                    >
                      {p.status === "published" ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setTarget(p)}
                      className="rounded-lg border border-red-200 p-2 text-red-600"
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
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/55 p-4">
          <div className="max-w-lg rounded-3xl bg-white p-7">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <h2 className="mt-4 text-2xl">Delete {target.title}?</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              This deletes the Blog, owned hero and content images, blocks and
              engagement records. Media Library content remains.
            </p>
            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={() => setTarget(null)}
                className="rounded-xl border px-5 py-3"
              >
                Cancel
              </button>
              <button
                onClick={() => void remove()}
                className="rounded-xl bg-red-600 px-5 py-3 text-white"
              >
                Delete Blog
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
