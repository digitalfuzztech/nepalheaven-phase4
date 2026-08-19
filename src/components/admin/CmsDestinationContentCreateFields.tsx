import {
    Plus,
    Trash2,
} from "lucide-react";

import {
    useState,
} from "react";

type TextRow = {
    id:
        string;

    value:
        string;
};

const inputClass =
    "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#0c1724] outline-none transition focus:border-gold";

function cleanRows(
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

export function CmsDestinationContentCreateFields() {
    const [
        highlights,
        setHighlights,
    ] =
        useState<
            TextRow[]
        >([]);

    const [
        inclusions,
        setInclusions,
    ] =
        useState<
            TextRow[]
        >([]);

    const [
        exclusions,
        setExclusions,
    ] =
        useState<
            TextRow[]
        >([]);

    const [
        tips,
        setTips,
    ] =
        useState<
            TextRow[]
        >([]);

    return (
        <section className="rounded-2xl border border-black/10 bg-white p-6">
            <h2 className="text-lg font-semibold text-[#0c1724]">
                Destination Content
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
                Add highlights, inclusions, exclusions and practical travel tips for this destination.
            </p>

            {/*
            |--------------------------------------------------------------------------
            | Serialized values included automatically in parent FormData
            |--------------------------------------------------------------------------
            */}

            <input
                type="hidden"
                name="highlights"
                value={
                    JSON.stringify(
                        cleanRows(
                            highlights,
                        ),
                    )
                }
            />

            <input
                type="hidden"
                name="inclusions"
                value={
                    JSON.stringify(
                        cleanRows(
                            inclusions,
                        ),
                    )
                }
            />

            <input
                type="hidden"
                name="exclusions"
                value={
                    JSON.stringify(
                        cleanRows(
                            exclusions,
                        ),
                    )
                }
            />

            <input
                type="hidden"
                name="tips"
                value={
                    JSON.stringify(
                        cleanRows(
                            tips,
                        ),
                    )
                }
            />

            <div className="mt-6 grid gap-8">
                <CreateTextList
                    title="Highlights"
                    description="The standout experiences and important reasons to visit this destination."
                    addLabel="Add Highlight"
                    placeholder="Example: Panoramic Himalayan views"
                    rows={
                        highlights
                    }
                    setRows={
                        setHighlights
                    }
                />

                <CreateTextList
                    title="Inclusions"
                    description="Services, activities or facilities included for this destination."
                    addLabel="Add Inclusion"
                    placeholder="Example: Local sightseeing"
                    rows={
                        inclusions
                    }
                    setRows={
                        setInclusions
                    }
                />

                <CreateTextList
                    title="Exclusions"
                    description="Items or services travellers should arrange separately."
                    addLabel="Add Exclusion"
                    placeholder="Example: International airfare"
                    rows={
                        exclusions
                    }
                    setRows={
                        setExclusions
                    }
                />

                <CreateTextList
                    title="Travel Tips"
                    description="Useful practical information travellers should know before visiting."
                    addLabel="Add Travel Tip"
                    placeholder="Example: Carry warm layers even during trekking season"
                    rows={
                        tips
                    }
                    setRows={
                        setTips
                    }
                />
            </div>
        </section>
    );
}

function CreateTextList({
                            title,
                            description,
                            addLabel,
                            placeholder,
                            rows,
                            setRows,
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

    setRows:
        React.Dispatch<
            React.SetStateAction<
                TextRow[]
            >
        >;
}) {
    function add() {
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

    function change(
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

    function remove(
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
                        add
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
                                        change(
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
                                        remove(
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