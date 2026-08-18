import {
    useState,
    type FormEvent,
    type ReactNode,
} from "react";

import {
    Link,
    useRouter,
} from "@tanstack/react-router";

import {
    ArrowLeft,
    CheckCircle2,
    ExternalLink,
    Loader2,
    Save,
} from "lucide-react";

import type {
    CmsDestinationDetail,
} from "@/lib/cms-destinations.server";

import {
    updateCmsDestinationCoreFn,
} from "@/lib/cms-destinations.functions";

const inputClass =
    "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#0c1724] outline-none transition-colors placeholder:text-muted-foreground focus:border-[#0c1724]";

const textareaClass =
    "w-full resize-y rounded-xl border border-black/10 bg-white px-4 py-3 text-sm leading-relaxed text-[#0c1724] outline-none transition-colors placeholder:text-muted-foreground focus:border-[#0c1724]";

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

export function CmsDestinationEditor({
                                         detail,
                                     }: {
    detail:
        CmsDestinationDetail;
}) {
    const router =
        useRouter();

    const destination =
        detail.destination;

    const [
        name,
        setName,
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
        saving,
        setSaving,
    ] =
        useState(false);

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

        setSaving(true);
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

                    name,

                    slug,

                    shortDescription:
                        String(
                            formData.get(
                                "shortDescription",
                            ) ?? "",
                        ),

                    description:
                        String(
                            formData.get(
                                "description",
                            ) ?? "",
                        ),

                    region:
                        String(
                            formData.get(
                                "region",
                            ) ?? "",
                        ),

                    category:
                        String(
                            formData.get(
                                "category",
                            ) ?? "",
                        ),

                    difficulty:
                        String(
                            formData.get(
                                "difficulty",
                            ) ?? "",
                        ),

                    duration:
                        String(
                            formData.get(
                                "duration",
                            ) ?? "",
                        ),

                    bestSeason:
                        String(
                            formData.get(
                                "bestSeason",
                            ) ?? "",
                        ),

                    altitudeLabel:
                        String(
                            formData.get(
                                "altitudeLabel",
                            ) ?? "",
                        ),

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

                    cancellationFeePercentage:
                        nullableNumber(
                            formData.get(
                                "cancellationFeePercentage",
                            ),
                        ),

                    sortOrder:
                        Number(
                            formData.get(
                                "sortOrder",
                            ) ?? 0,
                        ),
                },
            });

            setSuccess(
                "Destination saved successfully.",
            );

            await router.invalidate();
        } catch (
            caught
            ) {
            console.error(
                "Destination update failed",
                caught,
            );

            setError(
                caught instanceof Error
                    ? caught.message
                    : "Destination could not be saved.",
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="mx-auto max-w-6xl">
            {/* Top navigation */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link
                    to="/admin/cms/destinations"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-[#0c1724]"
                >
                    <ArrowLeft
                        className="h-4 w-4"
                        aria-hidden
                    />

                    Back to destinations
                </Link>

                {destination.status ? (
                    <a
                        href={`/destinations/${destination.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#0c1724] transition hover:text-gold"
                    >
                        View public page

                        <ExternalLink
                            className="h-4 w-4"
                            aria-hidden
                        />
                    </a>
                ) : null}
            </div>

            {/* Heading */}
            <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Destination CMS
                    </p>

                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#0c1724]">
                        {destination.name}
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        /destinations/
                        {destination.slug}
                    </p>
                </div>

                <StatusBadge
                    published={
                        destination.status
                    }
                />
            </div>

            {destination.status ? (
                <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
                    <p className="text-sm font-semibold text-emerald-800">
                        This destination is
                        currently published.
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Saved content changes
                        can appear on the
                        public destination
                        page immediately.
                        Publishing controls
                        will be added in a
                        later checkpoint.
                    </p>
                </div>
            ) : (
                <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
                    <p className="text-sm font-semibold text-[#0c1724]">
                        This destination is
                        currently unpublished.
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                        You can safely build
                        its content before it
                        becomes public.
                    </p>
                </div>
            )}

            <form
                onSubmit={
                    submit
                }
                className="mt-7 space-y-6"
            >
                {/* Identity */}
                <section className="rounded-2xl border border-black/10 bg-white p-6 sm:p-7">
                    <SectionHeading
                        title="Identity"
                        description="Destination name, URL and classification."
                    />

                    <div className="mt-7 grid gap-5 sm:grid-cols-2">
                        <Field
                            label="Destination name"
                            required
                        >
                            <input
                                type="text"
                                required
                                value={
                                    name
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setName(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field
                            label="Slug"
                            required
                            hint="Changing this changes the public destination URL."
                        >
                            <input
                                type="text"
                                required
                                value={
                                    slug
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setSlug(
                                        event
                                            .target
                                            .value
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

                        <Field label="Region">
                            <input
                                name="region"
                                type="text"
                                defaultValue={
                                    destination.region ??
                                    ""
                                }
                                placeholder="Khumbu"
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Category">
                            <input
                                name="category"
                                type="text"
                                list="destination-categories"
                                defaultValue={
                                    destination.category ??
                                    ""
                                }
                                placeholder="Mountains"
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Difficulty">
                            <input
                                name="difficulty"
                                type="text"
                                list="destination-difficulties"
                                defaultValue={
                                    destination.difficulty ??
                                    ""
                                }
                                placeholder="Challenging"
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Duration">
                            <input
                                name="duration"
                                type="text"
                                defaultValue={
                                    destination.duration ??
                                    ""
                                }
                                placeholder="12–16 days"
                                className={
                                    inputClass
                                }
                            />
                        </Field>
                    </div>

                    <datalist id="destination-categories">
                        <option value="Mountains" />
                        <option value="Culture" />
                        <option value="Wildlife" />
                        <option value="Lakes" />
                        <option value="Adventure" />
                    </datalist>

                    <datalist id="destination-difficulties">
                        <option value="Easy" />
                        <option value="Moderate" />
                        <option value="Challenging" />
                    </datalist>
                </section>

                {/* Overview */}
                <section className="rounded-2xl border border-black/10 bg-white p-6 sm:p-7">
                    <SectionHeading
                        title="Overview"
                        description="Primary public-facing destination copy."
                    />

                    <div className="mt-7 space-y-5">
                        <Field
                            label="Short overview"
                            hint="Used in cards, hero copy and destination summaries."
                        >
                            <textarea
                                name="shortDescription"
                                rows={4}
                                defaultValue={
                                    destination.shortDescription ??
                                    ""
                                }
                                placeholder="A concise introduction to the destination..."
                                className={
                                    textareaClass
                                }
                            />
                        </Field>

                        <Field
                            label="Full description"
                            hint="Main overview shown on the destination detail page."
                        >
                            <textarea
                                name="description"
                                rows={10}
                                defaultValue={
                                    destination.description ??
                                    ""
                                }
                                placeholder="Write the complete destination overview..."
                                className={
                                    textareaClass
                                }
                            />
                        </Field>
                    </div>
                </section>

                {/* Travel information */}
                <section className="rounded-2xl border border-black/10 bg-white p-6 sm:p-7">
                    <SectionHeading
                        title="Travel information"
                        description="Season, altitude and operational information."
                    />

                    <div className="mt-7 grid gap-5 sm:grid-cols-2">
                        <Field label="Best season">
                            <input
                                name="bestSeason"
                                type="text"
                                defaultValue={
                                    destination.bestSeason ??
                                    ""
                                }
                                placeholder="March–May, October–November"
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field
                            label="Altitude display"
                            hint='Public display value, e.g. "2,860 – 5,545 m".'
                        >
                            <input
                                name="altitudeLabel"
                                type="text"
                                defaultValue={
                                    destination.altitudeLabel ??
                                    ""
                                }
                                placeholder="2,860 – 5,545 m"
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Minimum altitude (m)">
                            <input
                                name="minAltitude"
                                type="number"
                                step="1"
                                defaultValue={
                                    destination.minAltitude ??
                                    ""
                                }
                                placeholder="2860"
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Maximum altitude (m)">
                            <input
                                name="maxAltitude"
                                type="number"
                                step="1"
                                defaultValue={
                                    destination.maxAltitude ??
                                    ""
                                }
                                placeholder="5545"
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field
                            label="Cancellation fee (%)"
                            hint="Destination-level cancellation policy value."
                        >
                            <input
                                name="cancellationFeePercentage"
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                defaultValue={
                                    destination.cancellationFeePercentage ??
                                    ""
                                }
                                placeholder="10"
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field
                            label="Sort order"
                            hint="Lower numbers appear first."
                        >
                            <input
                                name="sortOrder"
                                type="number"
                                min="0"
                                step="1"
                                defaultValue={
                                    destination.sortOrder
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>
                    </div>
                </section>

                {/* Future sections */}
                <section className="rounded-2xl border border-dashed border-black/15 bg-black/[0.02] p-6">
                    <p className="text-sm font-semibold text-[#0c1724]">
                        More destination
                        content is coming
                        directly into this
                        editor.
                    </p>

                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        Hero media and SEO
                        come next, followed
                        by highlights, travel
                        tips, itinerary,
                        inclusions,
                        exclusions, gallery
                        and map/location
                        management.
                    </p>
                </section>

                {error ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4 text-sm font-medium text-red-700">
                        {error}
                    </div>
                ) : null}

                {success ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 text-sm font-medium text-emerald-800">
                        <CheckCircle2
                            className="h-5 w-5 shrink-0"
                            aria-hidden
                        />

                        {success}
                    </div>
                ) : null}

                <div className="sticky bottom-4 z-20 flex justify-end">
                    <button
                        type="submit"
                        disabled={
                            saving ||
                            !name.trim() ||
                            !slug.trim()
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0c1724] px-6 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-[#14283d] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader2
                                className="h-4 w-4 animate-spin text-gold"
                                aria-hidden
                            />
                        ) : (
                            <Save
                                className="h-4 w-4 text-gold"
                                aria-hidden
                            />
                        )}

                        {saving
                            ? "Saving..."
                            : "Save destination"}
                    </button>
                </div>
            </form>
        </div>
    );
}

function StatusBadge({
                         published,
                     }: {
    published: boolean;
}) {
    return published ? (
        <span className="inline-flex w-fit rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700">
            Published
        </span>
    ) : (
        <span className="inline-flex w-fit rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-800">
            Unpublished
        </span>
    );
}

function SectionHeading({
                            title,
                            description,
                        }: {
    title: string;
    description: string;
}) {
    return (
        <div>
            <h2 className="text-lg font-semibold text-[#0c1724]">
                {title}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

function Field({
                   label,
                   hint,
                   required = false,
                   children,
               }: {
    label: string;
    hint?: string;
    required?: boolean;
    children: ReactNode;
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

            {hint ? (
                <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">
                    {hint}
                </span>
            ) : null}
        </label>
    );
}