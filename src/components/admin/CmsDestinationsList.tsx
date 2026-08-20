import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useRouter,
} from "@tanstack/react-router";

import {
    LayoutTemplate,
    AlertTriangle,
    Eye,
    EyeOff,
    ExternalLink,
    Loader2,
    MapPinned,
    Pencil,
    Plus,
    Search,
    Trash2,
} from "lucide-react";

import type {
    CmsDestinationListItem,
} from "@/lib/cms-destinations.server";

import {
    deleteCmsDestinationFn,
    updateCmsDestinationStatusFn,
} from "@/lib/cms-destinations.functions";

export function CmsDestinationsList({
                                        destinations,
                                    }: {
    destinations:
        CmsDestinationListItem[];
}) {
    const router =
        useRouter();
    const [
        query,
        setQuery,
    ] =
        useState("");

    const [
        pendingAction,
        setPendingAction,
    ] =
        useState<{
            id:
                string;

            action:
                "publish" |
                "unpublish" |
                "delete";
        } | null>(
            null,
        );

    const [
        actionError,
        setActionError,
    ] =
        useState("");

    const [
        deleteTarget,
        setDeleteTarget,
    ] =
        useState<
            CmsDestinationListItem |
            null
        >(null);

    async function changeDestinationStatus(
        destination:
        CmsDestinationListItem,

        nextStatus:
        boolean,
    ) {
        if (
            pendingAction
        ) {
            return;
        }

        setActionError("");

        setPendingAction({
            id:
            destination.id,

            action:
                nextStatus
                    ? "publish"
                    : "unpublish",
        });

        try {
            await updateCmsDestinationStatusFn({
                data: {
                    id:
                    destination.id,

                    status:
                    nextStatus,
                },
            });

            await router.invalidate({
                sync:
                    true,
            });
        } catch (
            error
            ) {
            console.error(
                "Destination status update failed",
                error,
            );

            setActionError(
                error instanceof
                Error
                    ? error.message
                    : "Destination status could not be changed.",
            );
        } finally {
            setPendingAction(
                null,
            );
        }
    }

    function deleteDestination(
        destination:
        CmsDestinationListItem,
    ) {
        if (
            pendingAction
        ) {
            return;
        }

        setActionError("");

        setDeleteTarget(
            destination,
        );
    }

    async function confirmDeleteDestination() {
        if (
            !deleteTarget ||
            pendingAction
        ) {
            return;
        }

        const destination =
            deleteTarget;

        setActionError("");

        setPendingAction({
            id:
            destination.id,

            action:
                "delete",
        });

        try {
            await deleteCmsDestinationFn({
                data: {
                    id:
                    destination.id,
                },
            });

            /*
             * Close our custom dialog
             * only after deletion succeeds.
             */
            setDeleteTarget(
                null,
            );

            await router.invalidate({
                sync:
                    true,
            });
        } catch (
            error
            ) {
            console.error(
                "Destination deletion failed",
                error,
            );

            setActionError(
                error instanceof Error
                    ? error.message
                    : "Destination could not be deleted.",
            );
        } finally {
            setPendingAction(
                null,
            );
        }
    }

    useEffect(
        () => {
            if (
                !deleteTarget
            ) {
                return;
            }

            const previousOverflow =
                document.body.style.overflow;

            document.body.style.overflow =
                "hidden";

            const handleEscape = (
                event:
                KeyboardEvent,
            ) => {
                if (
                    event.key ===
                    "Escape" &&
                    !pendingAction
                ) {
                    setDeleteTarget(
                        null,
                    );
                }
            };

            window.addEventListener(
                "keydown",
                handleEscape,
            );

            return () => {
                document.body.style.overflow =
                    previousOverflow;

                window.removeEventListener(
                    "keydown",
                    handleEscape,
                );
            };
        },
        [
            deleteTarget,
            pendingAction,
        ],
    );

    const filtered =
        useMemo(() => {
            const normalized =
                query
                    .trim()
                    .toLowerCase();

            if (
                !normalized
            ) {
                return destinations;
            }

            return destinations.filter(
                (
                    destination,
                ) => {
                    const searchable =
                        [
                            destination.name,
                            destination.slug,
                            destination.region,
                            destination.category,
                            destination.difficulty,
                            destination.duration,
                        ]
                            .filter(
                                Boolean,
                            )
                            .join(
                                " ",
                            )
                            .toLowerCase();

                    return searchable.includes(
                        normalized,
                    );
                },
            );
        }, [
            destinations,
            query,
        ]);

    const publishedCount =
        destinations.filter(
            (
                destination,
            ) =>
                destination.status,
        ).length;

    const unpublishedCount =
        destinations.length -
        publishedCount;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Destination CMS
                    </p>

                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#0c1724]">
                        Destinations
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        Create and manage
                        Nepal Heaven
                        destinations,
                        content and
                        visibility.
                    </p>
                </div>

                <Link
                    to="/admin/cms/destinations/new"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0c1724] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#14283d]"
                >
                    <Plus
                        className="h-4 w-4 text-gold"
                        aria-hidden
                    />

                    Create destination
                </Link>
            </div>

            <Link
                to="/admin/cms/destinations/listing-page"
                className="group flex items-center justify-between gap-5 rounded-2xl border border-black/10 bg-white p-5 transition hover:border-gold/50 hover:shadow-sm"
            >
                <div className="flex min-w-0 items-center gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#0c1724] text-gold">
                        <LayoutTemplate
                            className="h-5 w-5"
                            aria-hidden
                        />
                    </div>

                    <div className="min-w-0">
                        <p className="font-semibold text-[#0c1724]">
                            Edit destinations listing page
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage the /destinations hero,
                            search text and public filters.
                        </p>
                    </div>
                </div>

                <span className="shrink-0 text-sm font-semibold text-gold transition-transform group-hover:translate-x-1">
        Edit →
    </span>
            </Link>

            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                    label="Total destinations"
                    value={
                        destinations.length
                    }
                />

                <StatCard
                    label="Published"
                    value={
                        publishedCount
                    }
                />

                <StatCard
                    label="Unpublished"
                    value={
                        unpublishedCount
                    }
                />
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4">
                <label className="flex items-center gap-3 rounded-xl border border-black/10 bg-[#f8f8f6] px-4 py-3">
                    <Search
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden
                    />

                    <span className="sr-only">
                        Search destinations
                    </span>

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
                        placeholder="Search name, slug, region, category, difficulty..."
                        className="w-full bg-transparent text-sm text-[#0c1724] outline-none placeholder:text-muted-foreground"
                    />
                </label>
            </div>
            {actionError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {actionError}
                </div>
            ) : null}

            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1080px] text-left">
                        <thead className="border-b border-black/10 bg-[#f8f8f6]">
                        <tr className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                            <th className="px-5 py-4">
                                Order
                            </th>

                            <th className="px-5 py-4">
                                Destination
                            </th>

                            <th className="px-5 py-4">
                                Region
                            </th>

                            <th className="px-5 py-4">
                                Category
                            </th>

                            <th className="px-5 py-4">
                                Difficulty
                            </th>

                            <th className="px-5 py-4">
                                Duration
                            </th>

                            <th className="px-5 py-4">
                                Status
                            </th>

                            <th className="px-5 py-4 text-right">
                                Actions
                            </th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-black/10">
                        {filtered.map(
                            (
                                destination,
                            ) => (
                                <tr
                                    key={
                                        destination.id
                                    }
                                    className="transition-colors hover:bg-black/[0.02]"
                                >
                                    <td className="px-5 py-4">
                                            <span className="inline-flex min-w-8 justify-center rounded-lg bg-black/5 px-2 py-1 text-xs font-semibold text-[#0c1724]">
                                                {
                                                    destination.sortOrder
                                                }
                                            </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0c1724] text-gold">
                                                <MapPinned
                                                    className="h-4 w-4"
                                                    aria-hidden
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="font-semibold text-[#0c1724]">
                                                    {
                                                        destination.name
                                                    }
                                                </p>

                                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                    /
                                                    {
                                                        destination.slug
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 text-sm text-muted-foreground">
                                        {destination.region ||
                                            "—"}
                                    </td>

                                    <td className="px-5 py-4 text-sm text-muted-foreground">
                                        {destination.category ||
                                            "—"}
                                    </td>

                                    <td className="px-5 py-4 text-sm text-muted-foreground">
                                        {destination.difficulty ||
                                            "—"}
                                    </td>

                                    <td className="px-5 py-4 text-sm text-muted-foreground">
                                        {destination.duration ||
                                            "—"}
                                    </td>

                                    <td className="px-5 py-4">
                                        {destination.status ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                                    <Eye
                                                        className="h-3.5 w-3.5"
                                                        aria-hidden
                                                    />

                                                    Published
                                                </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                                                    <EyeOff
                                                        className="h-3.5 w-3.5"
                                                        aria-hidden
                                                    />

                                                    Unpublished
                                                </span>
                                        )}
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Edit */}
                                            <Link
                                                to="/admin/cms/destinations/$id"
                                                params={{
                                                    id:
                                                    destination.id,
                                                }}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold text-[#0c1724] transition hover:bg-black/[0.04]"
                                            >
                                                <Pencil
                                                    className="h-3.5 w-3.5"
                                                    aria-hidden
                                                />

                                                Edit
                                            </Link>

                                            {/* Public page */}
                                            {destination.status ? (
                                                <a
                                                    href={`/destinations/${destination.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold text-[#0c1724] transition hover:border-gold hover:text-gold"
                                                >
                                                    <ExternalLink
                                                        className="h-3.5 w-3.5"
                                                        aria-hidden
                                                    />

                                                    View
                                                </a>
                                            ) : null}

                                            {/* Publish / Unpublish */}
                                            <button
                                                type="button"
                                                disabled={
                                                    pendingAction?.id ===
                                                    destination.id
                                                }
                                                onClick={() =>
                                                    changeDestinationStatus(
                                                        destination,
                                                        !destination.status,
                                                    )
                                                }
                                                className={
                                                    destination.status
                                                        ? "inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                        : "inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                }
                                            >
                                                {pendingAction?.id ===
                                                destination.id &&
                                                pendingAction.action !==
                                                "delete" ? (
                                                    <Loader2
                                                        className="h-3.5 w-3.5 animate-spin"
                                                        aria-hidden
                                                    />
                                                ) : destination.status ? (
                                                    <EyeOff
                                                        className="h-3.5 w-3.5"
                                                        aria-hidden
                                                    />
                                                ) : (
                                                    <Eye
                                                        className="h-3.5 w-3.5"
                                                        aria-hidden
                                                    />
                                                )}

                                                {destination.status
                                                    ? "Unpublish"
                                                    : "Publish"}
                                            </button>

                                            {/* Delete */}
                                            <button
                                                type="button"
                                                disabled={
                                                    pendingAction?.id ===
                                                    destination.id
                                                }
                                                onClick={() =>
                                                    deleteDestination(
                                                        destination,
                                                    )
                                                }
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {pendingAction?.id ===
                                                destination.id &&
                                                pendingAction.action ===
                                                "delete" ? (
                                                    <Loader2
                                                        className="h-3.5 w-3.5 animate-spin"
                                                        aria-hidden
                                                    />
                                                ) : (
                                                    <Trash2
                                                        className="h-3.5 w-3.5"
                                                        aria-hidden
                                                    />
                                                )}

                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ),
                        )}

                        {filtered.length ===
                        0 ? (
                            <tr>
                                <td
                                    colSpan={
                                        8
                                    }
                                    className="px-6 py-16 text-center"
                                >
                                    <p className="font-semibold text-[#0c1724]">
                                        No
                                        destinations
                                        found.
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Try a
                                        different
                                        search term.
                                    </p>
                                </td>
                            </tr>
                        ) : null}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-black/10 px-5 py-4 text-xs text-muted-foreground">
                    Showing{" "}
                    {
                        filtered.length
                    }{" "}
                    of{" "}
                    {
                        destinations.length
                    }{" "}
                    destinations
                </div>
            </div>

            {/* K12 - Delete Destination confirmation dialog */}
            {deleteTarget ? (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                    onMouseDown={() => {
                        if (
                            !pendingAction
                        ) {
                            setDeleteTarget(
                                null,
                            );
                        }
                    }}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-destination-title"
                        aria-describedby="delete-destination-description"
                        className="w-full max-w-lg overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl"
                        onMouseDown={(
                            event,
                        ) =>
                            event.stopPropagation()
                        }
                    >
                        {/* Header */}
                        <div className="flex items-start gap-4 border-b border-black/10 px-6 py-6">
                            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-600">
                                <AlertTriangle
                                    className="h-5 w-5"
                                    aria-hidden
                                />
                            </div>

                            <div className="min-w-0">
                                <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-red-600">
                                    Permanent action
                                </p>

                                <h2
                                    id="delete-destination-title"
                                    className="mt-1 text-xl font-semibold tracking-tight text-[#0c1724]"
                                >
                                    Delete destination?
                                </h2>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-6">
                            <p
                                id="delete-destination-description"
                                className="text-sm leading-6 text-muted-foreground"
                            >
                                You are about to permanently
                                delete{" "}
                                <span className="font-semibold text-[#0c1724]">
                                    {deleteTarget.name}
                                </span>
                                .
                            </p>

                            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50/70 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-700">
                                    This will delete
                                </p>

                                <ul className="mt-3 space-y-2 text-sm text-red-900/80">
                                    <li>
                                        • The destination itself
                                    </li>

                                    <li>
                                        • Highlights, tips and itinerary
                                    </li>

                                    <li>
                                        • Inclusions and exclusions
                                    </li>

                                    <li>
                                        • Destination FAQs and related destination content
                                    </li>

                                    <li>
                                        • Its directly uploaded hero image
                                    </li>
                                </ul>
                            </div>

                            <div className="mt-4 rounded-2xl border border-black/10 bg-[#f8f8f6] p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#0c1724]">
                                    Will not be deleted
                                </p>

                                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                                    <li>
                                        • Media Library files
                                    </li>

                                    <li>
                                        • Packages / tours
                                    </li>

                                    <li>
                                        • Existing leads
                                    </li>
                                </ul>

                                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                                    Their association with this
                                    destination will simply be removed.
                                </p>
                            </div>

                            <p className="mt-5 text-sm font-semibold text-red-700">
                                This action cannot be undone.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col-reverse gap-3 border-t border-black/10 bg-[#f8f8f6] px-6 py-5 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                disabled={
                                    pendingAction?.action ===
                                    "delete"
                                }
                                onClick={() =>
                                    setDeleteTarget(
                                        null,
                                    )
                                }
                                className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-5 text-sm font-semibold text-[#0c1724] transition hover:bg-black/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={
                                    pendingAction?.action ===
                                    "delete"
                                }
                                onClick={
                                    confirmDeleteDestination
                                }
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {pendingAction?.action ===
                                "delete" ? (
                                    <>
                                        <Loader2
                                            className="h-4 w-4 animate-spin"
                                            aria-hidden
                                        />

                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2
                                            className="h-4 w-4"
                                            aria-hidden
                                        />

                                        Delete permanently
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function StatCard({
                      label,
                      value,
                  }: {
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {label}
            </p>

            <p className="mt-2 text-3xl font-semibold text-[#0c1724]">
                {value}
            </p>
        </div>
    );
}