export const destinationMonthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
] as const;

export type DestinationBestSeasonInput = {
    fromMonth: number;
    toMonth: number;
};

export function getDestinationMonthLabel(
    month: number,
) {
    return (
        destinationMonthOptions.find(
            (item) => item.value === month,
        )?.label ?? ""
    );
}

export function formatDestinationBestSeasons(
    seasons: DestinationBestSeasonInput[],
) {
    return seasons
        .map((season) => {
            const from =
                getDestinationMonthLabel(
                    season.fromMonth,
                );

            const to =
                getDestinationMonthLabel(
                    season.toMonth,
                );

            if (!from || !to) {
                return "";
            }

            if (season.fromMonth === season.toMonth) {
                return from;
            }

            return `${from}–${to}`;
        })
        .filter(Boolean)
        .join(", ");
}

export function formatDestinationDuration(
    minimum: number | null,
    maximum: number | null,
) {
    if (
        minimum === null ||
        maximum === null
    ) {
        return null;
    }

    if (minimum === maximum) {
        return `${minimum} day${minimum === 1 ? "" : "s"}`;
    }

    return `${minimum}–${maximum} days`;
}

export function formatDestinationAltitude(
    minimum: number | null,
    maximum: number | null,
) {
    if (
        minimum === null ||
        maximum === null
    ) {
        return null;
    }

    if (minimum === maximum) {
        return `${minimum.toLocaleString("en-US")} m`;
    }

    return `${minimum.toLocaleString(
        "en-US",
    )} – ${maximum.toLocaleString(
        "en-US",
    )} m`;
}