import {
    Check,
    Image as ImageIcon,
    Search,
    X,
} from "lucide-react";

import {
    useMemo,
    useState,
} from "react";

export type CmsSelectableImage = {
    id: string;

    url: string;

    thumbnailUrl:
        | string
        | null;

    title:
        | string
        | null;

    altText:
        | string
        | null;

    originalFilename:
        | string
        | null;

    category:
        | string
        | null;

    width:
        | number
        | null;

    height:
        | number
        | null;
};

export function CmsMediaPicker({
                                   label,
                                   description,
                                   value,
                                   images,
                                   onChange,
                               }: {
    label: string;

    description?: string;

    value:
        | string
        | null;

    images:
        CmsSelectableImage[];

    onChange: (
        id:
            | string
            | null,
    ) => void;
}) {
    const [open, setOpen] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const selected =
        images.find(
            (image) =>
                image.id ===
                value,
        ) ?? null;

    const filtered =
        useMemo(
            () => {
                const query =
                    search
                        .trim()
                        .toLowerCase();

                if (!query) {
                    return images;
                }

                return images.filter(
                    (image) => {
                        const haystack = [
                            image.title,
                            image.altText,
                            image.originalFilename,
                            image.category,
                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();

                        return haystack.includes(
                            query,
                        );
                    },
                );
            },
            [
                images,
                search,
            ],
        );

    return (
        <>
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
                    <div className="mt-4 overflow-hidden rounded-xl border border-black/10">
                        <div className="aspect-[16/7] bg-black/[0.03]">
                            <img
                                src={
                                    selected.thumbnailUrl ??
                                    selected.url
                                }
                                alt={
                                    selected.altText ??
                                    selected.title ??
                                    ""
                                }
                                className="h-full w-full object-contain"
                            />
                        </div>

                        <div className="p-4">
                            <p className="truncate text-sm font-semibold text-[#0c1724]">
                                {selected.title ||
                                    selected.originalFilename ||
                                    "Untitled image"}
                            </p>

                            {selected.category ? (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Category:{" "}
                                    {
                                        selected.category
                                    }
                                </p>
                            ) : null}

                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOpen(true)
                                    }
                                    className="rounded-full bg-[#0c1724] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#16283b]"
                                >
                                    Change image
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        onChange(
                                            null,
                                        )
                                    }
                                    className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() =>
                            setOpen(true)
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

            {open ? (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-start justify-between gap-5 border-b border-black/10 p-5">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">
                                    Media Library
                                </p>

                                <h2 className="mt-1 text-xl font-semibold text-[#0c1724]">
                                    Choose Image
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Only ready image assets can be selected.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setOpen(false)
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 transition hover:bg-black/5"
                                aria-label="Close media picker"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="border-b border-black/10 p-5">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                <input
                                    value={
                                        search
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setSearch(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Search title, filename, category or alt text..."
                                    className="h-11 w-full rounded-xl border border-black/10 bg-white pl-11 pr-4 text-sm outline-none focus:border-gold"
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto p-5">
                            {filtered.length ===
                            0 ? (
                                <div className="rounded-xl border border-dashed border-black/15 px-5 py-12 text-center">
                                    <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />

                                    <p className="mt-3 text-sm font-semibold text-[#0c1724]">
                                        No matching images
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Upload an image in the Media Library or change your search.
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
                                                            : "overflow-hidden rounded-xl border border-black/10 bg-white text-left transition hover:border-black/30"
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

                                                        {image.category ? (
                                                            <p className="mt-1 truncate text-xs text-muted-foreground">
                                                                {
                                                                    image.category
                                                                }
                                                            </p>
                                                        ) : null}

                                                        {image.width &&
                                                        image.height ? (
                                                            <p className="mt-1 text-[0.68rem] text-muted-foreground">
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

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 bg-black/[0.015] px-5 py-4">
                            <p className="text-xs text-muted-foreground">
                                {
                                    images.length
                                }{" "}
                                ready image
                                {images.length === 1
                                    ? ""
                                    : "s"}
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