import {
    createFileRoute,
    Link,
    redirect,
    useNavigate,
    useRouter,
} from "@tanstack/react-router";

import {
    FileImage,
    Film,
    Save,
    Trash2,
} from "lucide-react";

import {
    useMemo,
    useState,
    type FormEvent,
    type ReactNode,
} from "react";

import {
    AdminShell,
} from "@/components/admin/AdminShell";

import {
    CmsMediaClassificationFields,
} from "@/components/admin/CmsMediaClassificationFields";

import {
    CmsMediaDeleteDialog,
} from "@/components/admin/CmsMediaDeleteDialog";

import {
    getAdminSessionFn,
} from "@/lib/auth.functions";

import {
    deleteCmsMediaFn,
    getCmsMediaClassificationOptionsFn,
    getCmsMediaFn,
    updateCmsMediaMetadataFn,
} from "@/lib/cms-media.functions";

import {
    cmsMediaMetadataUpdateSchema,
} from "@/lib/cms-media.schema";

import type {
    CmsMediaClassificationOptions,
} from "@/lib/cms-media-classification";

export const Route =
    createFileRoute(
        "/admin_/cms_/media_/$id",
    )({
        loader: async ({
                           params,
                       }) => {
            const admin =
                await getAdminSessionFn();

            if (
                !admin
            ) {
                throw redirect({
                    to:
                        "/admin",

                    search: {
                        redirect:
                            `/admin/cms/media/${params.id}`,
                    },
                });
            }

            const [
                media,
                classificationOptions,
            ] =
                await Promise.all([
                    getCmsMediaFn({
                        data: {
                            id:
                            params.id,
                        },
                    }),

                    getCmsMediaClassificationOptionsFn(),
                ]);

            return {
                admin,
                media,
                classificationOptions,
            };
        },

        component:
        MediaEditorPage,
    });

function MediaEditorPage() {
    const navigate =
        useNavigate();

    const router =
        useRouter();

    const {
        media,
        classificationOptions,
    } =
        Route.useLoaderData();

    const initialCategoryOptionId =
        useMemo(
            () =>
                resolveInitialCategoryOptionId(
                    media,
                    classificationOptions,
                ),
            [
                media,
                classificationOptions,
            ],
        );

    const [
        title,
        setTitle,
    ] =
        useState(
            media.title,
        );

    const [
        altText,
        setAltText,
    ] =
        useState(
            media.altText,
        );

    const [
        caption,
        setCaption,
    ] =
        useState(
            media.caption,
        );

    const [
        categoryOptionId,
        setCategoryOptionId,
    ] =
        useState(
            initialCategoryOptionId,
        );

    const [
        associatedToId,
        setAssociatedToId,
    ] =
        useState(
            getExistingAssociatedToId(
                media,
            ),
        );

    const [
        busy,
        setBusy,
    ] =
        useState(
            false,
        );

    const [
        error,
        setError,
    ] =
        useState("");

    const [
        success,
        setSuccess,
    ] =
        useState("");

    const [
        deleteOpen,
        setDeleteOpen,
    ] =
        useState(
            false,
        );

    const [
        deleting,
        setDeleting,
    ] =
        useState(
            false,
        );

    const [
        deleteError,
        setDeleteError,
    ] =
        useState("");

    async function save(
        event:
        FormEvent,
    ) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const parsed =
            cmsMediaMetadataUpdateSchema.safeParse(
                {
                    id:
                    media.id,

                    title,

                    altText,

                    caption,

                    categoryOptionId:
                        categoryOptionId ||
                        null,

                    associatedToId:
                        associatedToId ||
                        null,
                },
            );

        if (
            !parsed.success
        ) {
            setError(
                parsed.error
                    .issues[0]
                    ?.message ??
                "Check the media metadata and try again.",
            );

            return;
        }

        setBusy(
            true,
        );

        try {
            const updated =
                await updateCmsMediaMetadataFn({
                    data:
                    parsed.data,
                });

            setTitle(
                updated.title,
            );

            setAltText(
                updated.altText,
            );

            setCaption(
                updated.caption,
            );

            setCategoryOptionId(
                updated.categoryOptionId ??
                "",
            );

            setAssociatedToId(
                getExistingAssociatedToId(
                    updated,
                ),
            );

            /*
             * Refresh Media loader caches so returning
             * to the library immediately shows the
             * updated metadata.
             */
            await router.invalidate({
                sync:
                    true,
            });

            setSuccess(
                "Media metadata saved successfully.",
            );
        } catch (
            saveError
            ) {
            console.error(
                "Media metadata save failed",
                saveError,
            );

            setError(
                saveError instanceof
                Error
                    ? saveError.message
                    : "Media metadata could not be saved.",
            );
        } finally {
            setBusy(
                false,
            );
        }
    }

    async function confirmDelete() {
        if (
            deleting
        ) {
            return;
        }

        setDeleting(
            true,
        );

        setDeleteError("");

        try {
            await deleteCmsMediaFn({
                data: {
                    id:
                    media.id,
                },
            });

            /*
            |--------------------------------------------------------------------------
            | Clear cached routes before navigating back.
            |--------------------------------------------------------------------------
            |
            | We do NOT invalidate while still on the deleted Media detail route,
            | because that route's own loader would try to fetch the Media record
            | that has just been deleted.
            |
            | clearCache() removes the cached Media Library match while leaving the
            | currently displayed detail route alone until navigation occurs.
            |
            */

            router.clearCache();

            await navigate({
                to:
                    "/admin/cms/media",
            });
        } catch (
            failure
            ) {
            console.error(
                "Media deletion failed",
                failure,
            );

            setDeleteError(
                failure instanceof
                Error
                    ? failure.message
                    : "Media could not be deleted.",
            );
        } finally {
            setDeleting(
                false,
            );
        }
    }

    return (
        <AdminShell>
            <form
                onSubmit={
                    save
                }
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
                            {
                                media.id
                            }
                        </code>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setDeleteError(
                                    "",
                                );

                                setDeleteOpen(
                                    true,
                                );
                            }}
                            className="inline-flex w-fit items-center gap-2 rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />

                            Delete
                        </button>

                        <button
                            type="submit"
                            disabled={
                                busy
                            }
                            className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0c1724] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16283b] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save className="h-4 w-4" />

                            {busy
                                ? "Saving..."
                                : "Save Metadata"}
                        </button>
                    </div>
                </div>

                {error ? (
                    <Message
                        tone="error"
                        text={
                            error
                        }
                    />
                ) : null}

                {success ? (
                    <Message
                        tone="success"
                        text={
                            success
                        }
                    />
                ) : null}

                {media.category &&
                !media.categoryOptionId ? (
                    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        This is an older Media
                        record with legacy
                        category “
                        {media.category}”.
                        Select a Category
                        below and save once
                        to move it into the
                        new Other Settings-backed
                        classification.
                    </div>
                ) : null}

                <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="grid gap-6">
                        <EditorSection
                            title="Editorial Metadata"
                            description="Update title, category, association, alt text and caption."
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <CmsField
                                        label="Title"
                                        value={
                                            title
                                        }
                                        onChange={
                                            setTitle
                                        }
                                    />
                                </div>

                                <CmsMediaClassificationFields
                                    options={
                                        classificationOptions
                                    }
                                    categoryOptionId={
                                        categoryOptionId
                                    }
                                    associatedToId={
                                        associatedToId
                                    }
                                    onCategoryChange={
                                        setCategoryOptionId
                                    }
                                    onAssociatedToChange={
                                        setAssociatedToId
                                    }
                                />

                                <div className="md:col-span-2">
                                    <CmsTextarea
                                        label="Alt Text"
                                        value={
                                            altText
                                        }
                                        rows={
                                            3
                                        }
                                        onChange={
                                            setAltText
                                        }
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <CmsTextarea
                                        label="Caption"
                                        value={
                                            caption
                                        }
                                        rows={
                                            5
                                        }
                                        onChange={
                                            setCaption
                                        }
                                    />
                                </div>
                            </div>
                        </EditorSection>

                        <EditorSection
                            title="Storage Information"
                            description="Storage metadata is controlled by the upload system and is read-only."
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
                                            altText ||
                                            title
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
                                    {
                                        media.url
                                    }
                                </p>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                            <p className="font-semibold text-[#0c1724]">
                                Asset timestamps
                            </p>

                            <p className="mt-3 text-xs text-muted-foreground">
                                Uploaded
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

            <CmsMediaDeleteDialog
                open={
                    deleteOpen
                }
                itemName={
                    media.title ||
                    media.originalFilename ||
                    "this media item"
                }
                busy={
                    deleting
                }
                error={
                    deleteError
                }
                onNo={() => {
                    if (
                        !deleting
                    ) {
                        setDeleteOpen(
                            false,
                        );

                        setDeleteError(
                            "",
                        );
                    }
                }}
                onYes={
                    confirmDelete
                }
            />
        </AdminShell>
    );
}

function resolveInitialCategoryOptionId(
    media: {
        categoryOptionId:
            string | null;

        category:
            string;
    },

    options:
    CmsMediaClassificationOptions,
) {
    if (
        media.categoryOptionId
    ) {
        return media.categoryOptionId;
    }

    const legacy =
        media.category
            .trim()
            .toLowerCase();

    if (
        !legacy
    ) {
        return "";
    }

    const legacyValue =
        legacy
            .replace(
                /[^a-z0-9]+/g,
                "-",
            )
            .replace(
                /^-+|-+$/g,
                "",
            );

    return (
        options.categories.find(
            (
                option,
            ) =>
                option.value ===
                legacyValue ||
                option.value.replace(
                    /s$/,
                    "",
                ) ===
                legacyValue.replace(
                    /s$/,
                    "",
                ) ||
                option.name
                    .trim()
                    .toLowerCase()
                    .replace(
                        /s$/,
                        "",
                    ) ===
                legacy.replace(
                    /s$/,
                    "",
                ),
        )?.id ??
        ""
    );
}

function getExistingAssociatedToId(
    media: {
        associatedDestinationId:
            string | null;

        associatedPackageId:
            string | null;

        associatedExperienceId:
            string | null;

        generalSettingsTypeOptionId:
            string | null;
    },
) {
    return (
        media.associatedDestinationId ??
        media.associatedPackageId ??
        media.associatedExperienceId ??
        media.generalSettingsTypeOptionId ??
        ""
    );
}

function EditorSection({
                           title,
                           description,
                           children,
                       }: {
    title:
        string;

    description:
        string;

    children:
        ReactNode;
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
                  }: {
    label:
        string;

    value:
        string;

    onChange:
        (
            value:
            string,
        ) => void;
}) {
    return (
        <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#0c1724]">
                {label}
            </span>

            <input
                value={
                    value
                }
                onChange={(
                    event,
                ) =>
                    onChange(
                        event
                            .target
                            .value,
                    )
                }
                className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm text-[#0c1724] outline-none transition focus:border-gold"
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
    label:
        string;

    value:
        string;

    rows:
        number;

    onChange:
        (
            value:
            string,
        ) => void;
}) {
    return (
        <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#0c1724]">
                {label}
            </span>

            <textarea
                value={
                    value
                }
                rows={
                    rows
                }
                onChange={(
                    event,
                ) =>
                    onChange(
                        event
                            .target
                            .value,
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
    label:
        string;

    value:
        string;
}) {
    return (
        <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#0c1724]">
                {label}
            </span>

            <input
                value={
                    value
                }
                readOnly
                className="h-11 rounded-xl border border-black/10 bg-black/[0.03] px-4 text-sm text-muted-foreground"
            />
        </label>
    );
}

function Message({
                     tone,
                     text,
                 }: {
    tone:
        "success" |
        "error";

    text:
        string;
}) {
    return (
        <div
            className={[
                "mt-6 rounded-xl border px-4 py-3 text-sm",

                tone ===
                "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700",
            ].join(
                " ",
            )}
        >
            {text}
        </div>
    );
}

function formatBytes(
    value:
        number |
        null,
) {
    if (
        value ===
        null ||
        value ===
        undefined
    ) {
        return "";
    }

    if (
        value <
        1024
    ) {
        return `${value} B`;
    }

    if (
        value <
        1024 *
        1024
    ) {
        return `${(
            value /
            1024
        ).toFixed(
            1,
        )} KB`;
    }

    return `${(
        value /
        (
            1024 *
            1024
        )
    ).toFixed(
        1,
    )} MB`;
}

function formatDate(
    value:
    string,
) {
    const date =
        new Date(
            value,
        );

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return value;
    }

    return date.toLocaleString();
}