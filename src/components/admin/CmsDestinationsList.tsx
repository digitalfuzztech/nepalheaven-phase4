import {
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "@tanstack/react-router";

import {
    Eye,
    EyeOff,
    ExternalLink,
    MapPinned,
    Pencil,
    Plus,
    Search,
} from "lucide-react";

import type {
    CmsDestinationListItem,
} from "@/lib/cms-destinations.server";

export function CmsDestinationsList({
                                        destinations,
                                    }: {
    destinations:
        CmsDestinationListItem[];
}) {
    const [
        query,
        setQuery,
    ] =
        useState("");

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