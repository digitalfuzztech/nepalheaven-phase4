import {
    createFileRoute,
    Link,
    redirect,
} from "@tanstack/react-router";

import {
    FileImage,
    Film,
    Pencil,
    Upload,
} from "lucide-react";

import {
    useState,
    type FormEvent,
} from "react";

import {
    AdminShell,
} from "@/components/admin/AdminShell";

import {
    getAdminSessionFn,
} from "@/lib/auth.functions";

import {
    getCmsMediaListFn,
    uploadCmsMediaFn,
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

    const [
        items,
        setItems,
    ] = useState(
        media,
    );

    const [file, setFile] =
        useState<File | null>(
            null,
        );

    const [
        fileInputKey,
        setFileInputKey,
    ] =
        useState(0);

    const [title, setTitle] =
        useState("");

    const [
        altText,
        setAltText,
    ] =
        useState("");

    const [
        category,
        setCategory,
    ] =
        useState("");

    const [
        caption,
        setCaption,
    ] =
        useState("");

    const [
        uploading,
        setUploading,
    ] =
        useState(false);

    const [
        uploadError,
        setUploadError,
    ] =
        useState("");

    const [
        uploadSuccess,
        setUploadSuccess,
    ] =
        useState("");

    const imageCount =
        items.filter(
            (item) =>
                item.type ===
                "image",
        ).length;

    const videoCount =
        items.filter(
            (item) =>
                item.type ===
                "video",
        ).length;

    async function uploadMedia(
        event:
        FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setUploadError("");
        setUploadSuccess("");

        if (!file) {
            setUploadError(
                "Select an image or video first.",
            );

            return;
        }

        const data =
            new FormData();

        data.set(
            "file",
            file,
        );

        data.set(
            "title",
            title,
        );

        data.set(
            "altText",
            altText,
        );

        data.set(
            "category",
            category,
        );

        data.set(
            "caption",
            caption,
        );

        setUploading(
            true,
        );

        try {
            const uploaded =
                await uploadCmsMediaFn(
                    {
                        data,
                    },
                );

            /*
             * Convert detail result into the
             * list-row shape.
             */
            setItems(
                (current) => [
                    {
                        id:
                        uploaded.id,

                        type:
                        uploaded.type,

                        url:
                        uploaded.url,

                        thumbnailUrl:
                        uploaded.thumbnailUrl,

                        altText:
                        uploaded.altText,

                        title:
                        uploaded.title,

                        caption:
                        uploaded.caption,

                        provider:
                        uploaded.provider,

                        originalFilename:
                        uploaded.originalFilename,

                        storageProvider:
                        uploaded.storageProvider,

                        mimeType:
                        uploaded.mimeType,

                        fileSizeBytes:
                        uploaded.fileSizeBytes,

                        width:
                        uploaded.width,

                        height:
                        uploaded.height,

                        durationSeconds:
                        uploaded.durationSeconds,

                        category:
                        uploaded.category,

                        lifecycleStatus:
                        uploaded.lifecycleStatus,

                        createdAt:
                        uploaded.createdAt,

                        updatedAt:
                        uploaded.updatedAt,
                    },

                    ...current,
                ],
            );

            setTitle("");
            setAltText("");
            setCategory("");
            setCaption("");
            setFile(null);

            setFileInputKey(
                (current) =>
                    current + 1,
            );

            setUploadSuccess(
                "Media uploaded successfully.",
            );
        } catch (
            uploadFailure
            ) {
            console.error(
                "Media upload failed",
                uploadFailure,
            );

            setUploadError(
                uploadFailure instanceof
                Error
                    ? uploadFailure.message
                    : "Media could not be uploaded.",
            );
        } finally {
            setUploading(
                false,
            );
        }
    }

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
                            Upload and manage reusable
                            Nepal Heaven images and
                            videos for website content,
                            logos, journeys, articles
                            and galleries.
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

                <form
                    onSubmit={
                        uploadMedia
                    }
                    className="mt-8 rounded-2xl border border-black/10 bg-white p-6 shadow-sm lg:p-7"
                >
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">
                            New Asset
                        </p>

                        <h2 className="mt-2 text-xl font-semibold text-[#0c1724]">
                            Upload Media
                        </h2>

                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            JPEG, PNG, WebP, GIF,
                            MP4 and WebM are
                            supported. Default limits
                            are 20 MB for images and
                            100 MB for videos.
                        </p>
                    </div>

                    {uploadError ? (
                        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {uploadError}
                        </div>
                    ) : null}

                    {uploadSuccess ? (
                        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            {uploadSuccess}
                        </div>
                    ) : null}

                    <div className="mt-6 grid gap-5 md:grid-cols-2">
                        <label className="grid gap-2 md:col-span-2">
              <span className="text-sm font-semibold text-[#0c1724]">
                File
              </span>

                            <input
                                key={
                                    fileInputKey
                                }
                                type="file"
                                required
                                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm"
                                onChange={(
                                    event,
                                ) =>
                                    setFile(
                                        event.target
                                            .files?.[0] ??
                                        null,
                                    )
                                }
                                className="rounded-xl border border-dashed border-black/15 bg-black/[0.015] px-4 py-5 text-sm text-[#0c1724]"
                            />

                            {file ? (
                                <span className="text-xs text-muted-foreground">
                  Selected:{" "}
                                    {
                                        file.name
                                    }{" "}
                                    (
                                    {formatBytes(
                                        file.size,
                                    )}
                                    )
                </span>
                            ) : null}
                        </label>

                        <UploadField
                            label="Title"
                            value={
                                title
                            }
                            placeholder="Everest Base Camp sunrise"
                            onChange={
                                setTitle
                            }
                        />

                        <UploadField
                            label="Category"
                            value={
                                category
                            }
                            placeholder="destinations"
                            onChange={
                                setCategory
                            }
                        />

                        <div className="md:col-span-2">
                            <UploadTextarea
                                label="Alt Text"
                                value={
                                    altText
                                }
                                rows={3}
                                placeholder="Describe the image for accessibility."
                                onChange={
                                    setAltText
                                }
                            />
                        </div>

                        <div className="md:col-span-2">
                            <UploadTextarea
                                label="Caption"
                                value={
                                    caption
                                }
                                rows={4}
                                placeholder="Optional editorial caption."
                                onChange={
                                    setCaption
                                }
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={
                                uploading
                            }
                            className="inline-flex items-center gap-2 rounded-full bg-[#0c1724] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#16283b] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Upload className="h-4 w-4" />

                            {uploading
                                ? "Uploading..."
                                : "Upload Media"}
                        </button>
                    </div>
                </form>

                {items.length ===
                0 ? (
                    <EmptyLibrary />
                ) : (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {items.map(
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

type MediaListItem =
    ReturnType<
        typeof Route.useLoaderData
    >["media"][number];

function MediaCard({
                       item,
                   }: {
    item:
        MediaListItem;
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
                    <div className="flex h-full flex-col items-center justify-center gap-3">
                        <Film className="h-10 w-10 text-muted-foreground" />

                        <video
                            src={
                                item.url
                            }
                            controls
                            preload="metadata"
                            className="max-h-full w-full"
                        />
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
                Upload the first Nepal
                Heaven image or video using
                the form above.
            </p>
        </section>
    );
}

function UploadField({
                         label,
                         value,
                         placeholder,
                         onChange,
                     }: {
    label: string;
    value: string;
    placeholder?: string;

    onChange: (
        value: string,
    ) => void;
}) {
    return (
        <label className="grid gap-2">
      <span className="text-sm font-semibold text-[#0c1724]">
        {label}
      </span>

            <input
                value={value}
                placeholder={
                    placeholder
                }
                onChange={(
                    event,
                ) =>
                    onChange(
                        event.target.value,
                    )
                }
                className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm text-[#0c1724] outline-none transition placeholder:text-muted-foreground focus:border-gold"
            />
        </label>
    );
}

function UploadTextarea({
                            label,
                            value,
                            rows,
                            placeholder,
                            onChange,
                        }: {
    label: string;
    value: string;
    rows: number;
    placeholder?: string;

    onChange: (
        value: string,
    ) => void;
}) {
    return (
        <label className="grid gap-2">
      <span className="text-sm font-semibold text-[#0c1724]">
        {label}
      </span>

            <textarea
                value={value}
                rows={rows}
                placeholder={
                    placeholder
                }
                onChange={(
                    event,
                ) =>
                    onChange(
                        event.target.value,
                    )
                }
                className="resize-y rounded-xl border border-black/10 bg-white px-4 py-3 text-sm leading-relaxed text-[#0c1724] outline-none transition placeholder:text-muted-foreground focus:border-gold"
            />
        </label>
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

function formatBytes(
    value: number,
) {
    if (
        value < 1024
    ) {
        return `${value} B`;
    }

    if (
        value <
        1024 * 1024
    ) {
        return `${(
            value /
            1024
        ).toFixed(1)} KB`;
    }

    return `${(
        value /
        (1024 * 1024)
    ).toFixed(1)} MB`;
}