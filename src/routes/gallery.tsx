import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
    Play,
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react";

import {
    getPublicGalleryItemsFn,
    getPublicSiteSettingsFn,
} from "@/lib/content.functions";

import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

const mediaFilters = [
    "All",
    "Photos",
    "Videos",
] as const;

const galleryMosaicPattern = [
    "tall",
    "normal",
    "wide",
    "normal",
    "normal",
    "tall",
    "normal",
    "wide",
    "normal",
    "normal",
] as const;



export const Route =
    createFileRoute("/gallery")({
        /*
         * These search params are used by Destination → See More.
         *
         * Example:
         *
         * /gallery?category=destination&associatedTo=everest-region
         */
        validateSearch: (
            search: Record<string, unknown>,
        ) => {
            const category =
                typeof search.category === "string" &&
                search.category.trim()
                    ? search.category
                        .trim()
                        .toLowerCase()
                        .slice(0, 191)
                    : undefined;

            const associatedTo =
                typeof search.associatedTo === "string" &&
                search.associatedTo.trim()
                    ? search.associatedTo
                        .trim()
                        .toLowerCase()
                        .slice(0, 191)
                    : undefined;

            return {
                category,
                associatedTo,
            };
        },

        /*
         * Always load the complete PUBLIC Gallery dataset.
         *
         * We DO NOT replace the gallery with one destination here.
         *
         * The URL simply initializes the Category + Associated To filters.
         */
        loader: async () => {
            const [
                settings,
                galleryItems,
            ] =
                await Promise.all([
                    getPublicSiteSettingsFn(),
                    getPublicGalleryItemsFn(),
                ]);

            return {
                ...settings,
                galleryItems,
            };
        },

        head: () => ({
            meta: [
                {
                    title:
                        "Nepal Photo Gallery — Mountains, Culture & Wildlife | Nepal Heaven",
                },
                {
                    name: "description",
                    content:
                        "A curated gallery of Nepal: Himalayan summits, Newari heritage, Terai wildlife, alpine lakes and festivals.",
                },
                {
                    property: "og:title",
                    content:
                        "Nepal Photo Gallery | Nepal Heaven",
                },
                {
                    property: "og:description",
                    content:
                        "Photographs from our guides across every region of Nepal.",
                },
                {
                    property: "og:url",
                    content: "/gallery",
                },
            ],

            links: [
                {
                    rel: "canonical",
                    href: "/gallery",
                },
            ],
        }),

        component: GalleryPage,
    });

function GalleryPage() {
    const {
        galleryItems,
        images,
    } =
        Route.useLoaderData();

    /*
     * Destination → See More values come from here.
     *
     * Example:
     *
     * category = destination
     * associatedTo = everest-region
     */
    const search =
        Route.useSearch();

    const [
        mediaFilter,
        setMediaFilter,
    ] =
        useState<
            (typeof mediaFilters)[number]
        >("All");

    const [
        subject,
        setSubject,
    ] =
        useState(
            "All Destination Types",
        );

    const [
        packageType,
        setPackageType,
    ] = useState("All Package Types");

    const [
        query,
        setQuery,
    ] =
        useState("");

    /*
     * IMPORTANT:
     *
     * These initialize directly from the URL.
     *
     * Therefore Destination → See More automatically selects:
     *
     * Category: Destination
     * Associated To: Everest Region
     */
    const [
        categoryFilter,
        setCategoryFilter,
    ] =
        useState(
            search.category ?? "",
        );

    const [
        associatedFilter,
        setAssociatedFilter,
    ] =
        useState(
            search.associatedTo ?? "",
        );

    const [
        lightbox,
        setLightbox,
    ] =
        useState<
            number | null
        >(null);


    /*

    |--------------------------------------------------------------------------
    | CMS Category options
    |--------------------------------------------------------------------------
    |
    | Built from actual Media Library records.
    |
    | General is explicitly ignored here as another safety layer.
    |
    */

    const categoryOptions =
        useMemo(
            () => {
                const options =
                    new Map<
                        string,
                        string
                    >();

                for (
                    const item
                    of galleryItems
                    ) {
                    if (
                        !item.cmsCategoryValue ||
                        !item.cmsCategory
                    ) {
                        continue;
                    }

                    if (
                        item.cmsCategoryValue ===
                        "general"
                    ) {
                        continue;
                    }

                    options.set(
                        item.cmsCategoryValue,
                        item.cmsCategory,
                    );
                }

                return Array.from(
                    options.entries(),
                )
                    .map(
                        ([
                             value,
                             label,
                         ]) => ({
                            value,
                            label,
                        }),
                    )
                    .sort(
                        (
                            a,
                            b,
                        ) =>
                            a.label.localeCompare(
                                b.label,
                            ),
                    );
            },
            [
                galleryItems,
            ],
        );

    /*
    |--------------------------------------------------------------------------
    | Associated To options
    |--------------------------------------------------------------------------
    |
    | Category = Destination
    |
    | → Everest Region
    | → Annapurna
    | → Mustang
    |
    | Category = Package
    |
    | → Package names
    |
    | etc.
    |
    */

    const associatedOptions =
        useMemo(
            () => {
                if (
                    !categoryFilter
                ) {
                    return [];
                }

                const options =
                    new Map<
                        string,
                        string
                    >();

                for (
                    const item
                    of galleryItems
                    ) {
                    if (
                        item.cmsCategoryValue !==
                        categoryFilter
                    ) {
                        continue;
                    }

                    if (
                        !item.associatedToSlug ||
                        !item.associatedToName
                    ) {
                        continue;
                    }

                    options.set(
                        item.associatedToSlug,
                        item.associatedToName,
                    );
                }

                return Array.from(
                    options.entries(),
                )
                    .map(
                        ([
                             value,
                             label,
                         ]) => ({
                            value,
                            label,
                        }),
                    )
                    .sort(
                        (
                            a,
                            b,
                        ) =>
                            a.label.localeCompare(
                                b.label,
                            ),
                    );
            },
            [
                galleryItems,
                categoryFilter,
            ],
        );

    const destinationTypes =
        useMemo(
            () => {
                const types =
                    new Set<string>();

                for (
                    const item
                    of galleryItems
                    ) {
                    /*
                     * Only Media Library items associated
                     * with real destinations contribute
                     * Destination Type options.
                     */
                    if (
                        item.associatedToKind !==
                        "destination"
                    ) {
                        continue;
                    }

                    if (
                        !item.category ||
                        item.category ===
                        "Uncategorised"
                    ) {
                        continue;
                    }

                    types.add(
                        item.category,
                    );
                }

                return [
                    "All Destination Types",

                    ...Array.from(
                        types,
                    ).sort(
                        (
                            a,
                            b,
                        ) =>
                            a.localeCompare(
                                b,
                            ),
                    ),
                ];
            },
            [
                galleryItems,
            ],
        );

    const packageTypes =
        useMemo(
            () => {
                const options = new Map<string, string>();
                for (const item of galleryItems) {
                    if (item.associatedToKind !== "package" || !item.packageType) {
                        continue;
                    }
                    options.set(packageTypeKey(item), item.packageType);
                }
                return Array.from(options, ([value, label]) => ({ value, label }))
                    .sort((a, b) => a.label.localeCompare(b.label));
            },
            [galleryItems],
        );
    /*
    |--------------------------------------------------------------------------
    | Actual Gallery filtering
    |--------------------------------------------------------------------------
    */

    const items =
        useMemo(
            () => {
                const normalizedQuery =
                    query
                        .trim()
                        .toLowerCase();

                return galleryItems.filter(
                    (
                        item,
                    ) => {
                        /*
                         * Extra safety.
                         *
                         * General should already have been removed server-side.
                         */
                        if (
                            item.cmsCategoryValue ===
                            "general"
                        ) {
                            return false;
                        }

                        /*
                         * All / Photos / Videos
                         */
                        const matchesMediaType =
                            mediaFilter ===
                            "All" ||
                            (
                                mediaFilter ===
                                "Photos" &&
                                item.type ===
                                "image"
                            ) ||
                            (
                                mediaFilter ===
                                "Videos" &&
                                item.type ===
                                "video"
                            );

                        if (
                            !matchesMediaType
                        ) {
                            return false;
                        }

                        /*
                         * Existing Subject filter.
                         */
                        /*
  * Destination Type
  */
                        if (
                            subject !==
                            "All Destination Types"
                        ) {
                            if (
                                item.associatedToKind !==
                                "destination" ||
                                item.category !==
                                subject
                            ) {
                                return false;
                            }
                        }

                        if (
                            packageType !== "All Package Types" &&
                            (item.associatedToKind !== "package" ||
                              packageTypeKey(item) !== packageType)
                        ) {
                            return false;
                        }

                        /*
                         * CMS Category.
                         */
                        if (
                            categoryFilter &&
                            item.cmsCategoryValue !==
                            categoryFilter
                        ) {
                            return false;
                        }

                        /*
                         * CMS Associated To.
                         */
                        if (
                            associatedFilter &&
                            item.associatedToSlug !==
                            associatedFilter
                        ) {
                            return false;
                        }

                        /*
                         * Search.
                         */
                        if (
                            normalizedQuery
                        ) {
                            const searchableText =
                                [
                                    item.title,
                                    item.alt,
                                    item.caption,
                                    item.category,
                                    item.cmsCategory,
                                    item.associatedToName,
                                ]
                                    .filter(Boolean)
                                    .join(" ")
                                    .toLowerCase();

                            if (
                                !searchableText.includes(
                                    normalizedQuery,
                                )
                            ) {
                                return false;
                            }
                        }

                        return true;
                    },
                );
            },
            [
                galleryItems,
                mediaFilter,
                subject,
                packageType,
                query,
                categoryFilter,
                associatedFilter,
            ],
        );

    const active =
        lightbox !== null
            ? items[
                lightbox
                ]
            : undefined;

    /*
     * Escape closes Gallery lightbox.
     */
    useEffect(
        () => {
            if (
                !active
            ) {
                return;
            }

            const close = (
                event:
                KeyboardEvent,
            ) => {
                if (
                    event.key ===
                    "Escape"
                ) {
                    setLightbox(
                        null,
                    );
                }
            };

            window.addEventListener(
                "keydown",
                close,
            );

            return () =>
                window.removeEventListener(
                    "keydown",
                    close,
                );
        },
        [
            active,
        ],
    );

    return (
        <>
            <PageHero
                compact
                image={
                    images.destRara
                }
                eyebrow="Gallery"
                title="Nepal, as our guides see it"
                description="Every photograph below was taken on one of our departures — no stock, no filters."
                crumbs={[
                    {
                        label: "Home",
                        to: "/",
                    },
                    {
                        label: "Gallery",
                    },
                ]}
            />

            <section className="container-lux py-20 lg:py-24">
                {/* All / Photos / Videos */}
                <ul
                    aria-label="Media type"
                    className="flex flex-wrap justify-center gap-2"
                >
                    {mediaFilters.map(
                        (
                            filter,
                        ) => (
                            <li
                                key={
                                    filter
                                }
                            >
                                <button
                                    type="button"
                                    aria-pressed={
                                        mediaFilter ===
                                        filter
                                    }
                                    onClick={() => {
                                        setMediaFilter(
                                            filter,
                                        );

                                        setLightbox(
                                            null,
                                        );
                                    }}
                                    className={cn(
                                        "rounded-full border px-5 py-2.5 text-xs font-semibold transition-colors",

                                        mediaFilter ===
                                        filter
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border text-muted-foreground hover:border-gold hover:text-gold",
                                    )}
                                >
                                    {
                                        filter
                                    }
                                </button>
                            </li>
                        ),
                    )}
                </ul>

                {/* Search / Category / Associated To */}
                <div className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-sm lg:p-6">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal
                            className="h-5 w-5 text-gold"
                            aria-hidden
                        />

                        <h2 className="font-semibold text-foreground">
                            Search & Filters
                        </h2>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px_280px]">
                        {/* Search */}
                        <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-foreground">
                Search
              </span>

                            <div className="relative">
                                <Search
                                    className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                                    aria-hidden
                                />

                                <input
                                    type="search"
                                    value={
                                        query
                                    }
                                    onChange={(
                                        event,
                                    ) => {
                                        setQuery(
                                            event
                                                .target
                                                .value,
                                        );

                                        setLightbox(
                                            null,
                                        );
                                    }}
                                    placeholder="Search gallery..."
                                    className="h-11 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-gold"
                                />
                            </div>
                        </label>

                        {/* Category */}
                        <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-foreground">
                Category
              </span>

                            <select
                                value={
                                    categoryFilter
                                }
                                onChange={(
                                    event,
                                ) => {
                                    const nextCategory =
                                        event.target.value;

                                    setCategoryFilter(
                                        nextCategory,
                                    );

                                    setAssociatedFilter(
                                        "",
                                    );

                                    /*
                                     * Destination Type only applies to
                                     * Destination media.
                                     */
                                    if (
                                        nextCategory !== "destination"
                                    ) {
                                        setSubject(
                                            "All Destination Types",
                                        );
                                    }

                                    if (nextCategory !== "package") {
                                        setPackageType("All Package Types");
                                    }

                                    setLightbox(
                                        null,
                                    );
                                }}
                                className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-gold"
                            >
                                <option value="">
                                    All Categories
                                </option>

                                {categoryOptions.map(
                                    (
                                        option,
                                    ) => (
                                        <option
                                            key={
                                                option.value
                                            }
                                            value={
                                                option.value
                                            }
                                        >
                                            {
                                                option.label
                                            }
                                        </option>
                                    ),
                                )}
                            </select>
                        </label>

                        {/* Associated To */}
                        <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-foreground">
                Associated To
              </span>

                            <select
                                value={
                                    associatedFilter
                                }
                                disabled={
                                    !categoryFilter ||
                                    associatedOptions.length ===
                                    0
                                }
                                onChange={(
                                    event,
                                ) => {
                                    setAssociatedFilter(
                                        event
                                            .target
                                            .value,
                                    );

                                    setLightbox(
                                        null,
                                    );
                                }}
                                className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-gold disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">
                                    {!categoryFilter
                                        ? "Choose category first"
                                        : associatedOptions.length >
                                        0
                                            ? "All"
                                            : "Not applicable"}
                                </option>

                                {associatedOptions.map(
                                    (
                                        option,
                                    ) => (
                                        <option
                                            key={
                                                option.value
                                            }
                                            value={
                                                option.value
                                            }
                                        >
                                            {
                                                option.label
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
                            <span className="font-semibold text-foreground">
                {
                    items.length
                }
              </span>{" "}
                            of{" "}
                            <span className="font-semibold text-foreground">
                {
                    galleryItems.length
                }
              </span>{" "}
                            items
                        </p>

                        {query ||
                        categoryFilter ||
                        associatedFilter ||
                        mediaFilter !==
                        "All" ||
                        subject !==
                        "All Destination Types" ||
                        packageType !== "All Package Types" ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setQuery(
                                        "",
                                    );

                                    setCategoryFilter(
                                        "",
                                    );

                                    setAssociatedFilter(
                                        "",
                                    );

                                    setMediaFilter(
                                        "All",
                                    );

                                    setSubject(
                                        "All Destination Types",
                                    );

                                    setPackageType("All Package Types");

                                    setLightbox(
                                        null,
                                    );
                                }}
                                className="text-xs font-semibold text-gold transition-colors hover:text-foreground"
                            >
                                Clear filters
                            </button>
                        ) : null}
                    </div>
                </div>

                {/* Destination Type filter */}
                {categoryFilter ===
                "destination" ? (
                    <div
                        className="mt-6 flex flex-wrap items-center justify-center gap-2"
                        aria-label="Destination type"
                    >
    <span className="mr-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
      Destination Type
    </span>

                        {destinationTypes.map(
                            (
                                type,
                            ) => (
                                <button
                                    key={
                                        type
                                    }
                                    type="button"
                                    aria-pressed={
                                        subject ===
                                        type
                                    }
                                    onClick={() => {
                                        setSubject(
                                            type,
                                        );

                                        setLightbox(
                                            null,
                                        );
                                    }}
                                    className={cn(
                                        "rounded-full px-3 py-1.5 text-xs font-semibold",

                                        subject ===
                                        type
                                            ? "bg-accent text-accent-foreground"
                                            : "text-muted-foreground hover:text-gold",
                                    )}
                                >
                                    {
                                        type
                                    }
                                </button>
                            ),
                        )}
                    </div>
                ) : null}

                {categoryFilter === "package" ? (
                    <div
                        className="mt-6 flex flex-wrap items-center justify-center gap-2"
                        aria-label="Package type"
                    >
                        <span className="mr-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                            Package Type
                        </span>
                        <button
                            type="button"
                            aria-pressed={packageType === "All Package Types"}
                            onClick={() => {
                                setPackageType("All Package Types");
                                setLightbox(null);
                            }}
                            className={cn(
                                "rounded-full px-3 py-1.5 text-xs font-semibold",
                                packageType === "All Package Types"
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted-foreground hover:text-gold",
                            )}
                        >
                            All Package Types
                        </button>
                        {packageTypes.map((type) => (
                            <button
                                key={type.value}
                                type="button"
                                aria-pressed={packageType === type.value}
                                onClick={() => {
                                    setPackageType(type.value);
                                    setLightbox(null);
                                }}
                                className={cn(
                                    "rounded-full px-3 py-1.5 text-xs font-semibold",
                                    packageType === type.value
                                        ? "bg-accent text-accent-foreground"
                                        : "text-muted-foreground hover:text-gold",
                                )}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                ) : null}

                {/* Gallery items */}
                {items.length >
                0 ? (
                    <ul className="mt-12 grid auto-rows-[13rem] grid-flow-dense grid-cols-2 gap-4 lg:grid-cols-4">
                        {items.map(
                            (
                                item,
                                index,
                            ) => {
                                const mediaKey =
                                    item.image ??
                                    item.videoUrl ??
                                    item.thumbnail ??
                                    `${item.title}-${index}`;

                                /*
                                 * IMPORTANT:
                                 *
                                 * Mosaic layout is based on the CURRENT FILTERED
                                 * Gallery results, not the original database index.
                                 *
                                 * Therefore:
                                 *
                                 * Destination → Everest Region
                                 *
                                 * still gets its own complete varied mosaic.
                                 */
                                const displaySpan =
                                    galleryMosaicPattern[
                                    index %
                                    galleryMosaicPattern.length
                                        ];

                                return (
                                    <Reveal
                                        key={mediaKey}
                                        as="li"
                                        delay={index * 45}
                                        className={cn(
                                            displaySpan === "tall" &&
                                            "row-span-2",

                                            displaySpan === "wide" &&
                                            "col-span-2",
                                        )}
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setLightbox(
                                                    index,
                                                )
                                            }
                                            className="zoom-media group relative block h-full w-full overflow-hidden rounded-3xl text-left"
                                        >
                                            <img
                                                src={
                                                    item.type ===
                                                    "video"
                                                        ? item.thumbnail
                                                        : item.image
                                                }
                                                alt={
                                                    item.alt ??
                                                    item.title
                                                }
                                                loading="lazy"

                                                /*
                                                 * Detect the REAL aspect ratio.
                                                 */
                                                className="h-full w-full object-cover"
                                            />

                                            {item.type ===
                                            "video" ? (
                                                <span className="absolute inset-0 z-10 grid place-items-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-gold text-gold-foreground">
                <Play className="ml-1 h-6 w-6 fill-current" />
              </span>
            </span>
                                            ) : null}

                                            <span className="bg-veil absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-95" />

                                            <span className="absolute inset-x-0 bottom-0 p-5">
            <span className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold">
              {item.category !==
              "Uncategorised"
                  ? item.category
                  : item.cmsCategory ??
                  item.category}
            </span>

            <span className="mt-1 block font-[family-name:var(--font-display)] text-lg text-primary-foreground">
              {
                  item.title
              }
            </span>
          </span>
                                        </button>
                                    </Reveal>
                                );
                            },
                        )}
                    </ul>
                ) : (
                    <div className="mt-12 rounded-3xl border border-border bg-card p-12 text-center">
                        <Search className="mx-auto h-9 w-9 text-gold" />

                        <h2 className="mt-4 text-2xl">
                            Nothing found
                        </h2>

                        <p className="mt-3 text-sm text-muted-foreground">
                            Try changing the search or filters.
                        </p>
                    </div>
                )}
            </section>

            {/* Public Gallery preview */}
            {active ? (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={
                        active.title
                    }
                    className="fixed inset-0 z-[80] grid place-items-center bg-primary/85 p-6 backdrop-blur-md"
                    onClick={() =>
                        setLightbox(
                            null,
                        )
                    }
                >
                    <button
                        type="button"
                        onClick={() =>
                            setLightbox(
                                null,
                            )
                        }
                        className="absolute right-6 top-6 grid h-11 w-11 place-items-center rounded-full border border-primary-foreground/25 text-primary-foreground transition-colors hover:border-gold hover:text-gold"
                    >
            <span className="sr-only">
              Close
            </span>

                        <X
                            className="h-5 w-5"
                            aria-hidden
                        />
                    </button>

                    <figure
                        className="max-h-[85vh] w-full max-w-4xl"
                        onClick={(
                            event,
                        ) =>
                            event.stopPropagation()
                        }
                    >
                        {active.type ===
                        "video" &&
                        active.videoUrl ? (
                            <VideoPlayer
                                item={
                                    active
                                }
                            />
                        ) : (
                            <div className="relative overflow-hidden rounded-3xl">
                                <img
                                    src={
                                        active.image
                                    }
                                    alt={
                                        active.alt ??
                                        active.title
                                    }
                                    className="max-h-[80vh] w-full object-contain"
                                />

                                {(active.title ||
                                    active.caption) ? (
                                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-5 pb-5 pt-20">
                                        <p className="text-sm font-semibold text-white">
                                            {
                                                active.title
                                            }
                                        </p>

                                        {active.caption ? (
                                            <p className="mt-1 text-xs leading-relaxed text-white/75">
                                                {
                                                    active.caption
                                                }
                                            </p>
                                        ) : null}
                                    </figcaption>
                                ) : null}
                            </div>
                        )}
                    </figure>
                </div>
            ) : null}
        </>
    );
}

function packageTypeKey(item: {
    packageType?: string;
    packageTypeOptionId?: string;
}) {
    if (item.packageTypeOptionId) return item.packageTypeOptionId;
    return `legacy:${(item.packageType ?? "").trim().toLowerCase()}`;
}

function VideoPlayer({
                         item,
                     }: {
    item:
        (typeof Route.types.loaderData)["galleryItems"][number];
}) {
    const provider =
        item.provider?.toLowerCase();

    const embedUrl =
        safeEmbedUrl(
            provider,
            item.videoUrl,
        );

    if (
        embedUrl
    ) {
        return (
            <iframe
                src={
                    embedUrl
                }
                title={
                    item.title
                }
                allow="fullscreen; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="aspect-video w-full rounded-3xl bg-black"
            />
        );
    }

    return (
        <video
            src={
                item.videoUrl
            }
            poster={
                item.thumbnail
            }
            controls
            preload="metadata"
            playsInline
            className="max-h-[75vh] w-full rounded-3xl bg-black"
        />
    );
}

function safeEmbedUrl(
    provider:
        string |
        undefined,

    value:
        string |
        undefined,
) {
    if (
        !provider ||
        !value ||
        ![
            "youtube",
            "vimeo",
        ].includes(
            provider,
        )
    ) {
        return null;
    }

    try {
        const url =
            new URL(
                value,
            );

        const hosts =
            provider ===
            "youtube"
                ? [
                    "www.youtube.com",
                    "youtube.com",
                    "www.youtube-nocookie.com",
                ]
                : [
                    "player.vimeo.com",
                ];

        return (
            url.protocol ===
            "https:" &&
            hosts.includes(
                url.hostname,
            )
                ? url.toString()
                : null
        );
    } catch {
        return null;
    }
}
