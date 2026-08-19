import {
    ArrowLeft,
    ExternalLink,
    ImagePlus,
    Loader2,
    Plus,
    Save,
    Trash2,
} from "lucide-react";

import {
    Link,
    useRouter,
} from "@tanstack/react-router";

import {
    useMemo,
    useState,
    type Dispatch,
    type FormEvent,
    type ReactNode,
    type SetStateAction,
} from "react";

import type {
    CmsOtherSettingsOption,
} from "@/lib/cms-other-settings.constants";

import type {
    CmsDestinationDetail,
} from "@/lib/cms-destinations.server";

import {
    destinationMonthOptions,
} from "@/lib/cms-destinations.constants";

import {
    updateCmsDestinationContentFn,
    updateCmsDestinationCoreFn,
    updateCmsDestinationItineraryFn,
    updateCmsDestinationMapFn,
    updateCmsDestinationFaqsFn,
    uploadCmsDestinationMainImageFn,
} from "@/lib/cms-destinations.functions";

type SeasonRow = {
    id:
        string;

    fromMonth:
        string;

    toMonth:
        string;
};

type TextRow = {
    id:
        string;

    value:
        string;
};

type ItineraryRow = {
    id:
        string;

    dayNo:
        string;

    title:
        string;

    description:
        string;
};

type FaqRow = {
    id:
        string;

    question:
        string;

    answer:
        string;
};

function addTextRow(
    setRows:
    Dispatch<
        SetStateAction<
            TextRow[]
        >
    >,
) {
    setRows(
        (
            current,
        ) => [
            ...current,

            {
                id:
                    crypto.randomUUID(),

                value:
                    "",
            },
        ],
    );
}

function changeTextRow(
    setRows:
    Dispatch<
        SetStateAction<
            TextRow[]
        >
    >,

    id:
    string,

    value:
    string,
) {
    setRows(
        (
            current,
        ) =>
            current.map(
                (
                    row,
                ) =>
                    row.id ===
                    id
                        ? {
                            ...row,

                            value,
                        }
                        : row,
            ),
    );
}

function removeTextRow(
    setRows:
    Dispatch<
        SetStateAction<
            TextRow[]
        >
    >,

    id:
    string,
) {
    setRows(
        (
            current,
        ) =>
            current.filter(
                (
                    row,
                ) =>
                    row.id !==
                    id,
            ),
    );
}

function cleanTextRows(
    rows:
    TextRow[],
) {
    return rows
        .map(
            (
                row,
            ) =>
                row.value.trim(),
        )
        .filter(
            Boolean,
        );
}

function extractItineraryDayNumber(
    dayLabel:
    string,

    fallback:
    number,
) {
    const match =
        dayLabel.match(
            /\d+/,
        );

    return match
        ? match[0]
        : String(
            fallback,
        );
}

const inputClass =
    "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#0c1724] outline-none transition focus:border-gold";

function nullableNumber(
    value:
        FormDataEntryValue | null,
) {
    const raw =
        String(
            value ?? "",
        ).trim();

    if (!raw) {
        return null;
    }

    const number =
        Number(raw);

    return Number.isFinite(
        number,
    )
        ? number
        : null;
}

function resolveLegacyOption(
    optionId:
        string | null,

    legacy:
        string | null,

    options:
    CmsOtherSettingsOption[],
) {
    if (
        optionId
    ) {
        return optionId;
    }

    if (
        !legacy
    ) {
        return "";
    }

    const normalized =
        legacy
            .trim()
            .toLowerCase();

    return (
        options.find(
            (option) =>
                option.name
                    .trim()
                    .toLowerCase() ===
                normalized,
        )?.id ??
        ""
    );
}

export function CmsDestinationEditor({
                                         detail,
                                         options,
                                     }: {
    detail:
        CmsDestinationDetail;

    options:
        CmsOtherSettingsOption[];
}) {
    const router =
        useRouter();

    const destination =
        detail.destination;

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
        useState(
            destination.name,
        );

    const [
        slug,
        setSlug,
    ] =
        useState(
            destination.slug,
        );

    const [
        seasons,
        setSeasons,
    ] =
        useState<
            SeasonRow[]
        >(
            detail.bestSeasons.map(
                (season) => ({
                    id:
                    season.id,

                    fromMonth:
                        String(
                            season.fromMonth,
                        ),

                    toMonth:
                        String(
                            season.toMonth,
                        ),
                }),
            ),
        );



    const [
        seasonsChanged,
        setSeasonsChanged,
    ] =
        useState(
            false,
        );



    const [
        highlights,
        setHighlights,
    ] =
        useState<
            TextRow[]
        >(
            detail.highlights.map(
                (
                    item,
                ) => ({
                    id:
                    item.id,

                    value:
                    item.item,
                }),
            ),
        );

    const [
        inclusions,
        setInclusions,
    ] =
        useState<
            TextRow[]
        >(
            detail.inclusions.map(
                (
                    item,
                ) => ({
                    id:
                    item.id,

                    value:
                    item.item,
                }),
            ),
        );

    const [
        exclusions,
        setExclusions,
    ] =
        useState<
            TextRow[]
        >(
            detail.exclusions.map(
                (
                    item,
                ) => ({
                    id:
                    item.id,

                    value:
                    item.item,
                }),
            ),
        );

    const [
        tips,
        setTips,
    ] =
        useState<
            TextRow[]
        >(
            detail.tips.map(
                (
                    item,
                ) => ({
                    id:
                    item.id,

                    value:
                    item.item,
                }),
            ),
        );



    const [
        savingContent,
        setSavingContent,
    ] =
        useState(
            false,
        );

    const [
        contentError,
        setContentError,
    ] =
        useState("");

    const [
        contentSuccess,
        setContentSuccess,
    ] =
        useState("");

    const [
        saving,
        setSaving,
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
        itineraries,
        setItineraries,
    ] =
        useState<
            ItineraryRow[]
        >(
            detail.itineraries.map(
                (
                    item,
                    index,
                ) => ({
                    id:
                    item.id,

                    dayNo:
                        extractItineraryDayNumber(
                            item.dayLabel,
                            index + 1,
                        ),

                    title:
                    item.title,

                    description:
                        item.description ??
                        "",
                }),
            ),
        );

    const [
        savingItinerary,
        setSavingItinerary,
    ] =
        useState(
            false,
        );

    const [
        itineraryError,
        setItineraryError,
    ] =
        useState("");

    const [
        itinerarySuccess,
        setItinerarySuccess,
    ] =
        useState("");

    const [
        latitude,
        setLatitude,
    ] =
        useState(
            destination.latitude ===
            null
                ? ""
                : String(
                    destination.latitude,
                ),
        );

    const [
        longitude,
        setLongitude,
    ] =
        useState(
            destination.longitude ===
            null
                ? ""
                : String(
                    destination.longitude,
                ),
        );

    const [
        savingMap,
        setSavingMap,
    ] =
        useState(
            false,
        );

    const [
        mapError,
        setMapError,
    ] =
        useState("");

    const [
        mapSuccess,
        setMapSuccess,
    ] =
        useState("");

    const [
        faqs,
        setFaqs,
    ] =
        useState<
            FaqRow[]
        >(
            detail.faqs.map(
                (
                    faq,
                ) => ({
                    id:
                    faq.id,

                    question:
                    faq.question,

                    answer:
                    faq.answer,
                }),
            ),
        );

    const [
        savingFaqs,
        setSavingFaqs,
    ] =
        useState(
            false,
        );

    const [
        faqError,
        setFaqError,
    ] =
        useState("");

    const [
        faqSuccess,
        setFaqSuccess,
    ] =
        useState("");

    const [
        mainImage,
        setMainImage,
    ] =
        useState<File | null>(
            null,
        );

    const [
        uploadingImage,
        setUploadingImage,
    ] =
        useState(
            false,
        );

    const [
        imageError,
        setImageError,
    ] =
        useState("");

    const initialDestinationType =
        resolveLegacyOption(
            destination.destinationTypeOptionId,
            destination.category,
            destinationTypes,
        );

    const initialDifficulty =
        resolveLegacyOption(
            destination.difficultyOptionId,
            destination.difficulty,
            difficulties,
        );

    function addSeason() {
        setSeasonsChanged(
            true,
        );

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

    function changeSeason(
        id:
        string,

        field:
            "fromMonth" |
            "toMonth",

        value:
        string,
    ) {
        setSeasonsChanged(
            true,
        );

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
        setSeasonsChanged(
            true,
        );

        setSeasons(
            (current) =>
                current.filter(
                    (season) =>
                        season.id !==
                        id,
                ),
        );
    }


    function addItinerary() {
        const nextDay =
            itineraries.length
                ? Math.max(
                ...itineraries.map(
                    (
                        item,
                    ) =>
                        Number(
                            item.dayNo,
                        ) ||
                        0,
                ),
            ) + 1
                : 1;

        setItineraries(
            (
                current,
            ) => [
                ...current,

                {
                    id:
                        crypto.randomUUID(),

                    dayNo:
                        String(
                            nextDay,
                        ),

                    title:
                        "",

                    description:
                        "",
                },
            ],
        );
    }

    function changeItinerary(
        id:
        string,

        field:
            "dayNo" |
            "title" |
            "description",

        value:
        string,
    ) {
        setItineraries(
            (
                current,
            ) =>
                current.map(
                    (
                        item,
                    ) =>
                        item.id ===
                        id
                            ? {
                                ...item,

                                [field]:
                                value,
                            }
                            : item,
                ),
        );
    }

    function removeItinerary(
        id:
        string,
    ) {
        setItineraries(
            (
                current,
            ) =>
                current.filter(
                    (
                        item,
                    ) =>
                        item.id !==
                        id,
                ),
        );
    }

    async function saveItinerary() {
        if (
            savingItinerary
        ) {
            return;
        }

        const invalid =
            itineraries.some(
                (
                    item,
                ) => {
                    const dayNo =
                        Number(
                            item.dayNo,
                        );

                    return (
                        !Number.isInteger(
                            dayNo,
                        ) ||
                        dayNo <
                        1 ||
                        !item.title.trim()
                    );
                },
            );

        if (
            invalid
        ) {
            setItineraryError(
                "Every itinerary row requires a valid Day No. and Title.",
            );

            return;
        }

        setSavingItinerary(
            true,
        );

        setItineraryError("");
        setItinerarySuccess("");

        try {
            await updateCmsDestinationItineraryFn({
                data: {
                    id:
                    destination.id,

                    itineraries:
                        itineraries.map(
                            (
                                item,
                            ) => ({
                                dayNo:
                                    Number(
                                        item.dayNo,
                                    ),

                                title:
                                    item.title.trim(),

                                description:
                                    item.description.trim(),
                            }),
                        ),
                },
            });

            setItinerarySuccess(
                "Destination itinerary saved successfully.",
            );

            await router.invalidate({
                sync:
                    true,
            });
        } catch (
            caught
            ) {
            console.error(
                "Destination itinerary update failed",
                caught,
            );

            setItineraryError(
                caught instanceof
                Error
                    ? caught.message
                    : "Destination itinerary could not be saved.",
            );
        } finally {
            setSavingItinerary(
                false,
            );
        }
    }

    async function saveMapLocation() {
        if (
            savingMap
        ) {
            return;
        }

        const latitudeValue =
            latitude.trim();

        const longitudeValue =
            longitude.trim();

        if (
            Boolean(
                latitudeValue,
            ) !==
            Boolean(
                longitudeValue,
            )
        ) {
            setMapError(
                "Latitude and Longitude must both be provided, or both be empty.",
            );

            setMapSuccess("");

            return;
        }

        let parsedLatitude:
            number | null =
            null;

        let parsedLongitude:
            number | null =
            null;

        if (
            latitudeValue &&
            longitudeValue
        ) {
            parsedLatitude =
                Number(
                    latitudeValue,
                );

            parsedLongitude =
                Number(
                    longitudeValue,
                );

            if (
                !Number.isFinite(
                    parsedLatitude,
                ) ||
                parsedLatitude <
                -90 ||
                parsedLatitude >
                90
            ) {
                setMapError(
                    "Latitude must be between -90 and 90.",
                );

                setMapSuccess("");

                return;
            }

            if (
                !Number.isFinite(
                    parsedLongitude,
                ) ||
                parsedLongitude <
                -180 ||
                parsedLongitude >
                180
            ) {
                setMapError(
                    "Longitude must be between -180 and 180.",
                );

                setMapSuccess("");

                return;
            }
        }

        setSavingMap(
            true,
        );

        setMapError("");
        setMapSuccess("");

        try {
            await updateCmsDestinationMapFn({
                data: {
                    id:
                    destination.id,

                    latitude:
                    parsedLatitude,

                    longitude:
                    parsedLongitude,
                },
            });

            setMapSuccess(
                "Map location saved successfully.",
            );

            await router.invalidate({
                sync:
                    true,
            });
        } catch (
            caught
            ) {
            console.error(
                "Destination map update failed",
                caught,
            );

            setMapError(
                caught instanceof
                Error
                    ? caught.message
                    : "Map location could not be saved.",
            );
        } finally {
            setSavingMap(
                false,
            );
        }
    }

    function addFaq() {
        setFaqs(
            (
                current,
            ) => [
                ...current,

                {
                    id:
                        crypto.randomUUID(),

                    question:
                        "",

                    answer:
                        "",
                },
            ],
        );
    }

    function changeFaq(
        id:
        string,

        field:
            "question" |
            "answer",

        value:
        string,
    ) {
        setFaqs(
            (
                current,
            ) =>
                current.map(
                    (
                        faq,
                    ) =>
                        faq.id ===
                        id
                            ? {
                                ...faq,

                                [field]:
                                value,
                            }
                            : faq,
                ),
        );
    }

    function removeFaq(
        id:
        string,
    ) {
        setFaqs(
            (
                current,
            ) =>
                current.filter(
                    (
                        faq,
                    ) =>
                        faq.id !==
                        id,
                ),
        );
    }

    async function saveFaqs() {
        if (
            savingFaqs
        ) {
            return;
        }

        const incomplete =
            faqs.some(
                (
                    faq,
                ) =>
                    !faq.question.trim() ||
                    !faq.answer.trim(),
            );

        if (
            incomplete
        ) {
            setFaqError(
                "Every FAQ requires both a Question and an Answer.",
            );

            setFaqSuccess("");

            return;
        }

        setSavingFaqs(
            true,
        );

        setFaqError("");
        setFaqSuccess("");

        try {
            await updateCmsDestinationFaqsFn({
                data: {
                    id:
                    destination.id,

                    faqs:
                        faqs.map(
                            (
                                faq,
                            ) => ({
                                question:
                                    faq.question.trim(),

                                answer:
                                    faq.answer.trim(),
                            }),
                        ),
                },
            });

            setFaqSuccess(
                "Destination FAQs saved successfully.",
            );

            await router.invalidate({
                sync:
                    true,
            });
        } catch (
            caught
            ) {
            console.error(
                "Destination FAQ update failed",
                caught,
            );

            setFaqError(
                caught instanceof
                Error
                    ? caught.message
                    : "Destination FAQs could not be saved.",
            );
        } finally {
            setSavingFaqs(
                false,
            );
        }
    }
    async function saveContent() {
        if (
            savingContent
        ) {
            return;
        }

        setSavingContent(
            true,
        );

        setContentError("");
        setContentSuccess("");

        try {
            await updateCmsDestinationContentFn({
                data: {
                    id:
                    destination.id,

                    highlights:
                        cleanTextRows(
                            highlights,
                        ),

                    inclusions:
                        cleanTextRows(
                            inclusions,
                        ),

                    exclusions:
                        cleanTextRows(
                            exclusions,
                        ),

                    tips:
                        cleanTextRows(
                            tips,
                        ),
                },
            });

            setContentSuccess(
                "Destination content saved successfully.",
            );

            await router.invalidate({
                sync:
                    true,
            });
        } catch (
            caught
            ) {
            console.error(
                "Destination content update failed",
                caught,
            );

            setContentError(
                caught instanceof
                Error
                    ? caught.message
                    : "Destination content could not be saved.",
            );
        } finally {
            setSavingContent(
                false,
            );
        }
    }

    async function uploadMainImage() {
        if (
            !mainImage ||
            uploadingImage
        ) {
            return;
        }

        setUploadingImage(
            true,
        );

        setImageError("");

        try {
            const data =
                new FormData();

            data.set(
                "id",
                destination.id,
            );

            data.set(
                "mainImage",
                mainImage,
            );

            await uploadCmsDestinationMainImageFn({
                data,
            });

            setMainImage(
                null,
            );

            await router.invalidate({
                sync:
                    true,
            });
        } catch (
            caught
            ) {
            console.error(
                "Destination main image upload failed",
                caught,
            );

            setImageError(
                caught instanceof
                Error
                    ? caught.message
                    : "Main image could not be uploaded.",
            );
        } finally {
            setUploadingImage(
                false,
            );
        }
    }

    async function submit(
        event:
        FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (
            saving
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
            seasonsChanged &&
            incompleteSeason
        ) {
            setError(
                "Complete both From and To month for every Best Season range.",
            );

            return;
        }

        setSaving(
            true,
        );

        setError("");
        setSuccess("");

        const formData =
            new FormData(
                event.currentTarget,
            );

        try {
            await updateCmsDestinationCoreFn({
                data: {
                    id:
                    destination.id,

                    name:
                    title,

                    slug,

                    region:
                        String(
                            formData.get(
                                "region",
                            ) ??
                            "",
                        ),

                    subtitle:
                        String(
                            formData.get(
                                "subtitle",
                            ) ??
                            "",
                        ),

                    destinationTypeOptionId:
                        String(
                            formData.get(
                                "destinationTypeOptionId",
                            ) ??
                            "",
                        ) ||
                        null,

                    difficultyOptionId:
                        String(
                            formData.get(
                                "difficultyOptionId",
                            ) ??
                            "",
                        ) ||
                        null,

                    minAltitude:
                        nullableNumber(
                            formData.get(
                                "minAltitude",
                            ),
                        ),

                    maxAltitude:
                        nullableNumber(
                            formData.get(
                                "maxAltitude",
                            ),
                        ),

                    durationMinDays:
                        nullableNumber(
                            formData.get(
                                "durationMinDays",
                            ),
                        ),

                    durationMaxDays:
                        nullableNumber(
                            formData.get(
                                "durationMaxDays",
                            ),
                        ),

                    overview:
                        String(
                            formData.get(
                                "overview",
                            ) ??
                            "",
                        ),

                    sortOrder:
                        Number(
                            formData.get(
                                "sortOrder",
                            ) ??
                            0,
                        ),

                    replaceBestSeasons:
                    seasonsChanged,

                    bestSeasons:
                        seasonsChanged
                            ? seasons.map(
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
                            )
                            : [],
                },
            });

            setSeasonsChanged(
                false,
            );

            setSuccess(
                "Destination saved successfully.",
            );

            await router.invalidate({
                sync:
                    true,
            });
        } catch (
            caught
            ) {
            console.error(
                "Destination update failed",
                caught,
            );

            setError(
                caught instanceof
                Error
                    ? caught.message
                    : "Destination could not be saved.",
            );
        } finally {
            setSaving(
                false,
            );
        }
    }

    return (
        <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-between gap-4">
                <Link
                    to="/admin/cms/destinations"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-[#0c1724]"
                >
                    <ArrowLeft className="h-4 w-4" />

                    Back to destinations
                </Link>

                {destination.status ? (
                    <a
                        href={`/destinations/${destination.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#0c1724]"
                    >
                        View Public Page

                        <ExternalLink className="h-4 w-4" />
                    </a>
                ) : null}
            </div>

            <div className="mt-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                    Destination CMS
                </p>

                <h1 className="mt-2 text-3xl font-semibold text-[#0c1724]">
                    {destination.name}
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                    /destinations/{destination.slug}
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
                    description="Core identity and classification."
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <Field label="Destination Title">
                            <input
                                value={
                                    title
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setTitle(
                                        event.target.value,
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Slug">
                            <input
                                value={
                                    slug
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setSlug(
                                        event.target.value
                                            .trim()
                                            .toLowerCase()
                                            .replace(
                                                /[^a-z0-9]+/g,
                                                "-",
                                            )
                                            .replace(
                                                /^-+|-+$/g,
                                                "",
                                            ),
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Destination Region">
                            <input
                                name="region"
                                defaultValue={
                                    destination.region ??
                                    ""
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Destination Type">
                            <select
                                name="destinationTypeOptionId"
                                defaultValue={
                                    initialDestinationType
                                }
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
                                    defaultValue={
                                        destination.subtitle ??
                                        destination.shortDescription ??
                                        ""
                                    }
                                    className={
                                        inputClass
                                    }
                                />
                            </Field>
                        </div>
                    </div>
                </Section>

                <Section
                    title="Destination Main Image"
                    description="Direct image used on this destination's detail page. It is independent from the Media Library."
                >
                    {destination.heroImage ? (
                        <img
                            src={
                                destination.heroImage
                            }
                            alt=""
                            className="max-h-96 w-full rounded-xl border border-black/10 object-cover"
                        />
                    ) : (
                        <div className="grid h-48 place-items-center rounded-xl border border-dashed border-black/10 bg-black/[0.02]">
                            <ImagePlus className="h-8 w-8 text-muted-foreground" />
                        </div>
                    )}

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
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
                            className="min-w-0 flex-1 rounded-xl border border-black/10 p-3 text-sm"
                        />

                        <button
                            type="button"
                            disabled={
                                !mainImage ||
                                uploadingImage
                            }
                            onClick={
                                uploadMainImage
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0c1724] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {uploadingImage ? (
                                <Loader2 className="h-4 w-4 animate-spin text-gold" />
                            ) : (
                                <ImagePlus className="h-4 w-4 text-gold" />
                            )}

                            {destination.heroImage
                                ? "Replace Main Image"
                                : "Upload Main Image"}
                        </button>
                    </div>

                    {imageError ? (
                        <p className="mt-3 text-sm text-red-700">
                            {imageError}
                        </p>
                    ) : null}
                </Section>

                <Section
                    title="Travel Information"
                    description="Altitude, duration, difficulty and best seasons."
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <Field label="Minimum Altitude (m)">
                            <input
                                name="minAltitude"
                                type="number"
                                defaultValue={
                                    destination.minAltitude ??
                                    ""
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Maximum Altitude (m)">
                            <input
                                name="maxAltitude"
                                type="number"
                                defaultValue={
                                    destination.maxAltitude ??
                                    ""
                                }
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
                                defaultValue={
                                    destination.durationMinDays ??
                                    ""
                                }
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
                                defaultValue={
                                    destination.durationMaxDays ??
                                    ""
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Difficulty">
                            <select
                                name="difficultyOptionId"
                                defaultValue={
                                    initialDifficulty
                                }
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
                                defaultValue={
                                    destination.sortOrder
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>
                    </div>

                    <div className="mt-7">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-[#0c1724]">
                                    Best Season
                                </p>

                                {destination.bestSeason &&
                                !detail.bestSeasons.length ? (
                                    <p className="mt-1 text-xs text-amber-700">
                                        Existing legacy value:{" "}
                                        {
                                            destination.bestSeason
                                        }.
                                        It will remain untouched until you add or edit structured ranges below.
                                    </p>
                                ) : (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Add one or more From → To month ranges.
                                    </p>
                                )}
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
                                                changeSeason(
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
                                                changeSeason(
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
                        </div>
                    </div>
                </Section>

                <Section
                    title="Overview"
                    description="Main public overview for this destination."
                >
                    <textarea
                        name="overview"
                        rows={10}
                        defaultValue={
                            destination.description ??
                            ""
                        }
                        className={
                            inputClass
                        }
                    />
                </Section>

                <Section
                    title="Destination Content"
                    description="Highlights, inclusions, exclusions and useful travel tips shown on the destination detail page."
                >
                    <div className="grid gap-8">
                        <TextListEditor
                            title="Highlights"
                            description="The main reasons and standout experiences travellers should know about."
                            addLabel="Add Highlight"
                            placeholder="Example: Sunrise views across the Himalayan range"
                            rows={
                                highlights
                            }
                            onAdd={() =>
                                addTextRow(
                                    setHighlights,
                                )
                            }
                            onChange={(
                                id,
                                value,
                            ) =>
                                changeTextRow(
                                    setHighlights,
                                    id,
                                    value,
                                )
                            }
                            onRemove={(
                                id,
                            ) =>
                                removeTextRow(
                                    setHighlights,
                                    id,
                                )
                            }
                        />

                        <TextListEditor
                            title="Inclusions"
                            description="Items, services or experiences included for this destination."
                            addLabel="Add Inclusion"
                            placeholder="Example: Airport transfers"
                            rows={
                                inclusions
                            }
                            onAdd={() =>
                                addTextRow(
                                    setInclusions,
                                )
                            }
                            onChange={(
                                id,
                                value,
                            ) =>
                                changeTextRow(
                                    setInclusions,
                                    id,
                                    value,
                                )
                            }
                            onRemove={(
                                id,
                            ) =>
                                removeTextRow(
                                    setInclusions,
                                    id,
                                )
                            }
                        />

                        <TextListEditor
                            title="Exclusions"
                            description="Items or services travellers should expect to arrange separately."
                            addLabel="Add Exclusion"
                            placeholder="Example: International airfare"
                            rows={
                                exclusions
                            }
                            onAdd={() =>
                                addTextRow(
                                    setExclusions,
                                )
                            }
                            onChange={(
                                id,
                                value,
                            ) =>
                                changeTextRow(
                                    setExclusions,
                                    id,
                                    value,
                                )
                            }
                            onRemove={(
                                id,
                            ) =>
                                removeTextRow(
                                    setExclusions,
                                    id,
                                )
                            }
                        />

                        <TextListEditor
                            title="Travel Tips"
                            description="Practical advice travellers should know before visiting."
                            addLabel="Add Travel Tip"
                            placeholder="Example: Carry warm layers even during the trekking season"
                            rows={
                                tips
                            }
                            onAdd={() =>
                                addTextRow(
                                    setTips,
                                )
                            }
                            onChange={(
                                id,
                                value,
                            ) =>
                                changeTextRow(
                                    setTips,
                                    id,
                                    value,
                                )
                            }
                            onRemove={(
                                id,
                            ) =>
                                removeTextRow(
                                    setTips,
                                    id,
                                )
                            }
                        />
                    </div>

                    {contentError ? (
                        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {contentError}
                        </div>
                    ) : null}

                    {contentSuccess ? (
                        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                            {contentSuccess}
                        </div>
                    ) : null}

                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            disabled={
                                savingContent
                            }
                            onClick={
                                saveContent
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0c1724] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {savingContent ? (
                                <Loader2 className="h-4 w-4 animate-spin text-gold" />
                            ) : (
                                <Save className="h-4 w-4 text-gold" />
                            )}

                            {savingContent
                                ? "Saving Content..."
                                : "Save Destination Content"}
                        </button>
                    </div>
                </Section>

                <Section
                    title="Itinerary"
                    description="Build the day-by-day itinerary shown on this destination's public detail page."
                >
                    <div className="space-y-4">
                        {itineraries.length ? (
                            itineraries.map(
                                (
                                    item,
                                    index,
                                ) => (
                                    <div
                                        key={
                                            item.id
                                        }
                                        className="rounded-xl border border-black/10 bg-[#faf9f6] p-5"
                                    >
                                        <div className="grid gap-4 md:grid-cols-[140px_1fr_auto] md:items-end">
                                            <Field label="Day No.">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="1"
                                                    value={
                                                        item.dayNo
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        changeItinerary(
                                                            item.id,
                                                            "dayNo",
                                                            event.target.value,
                                                        )
                                                    }
                                                    className={
                                                        inputClass
                                                    }
                                                />
                                            </Field>

                                            <Field label="Title">
                                                <input
                                                    value={
                                                        item.title
                                                    }
                                                    placeholder="Example: Arrival in Kathmandu"
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        changeItinerary(
                                                            item.id,
                                                            "title",
                                                            event.target.value,
                                                        )
                                                    }
                                                    className={
                                                        inputClass
                                                    }
                                                />
                                            </Field>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeItinerary(
                                                        item.id,
                                                    )
                                                }
                                                aria-label={`Remove itinerary day ${index + 1}`}
                                                className="grid h-11 w-11 place-items-center rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="mt-4">
                                            <Field label="Description">
                                                <textarea
                                                    rows={4}
                                                    value={
                                                        item.description
                                                    }
                                                    placeholder="Describe what travellers will experience during this day."
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        changeItinerary(
                                                            item.id,
                                                            "description",
                                                            event.target.value,
                                                        )
                                                    }
                                                    className={
                                                        inputClass
                                                    }
                                                />
                                            </Field>
                                        </div>
                                    </div>
                                ),
                            )
                        ) : (
                            <div className="rounded-xl border border-dashed border-black/10 bg-[#faf9f6] p-6 text-center text-sm text-muted-foreground">
                                No itinerary days added yet.
                            </div>
                        )}
                    </div>

                    <div className="mt-5">
                        <button
                            type="button"
                            onClick={
                                addItinerary
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[#0c1724]"
                        >
                            <Plus className="h-4 w-4" />

                            Add Itinerary Day
                        </button>
                    </div>

                    {itineraryError ? (
                        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {itineraryError}
                        </div>
                    ) : null}

                    {itinerarySuccess ? (
                        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                            {itinerarySuccess}
                        </div>
                    ) : null}

                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            disabled={
                                savingItinerary
                            }
                            onClick={
                                saveItinerary
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0c1724] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {savingItinerary ? (
                                <Loader2 className="h-4 w-4 animate-spin text-gold" />
                            ) : (
                                <Save className="h-4 w-4 text-gold" />
                            )}

                            {savingItinerary
                                ? "Saving Itinerary..."
                                : "Save Itinerary"}
                        </button>
                    </div>
                </Section>

                <Section
                    title="Map Location"
                    description="Geographic coordinates used to position this destination on the public map."
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <Field label="Latitude">
                            <input
                                type="number"
                                min="-90"
                                max="90"
                                step="any"
                                value={
                                    latitude
                                }
                                placeholder="Example: 27.7172"
                                onChange={(
                                    event,
                                ) =>
                                    setLatitude(
                                        event.target.value,
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Longitude">
                            <input
                                type="number"
                                min="-180"
                                max="180"
                                step="any"
                                value={
                                    longitude
                                }
                                placeholder="Example: 85.3240"
                                onChange={(
                                    event,
                                ) =>
                                    setLongitude(
                                        event.target.value,
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground">
                        Provide both coordinates or leave both empty.
                    </p>

                    {mapError ? (
                        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {mapError}
                        </div>
                    ) : null}

                    {mapSuccess ? (
                        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                            {mapSuccess}
                        </div>
                    ) : null}

                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            disabled={
                                savingMap
                            }
                            onClick={
                                saveMapLocation
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0c1724] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {savingMap ? (
                                <Loader2 className="h-4 w-4 animate-spin text-gold" />
                            ) : (
                                <Save className="h-4 w-4 text-gold" />
                            )}

                            {savingMap
                                ? "Saving Map..."
                                : "Save Map Location"}
                        </button>
                    </div>
                </Section>

                <Section
                    title="Frequently Asked Questions"
                    description="Destination-specific questions and answers shown on the public destination page."
                >
                    <div className="space-y-4">
                        {faqs.length ? (
                            faqs.map(
                                (
                                    faq,
                                    index,
                                ) => (
                                    <div
                                        key={
                                            faq.id
                                        }
                                        className="rounded-xl border border-black/10 bg-[#faf9f6] p-5"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <p className="text-sm font-semibold text-[#0c1724]">
                                                FAQ {index + 1}
                                            </p>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeFaq(
                                                        faq.id,
                                                    )
                                                }
                                                aria-label={`Remove FAQ ${index + 1}`}
                                                className="grid h-10 w-10 place-items-center rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="mt-4">
                                            <Field label="Question">
                                                <input
                                                    value={
                                                        faq.question
                                                    }
                                                    placeholder="Example: What is the best time to visit?"
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        changeFaq(
                                                            faq.id,
                                                            "question",
                                                            event.target.value,
                                                        )
                                                    }
                                                    className={
                                                        inputClass
                                                    }
                                                />
                                            </Field>
                                        </div>

                                        <div className="mt-4">
                                            <Field label="Answer">
                                <textarea
                                    rows={4}
                                    value={
                                        faq.answer
                                    }
                                    placeholder="Enter the answer shown to travellers."
                                    onChange={(
                                        event,
                                    ) =>
                                        changeFaq(
                                            faq.id,
                                            "answer",
                                            event.target.value,
                                        )
                                    }
                                    className={
                                        inputClass
                                    }
                                />
                                            </Field>
                                        </div>
                                    </div>
                                ),
                            )
                        ) : (
                            <div className="rounded-xl border border-dashed border-black/10 bg-[#faf9f6] p-6 text-center text-sm text-muted-foreground">
                                No destination FAQs added yet.
                            </div>
                        )}
                    </div>

                    <div className="mt-5">
                        <button
                            type="button"
                            onClick={
                                addFaq
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[#0c1724]"
                        >
                            <Plus className="h-4 w-4" />

                            Add FAQ
                        </button>
                    </div>

                    {faqError ? (
                        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {faqError}
                        </div>
                    ) : null}

                    {faqSuccess ? (
                        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                            {faqSuccess}
                        </div>
                    ) : null}

                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            disabled={
                                savingFaqs
                            }
                            onClick={
                                saveFaqs
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0c1724] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {savingFaqs ? (
                                <Loader2 className="h-4 w-4 animate-spin text-gold" />
                            ) : (
                                <Save className="h-4 w-4 text-gold" />
                            )}

                            {savingFaqs
                                ? "Saving FAQs..."
                                : "Save FAQs"}
                        </button>
                    </div>
                </Section>

                {error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                ) : null}

                {success ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                        {success}
                    </div>
                ) : null}

                <div className="sticky bottom-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={
                            saving
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0c1724] px-6 py-3 text-sm font-semibold text-white shadow-xl disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gold" />
                        ) : (
                            <Save className="h-4 w-4 text-gold" />
                        )}

                        {saving
                            ? "Saving..."
                            : "Save Destination"}
                    </button>
                </div>
            </form>
        </div>
    );
}

function TextListEditor({
                            title,
                            description,
                            addLabel,
                            placeholder,
                            rows,
                            onAdd,
                            onChange,
                            onRemove,
                        }: {
    title:
        string;

    description:
        string;

    addLabel:
        string;

    placeholder:
        string;

    rows:
        TextRow[];

    onAdd:
        () => void;

    onChange:
        (
            id:
            string,
            value:
            string,
        ) => void;

    onRemove:
        (
            id:
            string,
        ) => void;
}) {
    return (
        <div className="rounded-xl border border-black/10 bg-[#faf9f6] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h3 className="text-sm font-semibold text-[#0c1724]">
                        {title}
                    </h3>

                    <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                        {description}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={
                        onAdd
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-[#0c1724]"
                >
                    <Plus className="h-4 w-4" />

                    {addLabel}
                </button>
            </div>

            <div className="mt-4 grid gap-3">
                {rows.length ? (
                    rows.map(
                        (
                            row,
                            index,
                        ) => (
                            <div
                                key={
                                    row.id
                                }
                                className="grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                            >
                                <div className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 bg-white text-xs font-semibold text-muted-foreground">
                                    {index + 1}
                                </div>

                                <textarea
                                    rows={2}
                                    value={
                                        row.value
                                    }
                                    placeholder={
                                        placeholder
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        onChange(
                                            row.id,
                                            event.target.value,
                                        )
                                    }
                                    className={
                                        inputClass
                                    }
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        onRemove(
                                            row.id,
                                        )
                                    }
                                    aria-label={`Remove ${title} item ${index + 1}`}
                                    className="grid h-11 w-11 place-items-center rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ),
                    )
                ) : (
                    <div className="rounded-xl border border-dashed border-black/10 bg-white p-5 text-center text-sm text-muted-foreground">
                        No {title.toLowerCase()} added yet.
                    </div>
                )}
            </div>
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
                   children,
               }: {
    label:
        string;

    children:
        ReactNode;
}) {
    return (
        <label className="block">
            <span className="text-sm font-semibold text-[#0c1724]">
                {label}
            </span>

            <div className="mt-2">
                {children}
            </div>
        </label>
    );
}