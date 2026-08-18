import {
    createFileRoute,
    Link,
    redirect,
} from "@tanstack/react-router";

import {
    FileImage,
    Film,
    ImagePlus,
    Pencil,
} from "lucide-react";

import {
    AdminShell,
} from "@/components/admin/AdminShell";

import {
    getAdminSessionFn,
} from "@/lib/auth.functions";

import {
    getCmsMediaListFn,
} from "@/lib/cms-media.functions";

export const Route =
    createFileRoute(
        "/admin_/cms_/media",
    )({
        loader: async () => {
            const admin =
                await getAdminSessionFn();

            if (!admin) {
                throw redirect({
                    to: "/admin",

                    search: {
                        redirect:
                            "/admin/cms/media",
                    },
                });
            }

            const media =
                await getCmsMediaListFn();

            return {
                admin,
                media,
            };
        },

        component:
        MediaLibraryPage,
    });

function MediaLibraryPage() {
    const {
        media,
    } = Route.useLoaderData();

    const imageCount =
        media.filter(
            (item) =>
                item.type ===
                "image",
        ).length;

    const videoCount =
        media.filter(
            (item) =>
                item.type ===
                "video",
        ).length;

    return (
        <AdminShell>
            <div className="p-5 lg:p-8">
                <Link
                    to="/admin/cms"
                    className="text-sm font-semibold text-muted-foreground transition hover:text-[#0c1724]"
                >
                    ← Back to CMS
                </Link>

                <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                            Assets
                        </p>

                        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0c1724]">
                            Media Library
                        </h1>

                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                            Central library for reusable
                            Nepal Heaven images and
                            videos. Media uploaded here
                            will later power logos,
                            destinations, packages,
                            blog posts and galleries.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Stat
                            label="Images"
                            value={
                                imageCount
                            }
                        />

                        <Stat
                            label="Videos"
                            value={
                                videoCount
                            }
                        />
                    </div>
                </div>

                <div className="mt-8 rounded-2xl border border-gold/25 bg-gold/5 p-5">
                    <div className="flex gap-3">
                        <ImagePlus className="mt-0.5 h-5 w-5 shrink-0 text-gold" />

                        <div>
                            <p className="text-sm font-semibold text-[#0c1724]">
                                Upload foundation comes in I2
                            </p>

                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                This library is now reading
                                the canonical media table.
                                The next checkpoint adds
                                persistent public file
                                storage and real uploads
                                without relying on
                                build-time static assets.
                            </p>
                        </div>
                    </div>
                </div>

                {media.length ===
                0 ? (
                    <EmptyLibrary />
                ) : (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {media.map(
                            (item) => (
                                <MediaCard
                                    key={
                                        item.id
                                    }
                                    item={
                                        item
                                    }
                                />
                            ),
                        )}
                    </div>
                )}
            </div>
        </AdminShell>
    );
}

function MediaCard({
                       item,
                   }: {
    item:
        ReturnType<
            typeof Route.useLoaderData
        >["media"][number];
}) {
    const previewUrl =
        item.thumbnailUrl ??
        item.url;

    return (
        <section className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
            <div className="aspect-[4/3] overflow-hidden bg-black/[0.04]">
                {item.type ===
                "image" ? (
                    <img
                        src={
                            previewUrl
                        }
                        alt={
                            item.altText ??
                            item.title ??
                            ""
                        }
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <Film className="h-10 w-10 text-muted-foreground" />
                    </div>
                )}
            </div>

            <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="truncate font-semibold text-[#0c1724]">
                            {item.title ||
                                item.originalFilename ||
                                "Untitled media"}
                        </h2>

                        <p className="mt-1 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                            {item.type}
                            {" · "}
                            {
                                item.lifecycleStatus
                            }
                        </p>
                    </div>

                    {item.type ===
                    "image" ? (
                        <FileImage className="h-5 w-5 shrink-0 text-gold" />
                    ) : (
                        <Film className="h-5 w-5 shrink-0 text-gold" />
                    )}
                </div>

                {item.category ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                        Category:{" "}
                        {item.category}
                    </p>
                ) : null}

                <Link
                    to="/admin/cms/media/$id"
                    params={{
                        id:
                        item.id,
                    }}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0c1724] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#16283b]"
                >
                    <Pencil className="h-4 w-4" />
                    Edit metadata
                </Link>
            </div>
        </section>
    );
}

function EmptyLibrary() {
    return (
        <section className="mt-8 rounded-2xl border border-dashed border-black/15 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0c1724] text-gold">
                <FileImage className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-[#0c1724]">
                No media yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Your Media Library is ready
                to display canonical media
                records. Real file uploading
                will be activated in Phase
                4.0-I2.
            </p>
        </section>
    );
}

function Stat({
                  label,
                  value,
              }: {
    label: string;
    value: number;
}) {
    return (
        <div className="min-w-24 rounded-xl border border-black/10 bg-white px-4 py-3 text-right shadow-sm">
            <p className="text-xl font-semibold text-[#0c1724]">
                {value}
            </p>

            <p className="text-xs text-muted-foreground">
                {label}
            </p>
        </div>
    );
}