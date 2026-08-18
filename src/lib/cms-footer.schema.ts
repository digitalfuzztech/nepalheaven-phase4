import { z } from "zod";
import {
    cmsMediaIdSchema,
} from "@/lib/cms-media.schema";
export const cmsFooterSettingsInputSchema =
    z.object({
        companyDescription: z
            .string()
            .trim()
            .max(
                2000,
                "Company description must be 2,000 characters or fewer.",
            ),

        journalDescription: z
            .string()
            .trim()
            .max(
                1200,
                "Journal description must be 1,200 characters or fewer.",
            ),
        logoMediaId:
            cmsMediaIdSchema.nullable(),
    });

export type CmsFooterSettingsInput =
    z.infer<
        typeof cmsFooterSettingsInputSchema
    >;