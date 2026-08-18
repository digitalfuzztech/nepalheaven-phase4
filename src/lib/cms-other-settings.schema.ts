import {
    z,
} from "zod";

import {
    cmsOtherSettingsGroupValues,
} from "@/lib/cms-other-settings.constants";

export const cmsOtherSettingsGroupSchema =
    z.enum(
        cmsOtherSettingsGroupValues,
    );

const optionNameSchema =
    z
        .string()
        .trim()
        .min(
            1,
            "Option name is required.",
        )
        .max(
            191,
            "Option name is too long.",
        );

export const createCmsOtherSettingsOptionSchema =
    z.object({
        groupKey:
        cmsOtherSettingsGroupSchema,

        name:
        optionNameSchema,
    });

export const updateCmsOtherSettingsOptionSchema =
    z.object({
        id:
            z.string().uuid(),

        name:
        optionNameSchema,
    });

export const deleteCmsOtherSettingsOptionSchema =
    z.object({
        id:
            z.string().uuid(),
    });

export type CreateCmsOtherSettingsOptionInput =
    z.infer<
        typeof createCmsOtherSettingsOptionSchema
    >;

export type UpdateCmsOtherSettingsOptionInput =
    z.infer<
        typeof updateCmsOtherSettingsOptionSchema
    >;