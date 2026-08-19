import {
    ArrowLeft,
    ImagePlus,
    Loader2,
    Plus,
    Trash2,
} from "lucide-react";

import {
    Link,
    useNavigate,
} from "@tanstack/react-router";

import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
    type ReactNode,
} from "react";

import type {
    CmsOtherSettingsOption,
} from "@/lib/cms-other-settings.constants";

import {
    createCmsDestinationFn,
} from "@/lib/cms-destinations.functions";

import {
    destinationMonthOptions,
} from "@/lib/cms-destinations.constants";

import {
    CmsDestinationContentCreateFields,
} from "@/components/admin/CmsDestinationContentCreateFields";

import {
    CmsDestinationItineraryCreateFields,
} from "@/components/admin/CmsDestinationItineraryCreateFields";

import {
    CmsDestinationMapCreateFields,
} from "@/components/admin/CmsDestinationMapCreateFields";

import {
    CmsDestinationFaqCreateFields,
} from "@/components/admin/CmsDestinationFaqCreateFields";

type SeasonRow = {
    id:
        string;

    fromMonth:
        string;

    toMonth:
        string;
};

const inputClass =
    "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#0c1724] outline-none transition focus:border-gold";

function makeSlug(
    value:
    string,
) {
    return value
        .trim()
        .toLowerCase()
        .replace(
            /[^a-z0-9]+/g,
            "-",
        )
        .replace(
            /^-+|-+$/g,
            "",
        );
}

export function CmsDestinationCreateForm({
                                             options,
                                         }: {
    options:
        CmsOtherSettingsOption[];
}) {
    const navigate =
        useNavigate();

    const destinationTypes =
        useMemo(
            () =>
                options.filter(
                    (option) =>
                        option.groupKey ===
                        "destination_type",
                ),
            [
                options,
            ],
        );

    const difficulties =
        useMemo(
            () =>
                options.filter(
                    (option) =>
                        option.groupKey ===
                        "difficulty",
                ),
            [
                options,
            ],
        );

    const [
        title,
        setTitle,
    ] =
        useState("");

    const [
        slug,
        setSlug,
    ] =
        useState("");

    const [
        slugTouched,
        setSlugTouched,
    ] =
        useState(false);

    const [
        mainImage,
        setMainImage,
    ] =
        useState<File | null>(
            null,
        );

    const [
        previewUrl,
        setPreviewUrl,
    ] =
        useState<
            string | null
        >(
            null,
        );

    const [
        seasons,
        setSeasons,
    ] =
        useState<
            SeasonRow[]
        >([]);

    const [
        submitting,
        setSubmitting,
    ] =
        useState(false);

    const [
        error,
        setError,
    ] =
        useState("");

    useEffect(
        () => {
            if (
                !mainImage
            ) {
                setPreviewUrl(
                    null,
                );

                return;
            }

            const url =
                URL.createObjectURL(
                    mainImage,
                );

            setPreviewUrl(
                url,
            );

            return () => {
                URL.revokeObjectURL(
                    url,
                );
            };
        },
        [
            mainImage,
        ],
    );

    function addSeason() {
        setSeasons(
            (current) => [
                ...current,

                {
                    id:
                        crypto.randomUUID(),

                    fromMonth:
                        "",

                    toMonth:
                        "",
                },
            ],
        );
    }

    function updateSeason(
        id:
        string,

        field:
            "fromMonth" |
            "toMonth",

        value:
        string,
    ) {
        setSeasons(
            (current) =>
                current.map(
                    (season) =>
                        season.id ===
                        id
                            ? {
                                ...season,
                                [field]:
                                value,
                            }
                            : season,
                ),
        );
    }

    function removeSeason(
        id:
        string,
    ) {
        setSeasons(
            (current) =>
                current.filter(
                    (season) =>
                        season.id !==
                        id,
                ),
        );
    }

    async function submit(
        event:
        FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (
            submitting
        ) {
            return;
        }

        const incompleteSeason =
            seasons.some(
                (season) =>
                    !season.fromMonth ||
                    !season.toMonth,
            );

        if (
            incompleteSeason
        ) {
            setError(
                "Complete both From and To month for every Best Season range.",
            );

            return;
        }

        setSubmitting(
            true,
        );

        setError("");

        const formData =
            new FormData(
                event.currentTarget,
            );

        formData.set(
            "name",
            title,
        );

        formData.set(
            "slug",
            slug,
        );

        formData.set(
            "bestSeasons",
            JSON.stringify(
                seasons.map(
                    (season) => ({
                        fromMonth:
                            Number(
                                season.fromMonth,
                            ),

                        toMonth:
                            Number(
                                season.toMonth,
                            ),
                    }),
                ),
            ),
        );

        if (
            mainImage
        ) {
            formData.set(
                "mainImage",
                mainImage,
            );
        }

        try {
            const result =
                await createCmsDestinationFn({
                    data:
                    formData,
                });

            await navigate({
                to:
                    "/admin/cms/destinations/$id",

                params: {
                    id:
                    result.id,
                },
            });
        } catch (
            caught
            ) {
            console.error(
                "Destination creation failed",
                caught,
            );

            setError(
                caught instanceof
                Error
                    ? caught.message
                    : "Destination could not be created.",
            );
        } finally {
            setSubmitting(
                false,
            );
        }
    }

    return (
        <div className="mx-auto max-w-5xl">
            <Link
                to="/admin/cms/destinations"
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-[#0c1724]"
            >
                <ArrowLeft className="h-4 w-4" />

                Back to destinations
            </Link>

            <div className="mt-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                    Destination CMS
                </p>

                <h1 className="mt-2 text-3xl font-semibold text-[#0c1724]">
                    Create Destination
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                    New destinations remain unpublished until publishing is enabled later.
                </p>
            </div>

            <form
                onSubmit={
                    submit
                }
                className="mt-7 space-y-6"
            >
                <Section
                    title="Destination Identity"
                    description="Main destination information used throughout the site."
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <Field
                            label="Destination Title"
                            required
                        >
                            <input
                                required
                                value={
                                    title
                                }
                                onChange={(
                                    event,
                                ) => {
                                    const value =
                                        event.target.value;

                                    setTitle(
                                        value,
                                    );

                                    if (
                                        !slugTouched
                                    ) {
                                        setSlug(
                                            makeSlug(
                                                value,
                                            ),
                                        );
                                    }
                                }}
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field
                            label="Slug"
                            required
                        >
                            <input
                                required
                                value={
                                    slug
                                }
                                onChange={(
                                    event,
                                ) => {
                                    setSlugTouched(
                                        true,
                                    );

                                    setSlug(
                                        makeSlug(
                                            event.target.value,
                                        ),
                                    );
                                }}
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Destination Region">
                            <input
                                name="region"
                                placeholder="Solukhumbu"
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Destination Type">
                            <select
                                name="destinationTypeOptionId"
                                className={
                                    inputClass
                                }
                            >
                                <option value="">
                                    Select destination type
                                </option>

                                {destinationTypes.map(
                                    (option) => (
                                        <option
                                            key={
                                                option.id
                                            }
                                            value={
                                                option.id
                                            }
                                        >
                                            {
                                                option.name
                                            }
                                        </option>
                                    ),
                                )}
                            </select>
                        </Field>

                        <div className="md:col-span-2">
                            <Field label="Destination Subtitle">
                                <textarea
                                    name="subtitle"
                                    rows={3}
                                    className={
                                        inputClass
                                    }
                                    placeholder="Short destination subtitle..."
                                />
                            </Field>
                        </div>
                    </div>
                </Section>

                <Section
                    title="Destination Main Image"
                    description="Direct upload for the individual destination detail page. This is not selected from Media Library."
                >
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(
                            event,
                        ) =>
                            setMainImage(
                                event.target.files?.[0] ??
                                null,
                            )
                        }
                        className="w-full rounded-xl border border-dashed border-black/15 bg-[#faf9f6] p-5 text-sm"
                    />

                    {previewUrl ? (
                        <div className="mt-4 overflow-hidden rounded-xl border border-black/10">
                            <img
                                src={
                                    previewUrl
                                }
                                alt=""
                                className="max-h-80 w-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="mt-4 grid h-40 place-items-center rounded-xl border border-dashed border-black/10 bg-black/[0.02]">
                            <ImagePlus className="h-8 w-8 text-muted-foreground" />
                        </div>
                    )}
                </Section>

                <Section
                    title="Travel Information"
                    description="Altitude, duration, difficulty and best travel seasons."
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <Field label="Minimum Altitude (m)">
                            <input
                                name="minAltitude"
                                type="number"
                                step="1"
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Maximum Altitude (m)">
                            <input
                                name="maxAltitude"
                                type="number"
                                step="1"
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Minimum Duration (days)">
                            <input
                                name="durationMinDays"
                                type="number"
                                min="1"
                                step="1"
                                placeholder="12"
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Maximum Duration (days)">
                            <input
                                name="durationMaxDays"
                                type="number"
                                min="1"
                                step="1"
                                placeholder="14"
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Difficulty">
                            <select
                                name="difficultyOptionId"
                                className={
                                    inputClass
                                }
                            >
                                <option value="">
                                    Select difficulty
                                </option>

                                {difficulties.map(
                                    (option) => (
                                        <option
                                            key={
                                                option.id
                                            }
                                            value={
                                                option.id
                                            }
                                        >
                                            {
                                                option.name
                                            }
                                        </option>
                                    ),
                                )}
                            </select>
                        </Field>

                        <Field label="Display Order">
                            <input
                                name="sortOrder"
                                type="number"
                                min="0"
                                step="1"
                                defaultValue="0"
                                className={
                                    inputClass
                                }
                            />
                        </Field>
                    </div>

                    <div className="mt-7">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-[#0c1724]">
                                    Best Season
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Add one or more month ranges.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    addSeason
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold"
                            >
                                <Plus className="h-4 w-4" />

                                Add Season
                            </button>
                        </div>

                        <div className="mt-4 grid gap-3">
                            {seasons.map(
                                (season) => (
                                    <div
                                        key={
                                            season.id
                                        }
                                        className="grid gap-3 rounded-xl border border-black/10 bg-[#faf9f6] p-4 sm:grid-cols-[1fr_1fr_auto]"
                                    >
                                        <select
                                            value={
                                                season.fromMonth
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                updateSeason(
                                                    season.id,
                                                    "fromMonth",
                                                    event.target.value,
                                                )
                                            }
                                            className={
                                                inputClass
                                            }
                                        >
                                            <option value="">
                                                From month
                                            </option>

                                            {destinationMonthOptions.map(
                                                (month) => (
                                                    <option
                                                        key={
                                                            month.value
                                                        }
                                                        value={
                                                            month.value
                                                        }
                                                    >
                                                        {
                                                            month.label
                                                        }
                                                    </option>
                                                ),
                                            )}
                                        </select>

                                        <select
                                            value={
                                                season.toMonth
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                updateSeason(
                                                    season.id,
                                                    "toMonth",
                                                    event.target.value,
                                                )
                                            }
                                            className={
                                                inputClass
                                            }
                                        >
                                            <option value="">
                                                To month
                                            </option>

                                            {destinationMonthOptions.map(
                                                (month) => (
                                                    <option
                                                        key={
                                                            month.value
                                                        }
                                                        value={
                                                            month.value
                                                        }
                                                    >
                                                        {
                                                            month.label
                                                        }
                                                    </option>
                                                ),
                                            )}
                                        </select>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeSeason(
                                                    season.id,
                                                )
                                            }
                                            className="grid h-11 w-11 place-items-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ),
                            )}

                            {!seasons.length ? (
                                <p className="rounded-xl border border-dashed border-black/10 p-5 text-sm text-muted-foreground">
                                    No Best Season ranges added yet.
                                </p>
                            ) : null}
                        </div>
                    </div>
                </Section>

                <Section
                    title="Overview"
                    description="Main overview text used on the destination detail page."
                >
                    <textarea
                        name="overview"
                        rows={10}
                        className={
                            inputClass
                        }
                        placeholder="Write the destination overview..."
                    />
                </Section>

                <CmsDestinationContentCreateFields />

                <CmsDestinationItineraryCreateFields />

                <CmsDestinationMapCreateFields />

                <CmsDestinationFaqCreateFields />

                {error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                ) : null}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={
                            submitting ||
                            !title.trim() ||
                            !slug.trim()
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0c1724] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
                    >
                        {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gold" />
                        ) : (
                            <Plus className="h-4 w-4 text-gold" />
                        )}

                        {submitting
                            ? "Creating..."
                            : "Create Destination"}
                    </button>
                </div>
            </form>
        </div>
    );
}

function Section({
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
        <section className="rounded-2xl border border-black/10 bg-white p-6">
            <h2 className="text-lg font-semibold text-[#0c1724]">
                {title}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
                {description}
            </p>

            <div className="mt-6">
                {children}
            </div>
        </section>
    );
}

function Field({
                   label,
                   required = false,
                   children,
               }: {
    label:
        string;

    required?:
        boolean;

    children:
        ReactNode;
}) {
    return (
        <label className="block">
            <span className="text-sm font-semibold text-[#0c1724]">
                {label}

                {required ? (
                    <span className="ml-1 text-red-600">
                        *
                    </span>
                ) : null}
            </span>

            <div className="mt-2">
                {children}
            </div>
        </label>
    );
}