import {
    createServerFn,
} from "@tanstack/react-start";

import { z } from "zod";

import {
    emailTemplateKeySchema,
    emailTemplateUpdateSchema,
} from "@/lib/cms-email-templates.schema";

export const getCmsEmailTemplatesFn =
    createServerFn({
        method: "GET",
    }).handler(async () => {
        const server =
            await import(
                "@/lib/cms-email-templates.server"
                );

        return server.getCmsEmailTemplates();
    });

export const getCmsEmailTemplateFn =
    createServerFn({
        method: "GET",
    })
        .validator(
            z.object({
                key:
                emailTemplateKeySchema,
            }),
        )
        .handler(
            async ({ data }) => {
                const server =
                    await import(
                        "@/lib/cms-email-templates.server"
                        );

                return server.getCmsEmailTemplate(
                    data.key,
                );
            },
        );

export const updateCmsEmailTemplateFn =
    createServerFn({
        method: "POST",
    })
        .validator(
            emailTemplateUpdateSchema,
        )
        .handler(
            async ({ data }) => {
                const server =
                    await import(
                        "@/lib/cms-email-templates.server"
                        );

                return server.updateCmsEmailTemplate(
                    data,
                );
            },
        );