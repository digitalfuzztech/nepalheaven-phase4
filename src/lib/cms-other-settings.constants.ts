export const cmsOtherSettingsGroupValues = [
    "category",
    "difficulty",
    "destination_type",
    "package_type",
    "experience_type",
    "general_settings_type",
] as const;

export type CmsOtherSettingsGroup =
    (typeof cmsOtherSettingsGroupValues)[number];

export type CmsOtherSettingsOption = {
    id: string;

    groupKey:
        CmsOtherSettingsGroup;

    name: string;

    /*
     * Stable internal value.
     *
     * Admin does NOT edit this.
     * It allows later CMS modules to safely
     * refer to an option even if its visible
     * name is changed.
     */
    value: string;

    sortOrder: number;
};

export const cmsOtherSettingsGroups: Array<{
    key:
        CmsOtherSettingsGroup;

    title:
        string;

    description:
        string;

    placeholder:
        string;

    examples:
        string;
}> = [
    {
        key:
            "category",

        title:
            "Categories",

        description:
            "Categories used by the Media Library and other CMS content.",

        placeholder:
            "Enter category name",

        examples:
            "Destination, Packages, Experience, Blog, General",
    },

    {
        key:
            "difficulty",

        title:
            "Difficulty",

        description:
            "Difficulty levels available when managing journeys and destinations.",

        placeholder:
            "Enter difficulty",

        examples:
            "Easy, Moderate, Difficult, Challenging, Extreme",
    },

    {
        key:
            "destination_type",

        title:
            "Destination Type",

        description:
            "Destination classifications used by Destination CMS and destination filters.",

        placeholder:
            "Enter destination type",

        examples:
            "Wildlife, Lake, Culture, Mountains",
    },

    {
        key:
            "package_type",

        title:
            "Package Type",

        description:
            "Package classifications available when creating or editing packages.",

        placeholder:
            "Enter package type",

        examples:
            "Scenic Flight, Expedition, Basecamp Trek, Cultural Tour",
    },

    {
        key:
            "experience_type",

        title:
            "Experience Type",

        description:
            "Experience classifications available in Experience CMS.",

        placeholder:
            "Enter experience type",

        examples:
            "Adventure, Luxury Tours, Wellness, Pilgrimage, Cultural",
    },

    {
        key:
            "general_settings_type",

        title:
            "General Settings Type",

        description:
            "General Media classifications used when Media category is General.",

        placeholder:
            "Enter general settings type",

        examples:
            "Icons, Logo, Blogs, Certificates, Website Media",
    },
];