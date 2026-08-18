import { z } from "zod";

function isHttpUrl(value: string) {
    if (!value) return true;

    try {
        const url = new URL(value);

        return (
            url.protocol === "http:" ||
            url.protocol === "https:"
        );
    } catch {
        return false;
    }
}

const optionalText = (
    maxLength: number,
) =>
    z
        .string()
        .trim()
        .max(maxLength);

const optionalUrl = z
    .string()
    .trim()
    .max(500)
    .refine(
        isHttpUrl,
        "Enter a valid http:// or https:// URL.",
    );

const optionalEmail = z
    .string()
    .trim()
    .max(254)
    .refine(
        (value) =>
            value === "" ||
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                value,
            ),
        "Enter a valid email address.",
    );

export const cmsOfficeHourSchema =
    z.object({
        day: z
            .string()
            .trim()
            .min(
                1,
                "Office-hours day is required.",
            )
            .max(120),

        time: z
            .string()
            .trim()
            .min(
                1,
                "Office-hours time is required.",
            )
            .max(120),
    });

export const cmsOfficeHoursSchema =
    z
        .array(cmsOfficeHourSchema)
        .max(
            20,
            "A maximum of 20 office-hour rows is allowed.",
        );

export const cmsGeneralSettingsInputSchema =
    z.object({
        websiteName: z
            .string()
            .trim()
            .min(
                1,
                "Website name is required.",
            )
            .max(180),

        companyName: z
            .string()
            .trim()
            .min(
                1,
                "Company name is required.",
            )
            .max(180),

        tagline: optionalText(300),

        address: optionalText(500),

        country: optionalText(120),

        phone: optionalText(60),

        whatsapp: optionalText(60),

        email: optionalEmail,

        officeHours:
        cmsOfficeHoursSchema,

        facebookUrl: optionalUrl,

        instagramUrl: optionalUrl,

        youtubeUrl: optionalUrl,

        tiktokUrl: optionalUrl,

        linkedinUrl: optionalUrl,

        xUrl: optionalUrl,

        copyrightText:
            optionalText(500),

        defaultSeoTitle:
            optionalText(180),

        defaultSeoDescription:
            optionalText(500),
    });

export type CmsGeneralSettingsInput =
    z.infer<
        typeof cmsGeneralSettingsInputSchema
    >;