import {
    getCmsMediaAssociatedOptions,
    type CmsMediaClassificationOptions,
} from "@/lib/cms-media-classification";

export function CmsMediaClassificationFields({
                                                 options,
                                                 categoryOptionId,
                                                 associatedToId,
                                                 onCategoryChange,
                                                 onAssociatedToChange,
                                             }: {
    options:
        CmsMediaClassificationOptions;

    categoryOptionId:
        string;

    associatedToId:
        string;

    onCategoryChange:
        (
            value:
            string,
        ) => void;

    onAssociatedToChange:
        (
            value:
            string,
        ) => void;
}) {
    const association =
        getCmsMediaAssociatedOptions(
            options,
            categoryOptionId ||
            null,
        );

    const associationRequired =
        association.kind !==
        "none";

    return (
        <>
            <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#0c1724]">
                    Category
                </span>

                <select
                    value={
                        categoryOptionId
                    }
                    onChange={(
                        event,
                    ) => {
                        onCategoryChange(
                            event
                                .target
                                .value,
                        );

                        onAssociatedToChange(
                            "",
                        );
                    }}
                    className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm text-[#0c1724] outline-none transition focus:border-gold"
                >
                    <option value="">
                        None / Uncategorized
                    </option>

                    {options.categories.map(
                        (
                            category,
                        ) => (
                            <option
                                key={
                                    category.id
                                }
                                value={
                                    category.id
                                }
                            >
                                {
                                    category.name
                                }
                            </option>
                        ),
                    )}
                </select>
            </label>

            <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#0c1724]">
                    Associated To

                    {associationRequired ? (
                        <span className="ml-1 text-red-600">
                            *
                        </span>
                    ) : null}
                </span>

                <select
                    value={
                        associatedToId
                    }
                    disabled={
                        association.kind ===
                        "none"
                    }
                    required={
                        associationRequired
                    }
                    onChange={(
                        event,
                    ) =>
                        onAssociatedToChange(
                            event
                                .target
                                .value,
                        )
                    }
                    className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm text-[#0c1724] outline-none transition focus:border-gold disabled:cursor-not-allowed disabled:bg-black/[0.03] disabled:text-muted-foreground"
                >
                    <option value="">
                        {association.kind ===
                        "none"
                            ? "None / Not applicable"
                            : association.placeholder}
                    </option>

                    {association.options.map(
                        (
                            item,
                        ) => (
                            <option
                                key={
                                    item.id
                                }
                                value={
                                    item.id
                                }
                            >
                                {
                                    item.name
                                }
                            </option>
                        ),
                    )}
                </select>
            </label>
        </>
    );
}