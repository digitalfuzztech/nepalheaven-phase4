import { z } from "zod";

export const emailTemplateKeySchema =
    z
        .string()
        .trim()
        .min(1)
        .max(100)
        .regex(
            /^[a-z0-9_]+$/,
            "Invalid email template key.",
        );

export const emailTemplateStatusSchema =
    z.enum([
        "active",
        "inactive",
    ]);

export const emailTemplateUpdateSchema =
    z.object({
        key: emailTemplateKeySchema,

        subjectTemplate: z
            .string()
            .trim()
            .min(
                1,
                "Email subject is required.",
            )
            .max(
                998,
                "Email subject template is too long.",
            ),

        htmlTemplate: z
            .string()
            .trim()
            .min(
                1,
                "HTML email body is required.",
            )
            .max(
                200_000,
                "HTML email body is too large.",
            ),

        textTemplate: z
            .string()
            .trim()
            .min(
                1,
                "Plain-text email body is required.",
            )
            .max(
                100_000,
                "Plain-text email body is too large.",
            ),

        status:
        emailTemplateStatusSchema,
    });

export type EmailTemplateUpdateInput =
    z.infer<
        typeof emailTemplateUpdateSchema
    >;