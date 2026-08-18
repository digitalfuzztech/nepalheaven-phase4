export type CmsMediaEntityOption = {
    id: string;
    name: string;
    slug: string;
};

export type CmsMediaOtherSettingOption = {
    id: string;
    name: string;
    value: string;
};

export type CmsMediaClassificationOptions = {
    categories: CmsMediaOtherSettingOption[];

    generalSettingsTypes:
        CmsMediaOtherSettingOption[];

    destinations:
        CmsMediaEntityOption[];

    packages:
        CmsMediaEntityOption[];

    experiences:
        CmsMediaEntityOption[];
};

export type CmsMediaAssociationKind =
    | "destination"
    | "package"
    | "experience"
    | "general"
    | "none";

export function getCmsMediaAssociationKind(
    categoryValue:
        string | null | undefined,
): CmsMediaAssociationKind {
    const normalized =
        (
            categoryValue ??
            ""
        )
            .trim()
            .toLowerCase();

    if (
        normalized ===
        "destination" ||
        normalized ===
        "destinations"
    ) {
        return "destination";
    }

    if (
        normalized ===
        "package" ||
        normalized ===
        "packages"
    ) {
        return "package";
    }

    if (
        normalized ===
        "experience" ||
        normalized ===
        "experiences"
    ) {
        return "experience";
    }

    if (
        normalized ===
        "general"
    ) {
        return "general";
    }

    return "none";
}

export function getCmsMediaCategory(
    options:
    CmsMediaClassificationOptions,

    categoryOptionId:
        string | null | undefined,
) {
    if (
        !categoryOptionId
    ) {
        return null;
    }

    return (
        options.categories.find(
            (
                option,
            ) =>
                option.id ===
                categoryOptionId,
        ) ?? null
    );
}

export function getCmsMediaAssociatedOptions(
    options:
    CmsMediaClassificationOptions,

    categoryOptionId:
        string | null | undefined,
) {
    const category =
        getCmsMediaCategory(
            options,
            categoryOptionId,
        );

    const kind =
        getCmsMediaAssociationKind(
            category?.value,
        );

    switch (
        kind
        ) {
        case "destination":
            return {
                kind,

                label:
                    "Destination",

                placeholder:
                    "Select destination",

                options:
                options.destinations,
            } as const;

        case "package":
            return {
                kind,

                label:
                    "Package",

                placeholder:
                    "Select package",

                options:
                options.packages,
            } as const;

        case "experience":
            return {
                kind,

                label:
                    "Experience",

                placeholder:
                    "Select experience",

                options:
                options.experiences,
            } as const;

        case "general":
            return {
                kind,

                label:
                    "General Type",

                placeholder:
                    "Select general type",

                options:
                    options
                        .generalSettingsTypes
                        .map(
                            (
                                option,
                            ) => ({
                                id:
                                option.id,

                                name:
                                option.name,

                                slug:
                                option.value,
                            }),
                        ),
            } as const;

        default:
            return {
                kind:
                    "none" as const,

                label:
                    "Associated To",

                placeholder:
                    "Not applicable",

                options:
                    [],
            };
    }
}