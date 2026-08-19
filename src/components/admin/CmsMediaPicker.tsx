import {
    Check,
    Image as ImageIcon,
    Loader2,
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getCmsMediaClassificationOptionsFn,
    getCmsSelectableImagesFn,
} from "@/lib/cms-media.functions";

import {
    getCmsMediaAssociatedOptions,
    type CmsMediaClassificationOptions,
} from "@/lib/cms-media-classification";

export type CmsSelectableImage = {
    id:
        string;

    url:
        string;

    thumbnailUrl:
        string |
        null;

    title:
        string |
        null;

    altText:
        string |
        null;

    caption:
        string |
        null;

    originalFilename:
        string |
        null;

    category:
        string |
        null;

    categoryOptionId:
        string |
        null;

    associatedDestinationId:
        string |
        null;

    associatedPackageId:
        string |
        null;

    associatedExperienceId:
        string |
        null;

    generalSettingsTypeOptionId:
        string |
        null;

    width:
        number |
        null;

    height:
        number |
        null;
};

const emptyClassificationOptions:
    CmsMediaClassificationOptions = {
    categories:
        [],

    generalSettingsTypes:
        [],

    destinations:
        [],

    packages:
        [],

    experiences:
        [],
};

export function CmsMediaPicker({
                                   label,
                                   description,
                                   value,
                                   images,
                                   onChange,
                               }: {
    label:
        string;

    description?:
        string;

    value:
        string |
        null;

    images:
        CmsSelectableImage[];

    onChange: (
        id:
            string |
            null,
    ) => void;
}) {
    const [
        open,
        setOpen,
    ] =
        useState(
            false,
        );

    /*
    |--------------------------------------------------------------------------
    | Fresh picker data
    |--------------------------------------------------------------------------
    |
    | `images` remains the initial route-loader data so existing General /
    | Footer integrations continue working exactly as before.
    |
    | Every time the picker opens, however, we fetch fresh Media +
    | classification options.
    |
    */

    const [
        pickerImages,
        setPickerImages,
    ] =
        useState<
            CmsSelectableImage[]
        >(
            images,
        );

    const [
        classificationOptions,
        setClassificationOptions,
    ] =
        useState<
            CmsMediaClassificationOptions
        >(
            emptyClassificationOptions,
        );

    const [
        refreshing,
        setRefreshing,
    ] =
        useState(
            false,
        );

    const [
        refreshError,
        setRefreshError,
    ] =
        useState("");

    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

    const [
        search,
        setSearch,
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
     * If the parent route itself receives fresh
     * loader data, keep our initial local copy
     * synchronized too.
     */
    useEffect(
        () => {
            setPickerImages(
                images,
            );
        },
        [
            images,
        ],
    );

    /*
    |--------------------------------------------------------------------------
    | Selected image
    |--------------------------------------------------------------------------
    */

    const selected =
        pickerImages.find(
            (
                image,
            ) =>
                image.id ===
                value,
        ) ??
        images.find(
            (
                image,
            ) =>
                image.id ===
                value,
        ) ??
        null;

    /*
    |--------------------------------------------------------------------------
    | Refresh whenever picker opens
    |--------------------------------------------------------------------------
    */

    async function openPicker() {
        setOpen(
            true,
        );

        setRefreshing(
            true,
        );

        setRefreshError(
            "",
        );

        try {
            const [
                freshImages,
                freshClassificationOptions,
            ] =
                await Promise.all([
                    getCmsSelectableImagesFn(),

                    getCmsMediaClassificationOptionsFn(),
                ]);

            setPickerImages(
                freshImages,
            );

            setClassificationOptions(
                freshClassificationOptions,
            );

            /*
             * If an image was deleted from the Media
             * Library while this form was already open,
             * clear the stale local reference.
             *
             * Database FKs already use SET NULL, and
             * public fallback behavior remains intact.
             */
            if (
                value &&
                !freshImages.some(
                    (
                        image,
                    ) =>
                        image.id ===
                        value,
                )
            ) {
                onChange(
                    null,
                );
            }
        } catch (
            error
            ) {
            console.error(
                "Media Picker refresh failed",
                error,
            );

            setRefreshError(
                error instanceof
                Error
                    ? error.message
                    : "The latest Media Library could not be loaded.",
            );
        } finally {
            setRefreshing(
                false,
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Dependent filter
    |--------------------------------------------------------------------------
    */

    const filterAssociation =
        categoryFilter &&
        categoryFilter !==
        "__uncategorized__"
            ? getCmsMediaAssociatedOptions(
                classificationOptions,
                categoryFilter,
            )
            : null;

    /*
    |--------------------------------------------------------------------------
    | Live filtering
    |--------------------------------------------------------------------------
    */

    const filtered =
        useMemo(
            () => {
                const query =
                    search
                        .trim()
                        .toLowerCase();

                return pickerImages.filter(
                    (
                        image,
                    ) => {
                        const presentation =
                            getMediaPresentation(
                                image,
                                classificationOptions,
                            );

                        const matchesSearch =
                            !query ||
                            [
                                image.title,
                                image.altText,
                                image.caption,
                                image.originalFilename,
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
                                    query,
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
                            matchesSearch &&
                            matchesCategory &&
                            matchesAssociation
                        );
                    },
                );
            },
            [
                pickerImages,
                classificationOptions,
                search,
                categoryFilter,
                associatedFilter,
            ],
        );

    return (
        <>
            {/* Current selection */}
            <div className="rounded-xl border border-black/10 bg-white p-4">
                <div>
                    <p className="text-sm font-semibold text-[#0c1724]">
                        {label}
                    </p>

                    {description ? (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {description}
                        </p>
                    ) : null}
                </div>

                {selected ? (
                    <SelectedImage
                        image={
                            selected
                        }
                        classificationOptions={
                            classificationOptions
                        }
                        onChangeImage={
                            openPicker
                        }
                        onClear={() =>
                            onChange(
                                null,
                            )
                        }
                    />
                ) : (
                    <button
                        type="button"
                        onClick={
                            openPicker
                        }
                        className="mt-4 flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-black/15 bg-black/[0.015] px-5 py-8 text-center transition hover:bg-black/[0.03]"
                    >
                        <ImageIcon className="h-7 w-7 text-gold" />

                        <span className="mt-3 text-sm font-semibold text-[#0c1724]">
                            Choose from Media Library
                        </span>

                        <span className="mt-1 text-xs text-muted-foreground">
                            No image selected
                        </span>
                    </button>
                )}
            </div>

            {/* Picker dialog */}
            {open ? (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-5 border-b border-black/10 p-5">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">
                                    Media Library
                                </p>

                                <h2 className="mt-1 text-xl font-semibold text-[#0c1724]">
                                    Choose Image
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Search and filter ready image assets.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setOpen(
                                        false,
                                    )
                                }
                                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 transition hover:bg-black/5"
                                aria-label="Close media picker"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="border-b border-black/10 bg-[#faf9f6] p-5">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="h-4 w-4 text-gold" />

                                <p className="text-sm font-semibold text-[#0c1724]">
                                    Search & Filters
                                </p>

                                {refreshing ? (
                                    <span className="ml-auto inline-flex items-center gap-2 text-xs text-muted-foreground">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />

                                        Refreshing Media...
                                    </span>
                                ) : null}
                            </div>

                            {refreshError ? (
                                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {refreshError}
                                </div>
                            ) : null}

                            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px_240px]">
                                {/* Search */}
                                <label className="relative block">
                                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                    <input
                                        type="search"
                                        value={
                                            search
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setSearch(
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        placeholder="Search title, alt text, caption, destination, package..."
                                        className="h-11 w-full rounded-xl border border-black/10 bg-white pl-11 pr-4 text-sm text-[#0c1724] outline-none transition placeholder:text-muted-foreground focus:border-gold"
                                    />
                                </label>

                                {/* Category */}
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

                                        {classificationOptions.categories.map(
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

                                {/* Associated To */}
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

                                        {filterAssociation?.options.map(
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

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                <p className="text-xs text-muted-foreground">
                                    Showing{" "}
                                    <span className="font-semibold text-[#0c1724]">
                                        {
                                            filtered.length
                                        }
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-[#0c1724]">
                                        {
                                            pickerImages.length
                                        }
                                    </span>{" "}
                                    ready images.
                                </p>

                                {search ||
                                categoryFilter ||
                                associatedFilter ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch(
                                                "",
                                            );

                                            setCategoryFilter(
                                                "",
                                            );

                                            setAssociatedFilter(
                                                "",
                                            );
                                        }}
                                        className="text-xs font-semibold text-[#0c1724] underline underline-offset-4"
                                    >
                                        Clear filters
                                    </button>
                                ) : null}
                            </div>
                        </div>

                        {/* Images */}
                        <div className="min-h-0 flex-1 overflow-y-auto p-5">
                            {refreshing &&
                            pickerImages.length ===
                            0 ? (
                                <div className="flex min-h-64 flex-col items-center justify-center text-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-gold" />

                                    <p className="mt-4 text-sm font-semibold text-[#0c1724]">
                                        Loading Media Library...
                                    </p>
                                </div>
                            ) : filtered.length ===
                            0 ? (
                                <div className="rounded-xl border border-dashed border-black/15 px-5 py-14 text-center">
                                    <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />

                                    <p className="mt-3 text-sm font-semibold text-[#0c1724]">
                                        No matching images
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Change your search or filters, or upload an image in the Media Library.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {filtered.map(
                                        (
                                            image,
                                        ) => {
                                            const isSelected =
                                                image.id ===
                                                value;

                                            const presentation =
                                                getMediaPresentation(
                                                    image,
                                                    classificationOptions,
                                                );

                                            return (
                                                <button
                                                    type="button"
                                                    key={
                                                        image.id
                                                    }
                                                    onClick={() => {
                                                        onChange(
                                                            image.id,
                                                        );

                                                        setOpen(
                                                            false,
                                                        );
                                                    }}
                                                    className={
                                                        isSelected
                                                            ? "overflow-hidden rounded-xl border-2 border-gold bg-gold/5 text-left"
                                                            : "overflow-hidden rounded-xl border border-black/10 bg-white text-left transition hover:border-black/30 hover:shadow-sm"
                                                    }
                                                >
                                                    <div className="relative aspect-[4/3] bg-black/[0.03]">
                                                        <img
                                                            src={
                                                                image.thumbnailUrl ??
                                                                image.url
                                                            }
                                                            alt={
                                                                image.altText ??
                                                                image.title ??
                                                                ""
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />

                                                        {isSelected ? (
                                                            <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-white shadow">
                                                                <Check className="h-4 w-4" />
                                                            </span>
                                                        ) : null}
                                                    </div>

                                                    <div className="p-3">
                                                        <p className="truncate text-sm font-semibold text-[#0c1724]">
                                                            {image.title ||
                                                                image.originalFilename ||
                                                                "Untitled image"}
                                                        </p>

                                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                                            <span className="rounded-full bg-black/5 px-2 py-1 text-[0.65rem] font-semibold text-muted-foreground">
                                                                {
                                                                    presentation.categoryName
                                                                }
                                                            </span>

                                                            {presentation.associatedToName ? (
                                                                <span className="max-w-full truncate rounded-full bg-gold/10 px-2 py-1 text-[0.65rem] font-semibold text-[#0c1724]">
                                                                    {
                                                                        presentation.associatedToName
                                                                    }
                                                                </span>
                                                            ) : null}
                                                        </div>

                                                        {image.altText ? (
                                                            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                                                {
                                                                    image.altText
                                                                }
                                                            </p>
                                                        ) : null}

                                                        {image.width &&
                                                        image.height ? (
                                                            <p className="mt-2 text-[0.68rem] text-muted-foreground">
                                                                {
                                                                    image.width
                                                                }
                                                                ×
                                                                {
                                                                    image.height
                                                                }
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </button>
                                            );
                                        },
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 bg-black/[0.015] px-5 py-4">
                            <p className="text-xs text-muted-foreground">
                                {
                                    pickerImages.length
                                }{" "}
                                ready image
                                {pickerImages.length ===
                                1
                                    ? ""
                                    : "s"}{" "}
                                available
                            </p>

                            <a
                                href="/admin/cms/media"
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-[#0c1724] underline underline-offset-4"
                            >
                                Open Media Library
                            </a>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}

/*
|--------------------------------------------------------------------------
| Current selection
|--------------------------------------------------------------------------
*/

function SelectedImage({
                           image,
                           classificationOptions,
                           onChangeImage,
                           onClear,
                       }: {
    image:
        CmsSelectableImage;

    classificationOptions:
        CmsMediaClassificationOptions;

    onChangeImage:
        () => void;

    onClear:
        () => void;
}) {
    const presentation =
        getMediaPresentation(
            image,
            classificationOptions,
        );

    return (
        <div className="mt-4 overflow-hidden rounded-xl border border-black/10">
            <div className="aspect-[16/7] bg-black/[0.03]">
                <img
                    src={
                        image.thumbnailUrl ??
                        image.url
                    }
                    alt={
                        image.altText ??
                        image.title ??
                        ""
                    }
                    className="h-full w-full object-contain"
                />
            </div>

            <div className="p-4">
                <p className="truncate text-sm font-semibold text-[#0c1724]">
                    {image.title ||
                        image.originalFilename ||
                        "Untitled image"}
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs text-muted-foreground">
                        {
                            presentation.categoryName
                        }
                    </span>

                    {presentation.associatedToName ? (
                        <span className="rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium text-[#0c1724]">
                            {
                                presentation.associatedToName
                            }
                        </span>
                    ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={
                            onChangeImage
                        }
                        className="rounded-full bg-[#0c1724] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#16283b]"
                    >
                        Change image
                    </button>

                    <button
                        type="button"
                        onClick={
                            onClear
                        }
                        className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                    >
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Resolve presentation information
|--------------------------------------------------------------------------
|
| This mirrors Media Library filtering.
|
| New records use categoryOptionId.
|
| Older records can still fall back to the legacy `category` text until
| they are reclassified through Media Edit.
|
*/

function getMediaPresentation(
    image:
    CmsSelectableImage,

    options:
    CmsMediaClassificationOptions,
) {
    const category =
        resolveMediaCategory(
            image,
            options,
        );

    const destination =
        image.associatedDestinationId
            ? options.destinations.find(
                (
                    item,
                ) =>
                    item.id ===
                    image.associatedDestinationId,
            )
            : null;

    const packageItem =
        image.associatedPackageId
            ? options.packages.find(
                (
                    item,
                ) =>
                    item.id ===
                    image.associatedPackageId,
            )
            : null;

    const experience =
        image.associatedExperienceId
            ? options.experiences.find(
                (
                    item,
                ) =>
                    item.id ===
                    image.associatedExperienceId,
            )
            : null;

    const generalType =
        image.generalSettingsTypeOptionId
            ? options.generalSettingsTypes.find(
                (
                    item,
                ) =>
                    item.id ===
                    image.generalSettingsTypeOptionId,
            )
            : null;

    return {
        categoryOptionId:
            category?.id ??
            null,

        categoryName:
            category?.name ??
            image.category ??
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

/*
|--------------------------------------------------------------------------
| Legacy category compatibility
|--------------------------------------------------------------------------
*/

function resolveMediaCategory(
    image:
    CmsSelectableImage,

    options:
    CmsMediaClassificationOptions,
) {
    if (
        image.categoryOptionId
    ) {
        return (
            options.categories.find(
                (
                    category,
                ) =>
                    category.id ===
                    image.categoryOptionId,
            ) ??
            null
        );
    }

    const legacy =
        image.category
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
                category,
            ) =>
                category.value ===
                legacyValue ||
                category.value.replace(
                    /s$/,
                    "",
                ) ===
                legacyValue.replace(
                    /s$/,
                    "",
                ) ||
                category.name
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
        ) ??
        null
    );
}