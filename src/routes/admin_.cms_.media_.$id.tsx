import {
    createFileRoute,
    Link,
    redirect,
} from "@tanstack/react-router";

import {
    Film,
    FileImage,
    Save,
} from "lucide-react";

import {
    useState,
    type FormEvent,
    type ReactNode,
} from "react";

import {
    AdminShell,
} from "@/components/admin/AdminShell";

import {
    getAdminSessionFn,
} from "@/lib/auth.functions";

import {
    getCmsMediaFn,
    updateCmsMediaMetadataFn,
} from "@/lib/cms-media.functions";

import {
    cmsMediaMetadataUpdateSchema,
    type CmsMediaMetadataUpdateInput,
} from "@/lib/cms-media.schema";

export const Route =
    createFileRoute(
        "/admin_/cms_/media_/$id",
    )({
        loader: async ({
                           params,
                       }) => {
            const admin =
                await getAdminSessionFn();

            if (!admin) {
                throw redirect({
                    to: "/admin",

                    search: {
                        redirect:
                            `/admin/cms/media/${params.id}`,
                    },
                });
            }

            const media =
                await getCmsMediaFn({
                    data: {
                        id:
                        params.id,
                    },
                });

            return {
                admin,
                media,
            };
        },

        component:
        MediaEditorPage,
    });

function MediaEditorPage() {
    const {
        media,
    } = Route.useLoaderData();

    const [form, setForm] =
        useState<CmsMediaMetadataUpdateInput>(
            {
                id:
                media.id,

                title:
                media.title,

                altText:
                media.altText,

                caption:
                media.caption,

                category:
                media.category,
            },
        );

    const [busy, setBusy] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    function updateField(
        field:
        Exclude<
            keyof CmsMediaMetadataUpdateInput,
            "id"
        >,

        value: string,
    ) {
        setForm(
            (current) => ({
                ...current,

                [field]:
                value,
            }),
        );
    }

    async function save(
        event: FormEvent,
    ) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const parsed =
            cmsMediaMetadataUpdateSchema.safeParse(
                form,
            );

        if (!parsed.success) {
            setError(
                parsed.error.issues[0]
                    ?.message ??
                "Check the media metadata and try again.",
            );

            return;
        }

        setBusy(true);

        try {
            const updated =
                await updateCmsMediaMetadataFn(
                    {
                        data:
                        parsed.data,
                    },
                );

            setForm({
                id:
                updated.id,

                title:
                updated.title,

                altText:
                updated.altText,

                caption:
                updated.caption,

                category:
                updated.category,
            });

            setSuccess(
                "Media metadata saved successfully.",
            );
        } catch (saveError) {
            console.error(
                "Media metadata save failed",
                saveError,
            );

            setError(
                saveError instanceof Error
                    ? saveError.message
                    : "Media metadata could not be saved.",
            );
        } finally {
            setBusy(false);
        }
    }

    return (
        <AdminShell>
            <form
                onSubmit={save}
                className="p-5 lg:p-8"
            >
                <Link
                    to="/admin/cms/media"
                    className="text-sm font-semibold text-muted-foreground transition hover:text-[#0c1724]"
                >
                    ← Back to Media Library
                </Link>

                <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                            Media Asset
                        </p>

                        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0c1724]">
                            {media.title ||
                                media.originalFilename ||
                                "Untitled media"}
                        </h1>

                        <code className="mt-2 block break-all text-xs text-muted-foreground">
                            {media.id}
                        </code>
                    </div>

                    <button
                        type="submit"
                        disabled={busy}
                        className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0c1724] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16283b] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />

                        {busy
                            ? "Saving..."
                            : "Save Metadata"}
                    </button>
                </div>

                {error ? (
                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                ) : null}

                {success ? (
                    <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {success}
                    </div>
                ) : null}

                <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="grid gap-6">
                        <EditorSection
                            title="Editorial Metadata"
                            description="This information describes the asset wherever it is reused."
                        >
                            <div className="grid gap-5">
                                <CmsField
                                    label="Title"
                                    value={
                                        form.title
                                    }
                                    onChange={(
                                        value,
                                    ) =>
                                        updateField(
                                            "title",
                                            value,
                                        )
                                    }
                                />

                                <CmsField
                                    label="Category"
                                    value={
                                        form.category
                                    }
                                    placeholder="e.g. destinations"
                                    onChange={(
                                        value,
                                    ) =>
                                        updateField(
                                            "category",
                                            value,
                                        )
                                    }
                                />

                                <CmsTextarea
                                    label="Alt Text"
                                    value={
                                        form.altText
                                    }
                                    rows={3}
                                    onChange={(
                                        value,
                                    ) =>
                                        updateField(
                                            "altText",
                                            value,
                                        )
                                    }
                                />

                                <CmsTextarea
                                    label="Caption"
                                    value={
                                        form.caption
                                    }
                                    rows={5}
                                    onChange={(
                                        value,
                                    ) =>
                                        updateField(
                                            "caption",
                                            value,
                                        )
                                    }
                                />
                            </div>
                        </EditorSection>

                        <EditorSection
                            title="Storage Information"
                            description="Storage metadata is controlled by the upload system and is intentionally read-only."
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                                <ReadOnlyField
                                    label="Media Type"
                                    value={
                                        media.type
                                    }
                                />

                                <ReadOnlyField
                                    label="Lifecycle"
                                    value={
                                        media.lifecycleStatus
                                    }
                                />

                                <ReadOnlyField
                                    label="Original Filename"
                                    value={
                                        media.originalFilename ??
                                        ""
                                    }
                                />

                                <ReadOnlyField
                                    label="MIME Type"
                                    value={
                                        media.mimeType ??
                                        ""
                                    }
                                />

                                <ReadOnlyField
                                    label="Storage Provider"
                                    value={
                                        media.storageProvider ??
                                        ""
                                    }
                                />

                                <ReadOnlyField
                                    label="Provider"
                                    value={
                                        media.provider ??
                                        ""
                                    }
                                />

                                <ReadOnlyField
                                    label="Width"
                                    value={
                                        media.width
                                            ? String(
                                                media.width,
                                            )
                                            : ""
                                    }
                                />

                                <ReadOnlyField
                                    label="Height"
                                    value={
                                        media.height
                                            ? String(
                                                media.height,
                                            )
                                            : ""
                                    }
                                />

                                <ReadOnlyField
                                    label="File Size"
                                    value={
                                        formatBytes(
                                            media.fileSizeBytes,
                                        )
                                    }
                                />

                                <ReadOnlyField
                                    label="Duration"
                                    value={
                                        media.durationSeconds
                                            ? `${media.durationSeconds}s`
                                            : ""
                                    }
                                />
                            </div>
                        </EditorSection>
                    </div>

                    <aside className="space-y-5">
                        <section className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
                            <div className="aspect-square bg-black/[0.04]">
                                {media.type ===
                                "image" ? (
                                    <img
                                        src={
                                            media.thumbnailUrl ??
                                            media.url
                                        }
                                        alt={
                                            form.altText ||
                                            form.title
                                        }
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <Film className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                )}
                            </div>

                            <div className="p-5">
                                <div className="flex items-center gap-2">
                                    {media.type ===
                                    "image" ? (
                                        <FileImage className="h-5 w-5 text-gold" />
                                    ) : (
                                        <Film className="h-5 w-5 text-gold" />
                                    )}

                                    <p className="font-semibold text-[#0c1724]">
                                        Preview
                                    </p>
                                </div>

                                <p className="mt-3 break-all text-xs leading-relaxed text-muted-foreground">
                                    {media.url}
                                </p>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                            <p className="font-semibold text-[#0c1724]">
                                Asset timestamps
                            </p>

                            <p className="mt-3 text-xs text-muted-foreground">
                                Created
                            </p>

                            <p className="mt-1 text-sm text-[#0c1724]">
                                {formatDate(
                                    media.createdAt,
                                )}
                            </p>

                            <p className="mt-4 text-xs text-muted-foreground">
                                Last updated
                            </p>

                            <p className="mt-1 text-sm text-[#0c1724]">
                                {formatDate(
                                    media.updatedAt,
                                )}
                            </p>
                        </section>
                    </aside>
                </div>
            </form>
        </AdminShell>
    );
}

function EditorSection({
                           title,
                           description,
                           children,
                       }: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="border-b border-black/10 pb-5">
                <h2 className="text-lg font-semibold text-[#0c1724]">
                    {title}
                </h2>

                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>

            <div className="pt-6">
                {children}
            </div>
        </section>
    );
}

function CmsField({
                      label,
                      value,
                      onChange,
                      placeholder,
                  }: {
    label: string;
    value: string;
    onChange: (
        value: string,
    ) => void;
    placeholder?: string;
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

function CmsTextarea({
                         label,
                         value,
                         rows,
                         onChange,
                     }: {
    label: string;
    value: string;
    rows: number;
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
                onChange={(
                    event,
                ) =>
                    onChange(
                        event.target.value,
                    )
                }
                className="resize-y rounded-xl border border-black/10 bg-white px-4 py-3 text-sm leading-relaxed text-[#0c1724] outline-none transition focus:border-gold"
            />
        </label>
    );
}

function ReadOnlyField({
                           label,
                           value,
                       }: {
    label: string;
    value: string;
}) {
    return (
        <label className="grid gap-2">
      <span className="text-sm font-semibold text-[#0c1724]">
        {label}
      </span>

            <input
                value={value}
                readOnly
                className="h-11 rounded-xl border border-black/10 bg-black/[0.03] px-4 text-sm text-muted-foreground"
            />
        </label>
    );
}

function formatBytes(
    value:
        | number
        | null,
) {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    if (value < 1024) {
        return `${value} B`;
    }

    if (
        value <
        1024 * 1024
    ) {
        return `${(
            value / 1024
        ).toFixed(1)} KB`;
    }

    return `${(
        value /
        (1024 * 1024)
    ).toFixed(1)} MB`;
}

function formatDate(
    value: string,
) {
    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return value;
    }

    return date.toLocaleString();
}