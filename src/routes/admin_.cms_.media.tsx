import {
    createFileRoute,
    Link,
    redirect,
    useRouter,
} from "@tanstack/react-router";

import {
    FileImage,
    Film,
    Pencil,
    Search,
    SlidersHorizontal,
    Trash2,
    Upload,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
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
    getCmsMediaListFn,
    uploadCmsMediaFn,
} from "@/lib/cms-media.functions";

import {
    getCmsMediaAssociatedOptions,
    type CmsMediaClassificationOptions,
} from "@/lib/cms-media-classification";

export const Route =
    createFileRoute(
        "/admin_/cms_/media",
    )({
        loader: async () => {
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
                            "/admin/cms/media",
                    },
                });
            }

            const [
                media,
                classificationOptions,
            ] =
                await Promise.all([
                    getCmsMediaListFn(),

                    getCmsMediaClassificationOptionsFn(),
                ]);

            return {
                admin,
                media,
                classificationOptions,
            };
        },

        component:
        MediaLibraryPage,
    });

function MediaLibraryPage() {
    const router =
        useRouter();

    const {
        media,
        classificationOptions,
    } =
        Route.useLoaderData();

    const [
        items,
        setItems,
    ] =
        useState(
            media,
        );

    /*
    |--------------------------------------------------------------------------
    | Keep local Media state synchronized with loader data
    |--------------------------------------------------------------------------
    |
    | Upload/delete updates local state immediately for responsive UI.
    |
    | router.invalidate() refreshes the authoritative loader data.
    |
    | When that loader data changes, synchronize it back into local state so
    | SPA navigation never resurrects stale Media records.
    |
    */

    useEffect(
        () => {
            setItems(
                media,
            );
        },
        [
            media,
        ],
    );

    const [
        file,
        setFile,
    ] =
        useState<File | null>(
            null,
        );

    const [
        fileInputKey,
        setFileInputKey,
    ] =
        useState(
            0,
        );

    const [
        title,
        setTitle,
    ] =
        useState("");

    const [
        altText,
        setAltText,
    ] =
        useState("");

    const [
        caption,
        setCaption,
    ] =
        useState("");

    const [
        categoryOptionId,
        setCategoryOptionId,
    ] =
        useState("");

    const [
        associatedToId,
        setAssociatedToId,
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

    const [
        libraryNotice,
        setLibraryNotice,
    ] =
        useState("");

    /*
     * Live library filters
     */

    const [
        query,
        setQuery,
    ] =
        useState("");

    const [
        categoryFilter,
        setCategoryFilter,
    ] =
        useState("");

    const [
        associatedFilter,
        setAssociatedFilter,
    ] =
        useState("");

    /*
     * Delete dialog
     */

    const [
        deleteTarget,
        setDeleteTarget,
    ] =
        useState<
            MediaListItem |
            null
        >(
            null,
        );

    const [
        deleting,
        setDeleting,
    ] =
        useState(false);

    const [
        deleteError,
        setDeleteError,
    ] =
        useState("");

    const imageCount =
        items.filter(
            (
                item,
            ) =>
                item.type ===
                "image",
        ).length;

    const videoCount =
        items.filter(
            (
                item,
            ) =>
                item.type ===
                "video",
        ).length;

    const filterAssociation =
        categoryFilter &&
        categoryFilter !==
        "__uncategorized__"
            ? getCmsMediaAssociatedOptions(
                classificationOptions,
                categoryFilter,
            )
            : null;

    const filteredItems =
        useMemo(
            () => {
                const normalizedQuery =
                    query
                        .trim()
                        .toLowerCase();

                return items.filter(
                    (
                        item,
                    ) => {
                        const presentation =
                            getMediaPresentation(
                                item,
                                classificationOptions,
                            );

                        const matchesText =
                            !normalizedQuery ||
                            [
                                item.title,
                                item.altText,
                                item.caption,
                                item.originalFilename,
                                presentation.categoryName,
                                presentation.associatedToName,
                            ]
                                .filter(
                                    Boolean,
                                )
                                .join(
                                    " ",
                                )
                                .toLowerCase()
                                .includes(
                                    normalizedQuery,
                                );

                        const matchesCategory =
                            !categoryFilter ||
                            (
                                categoryFilter ===
                                "__uncategorized__"
                                    ? !presentation.categoryOptionId
                                    : presentation.categoryOptionId ===
                                    categoryFilter
                            );

                        const matchesAssociation =
                            !associatedFilter ||
                            presentation.associatedToId ===
                            associatedFilter;

                        return (
                            matchesText &&
                            matchesCategory &&
                            matchesAssociation
                        );
                    },
                );
            },
            [
                items,
                classificationOptions,
                query,
                categoryFilter,
                associatedFilter,
            ],
        );

    async function uploadMedia(
        event:
        FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setUploadError("");
        setUploadSuccess("");
        setLibraryNotice("");

        if (
            !file
        ) {
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
            "caption",
            caption,
        );

        data.set(
            "categoryOptionId",
            categoryOptionId,
        );

        data.set(
            "associatedToId",
            associatedToId,
        );

        setUploading(
            true,
        );

        try {
            const uploaded =
                await uploadCmsMediaFn({
                    data,
                });

            /*
             * Update immediately so the user sees the new
             * Media item without waiting for a loader refresh.
             */
            setItems(
                (
                    current,
                ) => [
                    uploaded,
                    ...current,
                ],
            );

            setTitle("");
            setAltText("");
            setCaption("");
            setCategoryOptionId("");
            setAssociatedToId("");
            setFile(null);

            setFileInputKey(
                (
                    current,
                ) =>
                    current +
                    1,
            );

            /*
            |--------------------------------------------------------------------------
            | CRITICAL:
            | Refresh TanStack Router's loader cache.
            |--------------------------------------------------------------------------
            |
            | Without this, SPA navigation can reuse the old /admin/cms/media
            | loader result even though the database has already changed.
            |
            */

            await router.invalidate({
                sync:
                    true,
            });

            setUploadSuccess(
                "Media uploaded successfully.",
            );
        }catch (
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

    async function confirmDelete() {
        if (
            !deleteTarget ||
            deleting
        ) {
            return;
        }

        setDeleting(
            true,
        );

        setDeleteError("");
        setLibraryNotice("");

        try {
            const deletingId =
                deleteTarget.id;

            const result =
                await deleteCmsMediaFn({
                    data: {
                        id:
                        deletingId,
                    },
                });

            /*
             * Remove immediately from the current UI.
             */
            setItems(
                (
                    current,
                ) =>
                    current.filter(
                        (
                            item,
                        ) =>
                            item.id !==
                            deletingId,
                    ),
            );

            setDeleteTarget(
                null,
            );

            /*
            |--------------------------------------------------------------------------
            | CRITICAL:
            | Remove stale Media loader data from the router.
            |--------------------------------------------------------------------------
            */

            await router.invalidate({
                sync:
                    true,
            });

            setLibraryNotice(
                result.fileCleanupWarning ??
                "Media deleted successfully.",
            );
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
                            Upload, classify,
                            search and manage
                            reusable Nepal
                            Heaven images and
                            videos.
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

                {/* Upload */}
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
                            Category options
                            come from CMS →
                            Other Settings.
                            Associated To
                            changes automatically
                            from the selected
                            category.
                        </p>
                    </div>

                    {uploadError ? (
                        <Message
                            tone="error"
                            text={
                                uploadError
                            }
                        />
                    ) : null}

                    {uploadSuccess ? (
                        <Message
                            tone="success"
                            text={
                                uploadSuccess
                            }
                        />
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
                                        event
                                            .target
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
                            placeholder="Everest sunrise"
                            onChange={
                                setTitle
                            }
                        />

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
                            <UploadTextarea
                                label="Alt Text"
                                value={
                                    altText
                                }
                                rows={
                                    3
                                }
                                placeholder="Describe the media for accessibility."
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
                                rows={
                                    4
                                }
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

                {/* Search / filters */}
                <section className="mt-8 rounded-2xl border border-black/10 bg-white p-5 shadow-sm lg:p-6">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="h-5 w-5 text-gold" />

                        <h2 className="font-semibold text-[#0c1724]">
                            Search & Filters
                        </h2>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px_260px]">
                        <label className="relative block">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                type="search"
                                value={
                                    query
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setQuery(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="Search title, alt text, caption, destination, package..."
                                className="h-11 w-full rounded-xl border border-black/10 bg-[#faf9f6] pl-11 pr-4 text-sm text-[#0c1724] outline-none transition placeholder:text-muted-foreground focus:border-gold"
                            />
                        </label>

                        <label className="grid gap-1.5">
                            <span className="text-xs font-semibold text-[#0c1724]">
                                Category
                            </span>

                            <select
                                value={
                                    categoryFilter
                                }
                                onChange={(
                                    event,
                                ) => {
                                    setCategoryFilter(
                                        event
                                            .target
                                            .value,
                                    );

                                    setAssociatedFilter(
                                        "",
                                    );
                                }}
                                className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm text-[#0c1724] outline-none focus:border-gold"
                            >
                                <option value="">
                                    All Categories
                                </option>

                                <option value="__uncategorized__">
                                    Uncategorized
                                </option>

                                {classificationOptions
                                    .categories
                                    .map(
                                        (
                                            category,
                                        ) => (
                                            <option
                                                key={
                                                    category.id
                                                }
                                                value={
                                                    category.id
                                                }
                                            >
                                                {
                                                    category.name
                                                }
                                            </option>
                                        ),
                                    )}
                            </select>
                        </label>

                        <label className="grid gap-1.5">
                            <span className="text-xs font-semibold text-[#0c1724]">
                                Associated To
                            </span>

                            <select
                                value={
                                    associatedFilter
                                }
                                disabled={
                                    !filterAssociation ||
                                    filterAssociation.kind ===
                                    "none"
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setAssociatedFilter(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm text-[#0c1724] outline-none focus:border-gold disabled:cursor-not-allowed disabled:bg-black/[0.03] disabled:text-muted-foreground"
                            >
                                <option value="">
                                    {!filterAssociation ||
                                    filterAssociation.kind ===
                                    "none"
                                        ? "All / Not applicable"
                                        : `All ${filterAssociation.label}`}
                                </option>

                                {filterAssociation
                                    ?.options
                                    .map(
                                        (
                                            item,
                                        ) => (
                                            <option
                                                key={
                                                    item.id
                                                }
                                                value={
                                                    item.id
                                                }
                                            >
                                                {
                                                    item.name
                                                }
                                            </option>
                                        ),
                                    )}
                            </select>
                        </label>
                    </div>

                    <p className="mt-4 text-xs text-muted-foreground">
                        Showing{" "}
                        {
                            filteredItems.length
                        }{" "}
                        of{" "}
                        {
                            items.length
                        }{" "}
                        media items.
                        Results update live.
                    </p>
                </section>

                {libraryNotice ? (
                    <Message
                        tone="success"
                        text={
                            libraryNotice
                        }
                    />
                ) : null}

                {filteredItems.length ===
                0 ? (
                    <EmptyLibrary
                        filtered={
                            items.length >
                            0
                        }
                    />
                ) : (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredItems.map(
                            (
                                item,
                            ) => (
                                <MediaCard
                                    key={
                                        item.id
                                    }
                                    item={
                                        item
                                    }
                                    classificationOptions={
                                        classificationOptions
                                    }
                                    onDelete={() => {
                                        setDeleteError(
                                            "",
                                        );

                                        setDeleteTarget(
                                            item,
                                        );
                                    }}
                                />
                            ),
                        )}
                    </div>
                )}
            </div>

            <CmsMediaDeleteDialog
                open={
                    Boolean(
                        deleteTarget,
                    )
                }
                itemName={
                    deleteTarget
                        ?.title ||
                    deleteTarget
                        ?.originalFilename ||
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
                        setDeleteTarget(
                            null,
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

type MediaListItem =
    ReturnType<
        typeof Route.useLoaderData
    >["media"][number];

function MediaCard({
                       item,
                       classificationOptions,
                       onDelete,
                   }: {
    item:
        MediaListItem;

    classificationOptions:
        CmsMediaClassificationOptions;

    onDelete:
        () => void;
}) {
    const previewUrl =
        item.thumbnailUrl ??
        item.url;

    const presentation =
        getMediaPresentation(
            item,
            classificationOptions,
        );

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
                            {
                                item.type
                            }
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

                <dl className="mt-4 grid gap-2 text-xs">
                    <div className="flex gap-2">
                        <dt className="font-semibold text-[#0c1724]">
                            Category:
                        </dt>

                        <dd className="text-muted-foreground">
                            {
                                presentation.categoryName
                            }
                        </dd>
                    </div>

                    <div className="flex gap-2">
                        <dt className="font-semibold text-[#0c1724]">
                            Associated to:
                        </dt>

                        <dd className="text-muted-foreground">
                            {presentation.associatedToName ||
                                "None"}
                        </dd>
                    </div>

                    <div className="flex gap-2">
                        <dt className="font-semibold text-[#0c1724]">
                            Uploaded:
                        </dt>

                        <dd className="text-muted-foreground">
                            {formatDate(
                                item.createdAt,
                            )}
                        </dd>
                    </div>
                </dl>

                <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                        to="/admin/cms/media/$id"
                        params={{
                            id:
                            item.id,
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-[#0c1724] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#16283b]"
                    >
                        <Pencil className="h-4 w-4" />

                        Edit
                    </Link>

                    <button
                        type="button"
                        onClick={
                            onDelete
                        }
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />

                        Delete
                    </button>
                </div>
            </div>
        </section>
    );
}

function getMediaPresentation(
    item:
    MediaListItem,

    options:
    CmsMediaClassificationOptions,
) {
    const category =
        resolveMediaCategory(
            item,
            options,
        );

    const destination =
        item.associatedDestinationId
            ? options.destinations.find(
                (
                    entry,
                ) =>
                    entry.id ===
                    item.associatedDestinationId,
            )
            : null;

    const packageItem =
        item.associatedPackageId
            ? options.packages.find(
                (
                    entry,
                ) =>
                    entry.id ===
                    item.associatedPackageId,
            )
            : null;

    const experience =
        item.associatedExperienceId
            ? options.experiences.find(
                (
                    entry,
                ) =>
                    entry.id ===
                    item.associatedExperienceId,
            )
            : null;

    const generalType =
        item.generalSettingsTypeOptionId
            ? options.generalSettingsTypes.find(
                (
                    entry,
                ) =>
                    entry.id ===
                    item.generalSettingsTypeOptionId,
            )
            : null;

    return {
        categoryOptionId:
            category?.id ??
            null,

        categoryName:
            category?.name ??
            item.category ??
            "Uncategorized",

        associatedToId:
            destination?.id ??
            packageItem?.id ??
            experience?.id ??
            generalType?.id ??
            null,

        associatedToName:
            destination?.name ??
            packageItem?.name ??
            experience?.name ??
            generalType?.name ??
            null,
    };
}

function resolveMediaCategory(
    item:
    MediaListItem,

    options:
    CmsMediaClassificationOptions,
) {
    if (
        item.categoryOptionId
    ) {
        return (
            options.categories.find(
                (
                    entry,
                ) =>
                    entry.id ===
                    item.categoryOptionId,
            ) ?? null
        );
    }

    const legacy =
        item.category
            ?.trim()
            .toLowerCase();

    if (
        !legacy
    ) {
        return null;
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
                entry,
            ) =>
                entry.value ===
                legacyValue ||
                entry.value.replace(
                    /s$/,
                    "",
                ) ===
                legacyValue.replace(
                    /s$/,
                    "",
                ) ||
                entry.name
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
        ) ?? null
    );
}

function EmptyLibrary({
                          filtered,
                      }: {
    filtered:
        boolean;
}) {
    return (
        <section className="mt-8 rounded-2xl border border-dashed border-black/15 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0c1724] text-gold">
                <FileImage className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-[#0c1724]">
                {filtered
                    ? "No media matches these filters"
                    : "No media yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                {filtered
                    ? "Change the search text or filters to see more media."
                    : "Upload the first Nepal Heaven image or video using the form above."}
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
    label:
        string;

    value:
        string;

    placeholder?:
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
                placeholder={
                    placeholder
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
    label:
        string;

    value:
        string;

    rows:
        number;

    placeholder?:
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

            <textarea
                value={
                    value
                }
                rows={
                    rows
                }
                placeholder={
                    placeholder
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
                className="resize-y rounded-xl border border-black/10 bg-white px-4 py-3 text-sm leading-relaxed text-[#0c1724] outline-none transition placeholder:text-muted-foreground focus:border-gold"
            />
        </label>
    );
}

function Stat({
                  label,
                  value,
              }: {
    label:
        string;

    value:
        number;
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
                "mt-5 rounded-xl border px-4 py-3 text-sm",

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
    number,
) {
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

    return date.toLocaleDateString(
        undefined,
        {
            year:
                "numeric",

            month:
                "short",

            day:
                "numeric",
        },
    );
}