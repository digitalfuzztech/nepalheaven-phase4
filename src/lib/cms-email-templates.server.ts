import {
    asc,
    eq,
} from "drizzle-orm";

import { db } from "@/db";

import {
    emailTemplates,
} from "@/db/schema/communications";

import {
    requireAdmin,
} from "@/lib/auth.server";

import {
    initialEmailTemplates,
} from "@/lib/email-template-seeds";

import {
    emailTemplateUpdateSchema,
    type EmailTemplateUpdateInput,
} from "@/lib/cms-email-templates.schema";

/*
|--------------------------------------------------------------------------
| Placeholder handling
|--------------------------------------------------------------------------
*/

const placeholderPattern =
    /{{\s*([A-Za-z][A-Za-z0-9_]*)\s*}}/g;

function extractPlaceholders(
    ...values: string[]
) {
    const placeholders =
        new Set<string>();

    for (const value of values) {
        for (
            const match of value.matchAll(
            placeholderPattern,
        )
            ) {
            const key = match[1];

            if (key) {
                placeholders.add(key);
            }
        }
    }

    return [
        ...placeholders,
    ].sort();
}

function getTemplateDefinition(
    key: string,
) {
    return initialEmailTemplates.find(
        (template) =>
            template.key === key,
    );
}

function getAllowedVariables(
    key: string,
) {
    const definition =
        getTemplateDefinition(key);

    if (!definition) {
        throw new Error(
            `Unknown system email template: ${key}`,
        );
    }

    return extractPlaceholders(
        definition.subject,
        definition.html,
        definition.text,
    );
}

function assertAllowedVariables(
    input: {
        key: string;

        subjectTemplate: string;

        htmlTemplate: string;

        textTemplate: string;
    },
) {
    const allowed =
        new Set(
            getAllowedVariables(
                input.key,
            ),
        );

    const used =
        extractPlaceholders(
            input.subjectTemplate,
            input.htmlTemplate,
            input.textTemplate,
        );

    const unknown =
        used.filter(
            (variable) =>
                !allowed.has(variable),
        );

    if (unknown.length > 0) {
        throw new Error(
            `Unknown template variable${
                unknown.length === 1
                    ? ""
                    : "s"
            }: ${unknown
                .map(
                    (item) =>
                        `{{${item}}}`,
                )
                .join(", ")}`,
        );
    }
}

/*
|--------------------------------------------------------------------------
| List
|--------------------------------------------------------------------------
*/

export async function getCmsEmailTemplates() {
    await requireAdmin();

    if (!db) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    const rows = await db
        .select({
            key: emailTemplates.key,

            name: emailTemplates.name,

            status:
            emailTemplates.status,

            subjectTemplate:
            emailTemplates.subjectTemplate,

            updatedAt:
            emailTemplates.updatedAt,
        })
        .from(emailTemplates)
        .orderBy(
            asc(emailTemplates.name),
        );

    return rows.map(
        (row) => ({
            ...row,

            updatedAt:
                row.updatedAt instanceof Date
                    ? row.updatedAt.toISOString()
                    : String(row.updatedAt),
        }),
    );
}

/*
|--------------------------------------------------------------------------
| Detail
|--------------------------------------------------------------------------
*/

export async function getCmsEmailTemplate(
    key: string,
) {
    await requireAdmin();

    if (!db) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    /*
     * Only canonical project templates
     * are editable through this CMS.
     */
    const definition =
        getTemplateDefinition(key);

    if (!definition) {
        throw new Error(
            "Email template is not a recognized Nepal Heaven system template.",
        );
    }

    const [template] =
        await db
            .select()
            .from(emailTemplates)
            .where(
                eq(
                    emailTemplates.key,
                    key,
                ),
            )
            .limit(1);

    if (!template) {
        throw new Error(
            `Email template not found: ${key}`,
        );
    }

    return {
        key:
        template.key,

        name:
        template.name,

        status:
        template.status,

        subjectTemplate:
        template.subjectTemplate,

        htmlTemplate:
        template.htmlTemplate,

        textTemplate:
        template.textTemplate,

        allowedVariables:
            getAllowedVariables(
                template.key,
            ),

        updatedAt:
            template.updatedAt instanceof
            Date
                ? template.updatedAt.toISOString()
                : String(
                    template.updatedAt,
                ),
    };
}

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

export async function updateCmsEmailTemplate(
    input: EmailTemplateUpdateInput,
) {
    await requireAdmin();

    if (!db) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    const data =
        emailTemplateUpdateSchema.parse(
            input,
        );

    /*
     * Prevent CMS from creating/editing
     * arbitrary template keys that are
     * unknown to application code.
     */
    const definition =
        getTemplateDefinition(
            data.key,
        );

    if (!definition) {
        throw new Error(
            "This is not a recognized system email template.",
        );
    }

    assertAllowedVariables({
        key: data.key,

        subjectTemplate:
        data.subjectTemplate,

        htmlTemplate:
        data.htmlTemplate,

        textTemplate:
        data.textTemplate,
    });

    const [existing] =
        await db
            .select({
                id: emailTemplates.id,
            })
            .from(emailTemplates)
            .where(
                eq(
                    emailTemplates.key,
                    data.key,
                ),
            )
            .limit(1);

    if (!existing) {
        throw new Error(
            "Email template does not exist.",
        );
    }

    await db
        .update(emailTemplates)
        .set({
            subjectTemplate:
            data.subjectTemplate,

            htmlTemplate:
            data.htmlTemplate,

            textTemplate:
            data.textTemplate,

            status:
            data.status,

            updatedAt:
                new Date(),
        })
        .where(
            eq(
                emailTemplates.id,
                existing.id,
            ),
        );

    return getCmsEmailTemplate(
        data.key,
    );
}