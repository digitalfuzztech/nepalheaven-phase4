import {
    Plus,
    Trash2,
} from "lucide-react";

import {
    useState,
} from "react";

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

const inputClass =
    "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#0c1724] outline-none transition focus:border-gold";

export function CmsDestinationItineraryCreateFields() {
    const [
        rows,
        setRows,
    ] =
        useState<
            ItineraryRow[]
        >([]);

    function addRow() {
        const nextDay =
            rows.length
                ? Math.max(
                ...rows.map(
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

        setRows(
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

    function changeRow(
        id:
        string,

        field:
            "dayNo" |
            "title" |
            "description",

        value:
        string,
    ) {
        setRows(
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

    function removeRow(
        id:
        string,
    ) {
        setRows(
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

    const serialized =
        rows
            .filter(
                (
                    item,
                ) =>
                    item.dayNo.trim() ||
                    item.title.trim() ||
                    item.description.trim(),
            )
            .map(
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
            );

    return (
        <section className="rounded-2xl border border-black/10 bg-white p-6">
            <h2 className="text-lg font-semibold text-[#0c1724]">
                Itinerary
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
                Add the day-by-day destination itinerary.
            </p>

            <input
                type="hidden"
                name="itineraries"
                value={
                    JSON.stringify(
                        serialized,
                    )
                }
            />

            <div className="mt-6 space-y-4">
                {rows.length ? (
                    rows.map(
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
                                    <label className="block">
                                        <span className="mb-2 block text-xs font-semibold text-[#0c1724]">
                                            Day No.
                                        </span>

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
                                                changeRow(
                                                    item.id,
                                                    "dayNo",
                                                    event.target.value,
                                                )
                                            }
                                            className={
                                                inputClass
                                            }
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="mb-2 block text-xs font-semibold text-[#0c1724]">
                                            Title
                                        </span>

                                        <input
                                            value={
                                                item.title
                                            }
                                            placeholder="Example: Arrival in Kathmandu"
                                            onChange={(
                                                event,
                                            ) =>
                                                changeRow(
                                                    item.id,
                                                    "title",
                                                    event.target.value,
                                                )
                                            }
                                            className={
                                                inputClass
                                            }
                                        />
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeRow(
                                                item.id,
                                            )
                                        }
                                        aria-label={`Remove itinerary day ${index + 1}`}
                                        className="grid h-11 w-11 place-items-center rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                <label className="mt-4 block">
                                    <span className="mb-2 block text-xs font-semibold text-[#0c1724]">
                                        Description
                                    </span>

                                    <textarea
                                        rows={4}
                                        value={
                                            item.description
                                        }
                                        placeholder="Describe this day's journey."
                                        onChange={(
                                            event,
                                        ) =>
                                            changeRow(
                                                item.id,
                                                "description",
                                                event.target.value,
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>
                            </div>
                        ),
                    )
                ) : (
                    <div className="rounded-xl border border-dashed border-black/10 bg-[#faf9f6] p-6 text-center text-sm text-muted-foreground">
                        No itinerary days added yet.
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={
                    addRow
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[#0c1724]"
            >
                <Plus className="h-4 w-4" />

                Add Itinerary Day
            </button>
        </section>
    );
}