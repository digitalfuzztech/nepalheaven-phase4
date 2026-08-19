import {
    z,
} from "zod";

export const cmsDestinationFaqItemSchema =
    z.object({
        question:
            z
                .string()
                .trim()
                .min(
                    1,
                    "FAQ question is required.",
                )
                .max(
                    1000,
                    "FAQ question is too long.",
                ),

        answer:
            z
                .string()
                .trim()
                .min(
                    1,
                    "FAQ answer is required.",
                )
                .max(
                    10000,
                    "FAQ answer is too long.",
                ),
    });

export const cmsDestinationFaqUpdateInputSchema =
    z.object({
        id:
            z
                .string()
                .uuid(),

        faqs:
            z
                .array(
                    cmsDestinationFaqItemSchema,
                )
                .max(
                    100,
                    "Too many FAQs.",
                ),
    });

export type CmsDestinationFaqUpdateInput =
    z.infer<
        typeof cmsDestinationFaqUpdateInputSchema
    >;