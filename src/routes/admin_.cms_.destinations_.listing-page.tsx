import {
    createFileRoute,
    Link,
    redirect,
} from "@tanstack/react-router";

import {
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
    CmsMediaPicker,
} from "@/components/admin/CmsMediaPicker";

import {
    getAdminSessionFn,
} from "@/lib/auth.functions";

import {
    getCmsSelectableImagesFn,
} from "@/lib/cms-media.functions";

import {
    getCmsDestinationListingPageFn,
    updateCmsDestinationListingPageFn,
} from "@/lib/cms-destination-listing.functions";

import {
    cmsDestinationListingPageInputSchema,
    type CmsDestinationListingPageInput,
} from "@/lib/cms-destination-listing.schema";


export const Route =
    createFileRoute(
        "/admin_/cms_/destinations_/listing-page",
    )({
        loader:
            async () => {
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
                                "/admin/cms/destinations/listing-page",
                        },
                    });
                }

                const [
                    settings,
                    images,
                ] =
                    await Promise.all([
                        getCmsDestinationListingPageFn(),

                        getCmsSelectableImagesFn(),
                    ]);

                return {
                    settings,
                    images,
                };
            },

        component:
        DestinationListingPageEditor,
    });


type TextField =
    Exclude<
        keyof CmsDestinationListingPageInput,
        "heroMediaId"
    >;


function DestinationListingPageEditor() {
    const {
        settings,
        images,
    } =
        Route.useLoaderData();

    const [
        form,
        setForm,
    ] =
        useState<
            CmsDestinationListingPageInput
        >(
            settings,
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


    function updateField(
        field:
        TextField,

        value:
        string,
    ) {
        setForm(
            (
                current,
            ) => ({
                ...current,

                [field]:
                value,
            }),
        );
    }


    async function save(
        event:
        FormEvent,
    ) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const parsed =
            cmsDestinationListingPageInputSchema
                .safeParse(
                    form,
                );

        if (
            !parsed.success
        ) {
            setError(
                parsed.error.issues[0]
                    ?.message ??
                "Check the form and try again.",
            );

            return;
        }

        setBusy(
            true,
        );

        try {
            const updated =
                await updateCmsDestinationListingPageFn({
                    data:
                    parsed.data,
                });

            setForm(
                updated,
            );

            setSuccess(
                "Destinations listing page saved successfully.",
            );
        } catch (
            saveError
            ) {
            console.error(
                "Destinations listing page save failed",
                saveError,
            );

            setError(
                saveError instanceof Error
                    ? saveError.message
                    : "Destinations listing page could not be saved.",
            );
        } finally {
            setBusy(
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
                className="p-5 sm:p-7 lg:p-8"
            >
                {/* Header */}
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                    <div>
                        <Link
                            to="/admin/cms/destinations"
                            className="text-sm font-semibold text-muted-foreground transition hover:text-[#0c1724]"
                        >
                            ← Back to Destinations
                        </Link>

                        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-gold">
                            Destination CMS
                        </p>

                        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0c1724]">
                            Destinations Listing Page
                        </h1>

                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                            Manage the hero and search
                            presentation for the public
                            /destinations page.
                            Destination Type and Difficulty
                            filters are populated automatically
                            from Other Settings.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={
                            busy
                        }
                        className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0c1724] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16283b] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save
                            className="h-4 w-4"
                            aria-hidden
                        />

                        {busy
                            ? "Saving..."
                            : "Save Changes"}
                    </button>
                </div>

                {/* Feedback */}
                {error ? (
                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {
                            error
                        }
                    </div>
                ) : null}

                {success ? (
                    <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {
                            success
                        }
                    </div>
                ) : null}


                <div className="mt-8 grid gap-6">

                    {/* Hero */}
                    <SettingsSection
                        title="Hero"
                        description="Content displayed at the top of /destinations."
                    >
                        <CmsMediaPicker
                            label="Hero Image"
                            description="Select an image already uploaded to Media Library. If the image is later removed, the public page safely falls back to the existing destination listing image."
                            value={
                                form.heroMediaId
                            }
                            images={
                                images
                            }
                            onChange={(
                                id,
                            ) =>
                                setForm(
                                    (
                                        current,
                                    ) => ({
                                        ...current,

                                        heroMediaId:
                                        id,
                                    }),
                                )
                            }
                        />

                        <div className="mt-5 grid gap-5">
                            <CmsField
                                label="Subtitle"
                                value={
                                    form.subtitle
                                }
                                onChange={(
                                    value,
                                ) =>
                                    updateField(
                                        "subtitle",
                                        value,
                                    )
                                }
                            />

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

                            <CmsTextarea
                                label="Description"
                                value={
                                    form.description
                                }
                                rows={
                                    4
                                }
                                onChange={(
                                    value,
                                ) =>
                                    updateField(
                                        "description",
                                        value,
                                    )
                                }
                            />
                        </div>
                    </SettingsSection>


                    {/* Search */}
                    <SettingsSection
                        title="Search Form"
                        description="Text used by the destination search and filter panel."
                    >
                        <div className="grid gap-5 md:grid-cols-2">
                            <CmsField
                                label="Search Form Title"
                                value={
                                    form.searchTitle
                                }
                                onChange={(
                                    value,
                                ) =>
                                    updateField(
                                        "searchTitle",
                                        value,
                                    )
                                }
                            />

                            <CmsField
                                label="Search Placeholder"
                                value={
                                    form.searchPlaceholder
                                }
                                onChange={(
                                    value,
                                ) =>
                                    updateField(
                                        "searchPlaceholder",
                                        value,
                                    )
                                }
                            />
                        </div>
                    </SettingsSection>


                    {/* Filter source */}
                    <SettingsSection
                        title="Filters"
                        description="Filter values are managed centrally and do not need to be duplicated on this page."
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-black/10 bg-[#f8f8f6] p-4">
                                <p className="text-sm font-semibold text-[#0c1724]">
                                    Destination Type
                                </p>

                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                    Automatically loads all
                                    Destination Type options
                                    from CMS → Other Settings.
                                </p>
                            </div>

                            <div className="rounded-xl border border-black/10 bg-[#f8f8f6] p-4">
                                <p className="text-sm font-semibold text-[#0c1724]">
                                    Difficulty
                                </p>

                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                    Automatically loads all
                                    Difficulty options from
                                    CMS → Other Settings.
                                </p>
                            </div>
                        </div>
                    </SettingsSection>
                </div>
            </form>
        </AdminShell>
    );
}


function SettingsSection({
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
        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm lg:p-6">
            <div>
                <h2 className="text-lg font-semibold text-[#0c1724]">
                    {
                        title
                    }
                </h2>

                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {
                        description
                    }
                </p>
            </div>

            <div className="mt-5">
                {
                    children
                }
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

    onChange: (
        value:
        string,
    ) => void;
}) {
    return (
        <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-[#0c1724]">
                {
                    label
                }
            </span>

            <input
                type="text"
                value={
                    value
                }
                onChange={(
                    event,
                ) =>
                    onChange(
                        event.target.value,
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

    onChange: (
        value:
        string,
    ) => void;
}) {
    return (
        <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-[#0c1724]">
                {
                    label
                }
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
                        event.target.value,
                    )
                }
                className="resize-y rounded-xl border border-black/10 bg-white px-4 py-3 text-sm leading-relaxed text-[#0c1724] outline-none transition focus:border-gold"
            />
        </label>
    );
}