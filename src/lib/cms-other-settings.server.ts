import {
    randomUUID,
} from "node:crypto";

import {
    and,
    asc,
    desc,
    eq,
} from "drizzle-orm";

import {
    db,
} from "@/db";

import {
    cmsOtherSettingsOptions,
} from "@/db/schema/cms-other-settings";

import {
    requireAdmin,
} from "@/lib/auth.server";

import {
    createCmsOtherSettingsOptionSchema,
    updateCmsOtherSettingsOptionSchema,
    type CreateCmsOtherSettingsOptionInput,
    type UpdateCmsOtherSettingsOptionInput,
} from "@/lib/cms-other-settings.schema";

import type {
    CmsOtherSettingsGroup,
    CmsOtherSettingsOption,
} from "@/lib/cms-other-settings.constants";

function requireCmsDb() {
    if (!db) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    return db;
}

function makeStableValue(
    name: string,
) {
    const value =
        name
            .trim()
            .toLowerCase()
            .replace(
                /[^a-z0-9]+/g,
                "-",
            )
            .replace(
                /^-+|-+$/g,
                "",
            );

    if (!value) {
        throw new Error(
            "Option name must contain at least one letter or number.",
        );
    }

    return value;
}

function mapOption(
    row:
    typeof cmsOtherSettingsOptions.$inferSelect,
): CmsOtherSettingsOption {
    return {
        id:
        row.id,

        groupKey:
            row.groupKey as
                CmsOtherSettingsGroup,

        name:
        row.name,

        value:
        row.value,

        sortOrder:
        row.sortOrder,
    };
}

/*
|--------------------------------------------------------------------------
| Read
|--------------------------------------------------------------------------
*/

export async function getCmsOtherSettingsOptions():
    Promise<
        CmsOtherSettingsOption[]
    > {
    await requireAdmin();

    const database =
        requireCmsDb();

    const rows =
        await database
            .select()
            .from(
                cmsOtherSettingsOptions,
            )
            .orderBy(
                asc(
                    cmsOtherSettingsOptions.groupKey,
                ),

                asc(
                    cmsOtherSettingsOptions.sortOrder,
                ),

                asc(
                    cmsOtherSettingsOptions.name,
                ),
            );

    return rows.map(
        mapOption,
    );
}

/*
|--------------------------------------------------------------------------
| Create
|--------------------------------------------------------------------------
*/

export async function createCmsOtherSettingsOption(
    input:
    CreateCmsOtherSettingsOptionInput,
) {
    await requireAdmin();

    const database =
        requireCmsDb();

    const data =
        createCmsOtherSettingsOptionSchema.parse(
            input,
        );

    const value =
        makeStableValue(
            data.name,
        );

    const [
        duplicate,
    ] =
        await database
            .select({
                id:
                cmsOtherSettingsOptions.id,
            })
            .from(
                cmsOtherSettingsOptions,
            )
            .where(
                and(
                    eq(
                        cmsOtherSettingsOptions.groupKey,
                        data.groupKey,
                    ),

                    eq(
                        cmsOtherSettingsOptions.value,
                        value,
                    ),
                ),
            )
            .limit(1);

    if (duplicate) {
        throw new Error(
            "This option already exists in this list.",
        );
    }

    const [
        last,
    ] =
        await database
            .select({
                sortOrder:
                cmsOtherSettingsOptions.sortOrder,
            })
            .from(
                cmsOtherSettingsOptions,
            )
            .where(
                eq(
                    cmsOtherSettingsOptions.groupKey,
                    data.groupKey,
                ),
            )
            .orderBy(
                desc(
                    cmsOtherSettingsOptions.sortOrder,
                ),
            )
            .limit(1);

    const id =
        randomUUID();

    await database
        .insert(
            cmsOtherSettingsOptions,
        )
        .values({
            id,

            groupKey:
            data.groupKey,

            name:
            data.name,

            value,

            sortOrder:
                (
                    last?.sortOrder ??
                    -1
                ) + 1,
        });

    return {
        id,
    };
}

/*
|--------------------------------------------------------------------------
| Update visible name
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| value is intentionally NOT changed here.
|
| Example:
|
| "Basecamp Trek"
| value = "basecamp-trek"
|
| Admin renames it:
|
| "Everest Basecamp Trek"
|
| The stable internal value remains:
|
| "basecamp-trek"
|
*/

export async function updateCmsOtherSettingsOption(
    input:
    UpdateCmsOtherSettingsOptionInput,
) {
    await requireAdmin();

    const database =
        requireCmsDb();

    const data =
        updateCmsOtherSettingsOptionSchema.parse(
            input,
        );

    const [
        current,
    ] =
        await database
            .select()
            .from(
                cmsOtherSettingsOptions,
            )
            .where(
                eq(
                    cmsOtherSettingsOptions.id,
                    data.id,
                ),
            )
            .limit(1);

    if (!current) {
        throw new Error(
            "Option could not be found.",
        );
    }

    const [
        duplicateName,
    ] =
        await database
            .select({
                id:
                cmsOtherSettingsOptions.id,
            })
            .from(
                cmsOtherSettingsOptions,
            )
            .where(
                and(
                    eq(
                        cmsOtherSettingsOptions.groupKey,
                        current.groupKey,
                    ),

                    eq(
                        cmsOtherSettingsOptions.name,
                        data.name,
                    ),
                ),
            )
            .limit(1);

    if (
        duplicateName &&
        duplicateName.id !==
        data.id
    ) {
        throw new Error(
            "Another option with this name already exists in this list.",
        );
    }

    await database
        .update(
            cmsOtherSettingsOptions,
        )
        .set({
            name:
            data.name,

            updatedAt:
                new Date(),
        })
        .where(
            eq(
                cmsOtherSettingsOptions.id,
                data.id,
            ),
        );

    return {
        id:
        data.id,
    };
}

/*
|--------------------------------------------------------------------------
| Delete
|--------------------------------------------------------------------------
*/

export async function deleteCmsOtherSettingsOption(
    id: string,
) {
    await requireAdmin();

    const database =
        requireCmsDb();

    const [
        current,
    ] =
        await database
            .select({
                id:
                cmsOtherSettingsOptions.id,
            })
            .from(
                cmsOtherSettingsOptions,
            )
            .where(
                eq(
                    cmsOtherSettingsOptions.id,
                    id,
                ),
            )
            .limit(1);

    if (!current) {
        throw new Error(
            "Option could not be found.",
        );
    }

    await database
        .delete(
            cmsOtherSettingsOptions,
        )
        .where(
            eq(
                cmsOtherSettingsOptions.id,
                id,
            ),
        );

    return {
        id,
    };
}