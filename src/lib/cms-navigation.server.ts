import {
    randomUUID,
} from "node:crypto";

import {
    asc,
    eq,
} from "drizzle-orm";

import { db } from "@/db";

import {
    cmsNavigationItems,
    cmsNavigationMenus,
} from "@/db/schema/cms-foundation";

import {
    requireAdmin,
} from "@/lib/auth.server";

import {
    cmsNavigationMenuDefinitions,
} from "@/lib/cms-config";

import {
    cmsNavigationMenuUpdateSchema,
    type CmsNavigationMenuUpdateInput,
} from "@/lib/cms-navigation.schema";

/*
|--------------------------------------------------------------------------
| Known system menus
|--------------------------------------------------------------------------
*/

function getMenuDefinition(
    key: string,
) {
    return (
        cmsNavigationMenuDefinitions.find(
            (menu) =>
                menu.key === key,
        ) ?? null
    );
}

/*
|--------------------------------------------------------------------------
| List
|--------------------------------------------------------------------------
*/

export async function getCmsNavigationMenus() {
    await requireAdmin();

    if (!db) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    const menus =
        await db
            .select({
                id:
                cmsNavigationMenus.id,

                key:
                cmsNavigationMenus.key,

                name:
                cmsNavigationMenus.name,

                description:
                cmsNavigationMenus.description,
            })
            .from(
                cmsNavigationMenus,
            )
            .orderBy(
                asc(
                    cmsNavigationMenus.name,
                ),
            );

    const items =
        await db
            .select({
                menuId:
                cmsNavigationItems.menuId,
            })
            .from(
                cmsNavigationItems,
            );

    const countByMenu =
        new Map<
            string,
            number
        >();

    for (const item of items) {
        countByMenu.set(
            item.menuId,
            (
                countByMenu.get(
                    item.menuId,
                ) ?? 0
            ) + 1,
        );
    }

    return menus.map(
        (menu) => ({
            key:
            menu.key,

            name:
            menu.name,

            description:
                menu.description ?? "",

            itemCount:
                countByMenu.get(
                    menu.id,
                ) ?? 0,
        }),
    );
}

/*
|--------------------------------------------------------------------------
| Detail
|--------------------------------------------------------------------------
*/

export async function getCmsNavigationMenu(
    key: string,
) {
    await requireAdmin();

    if (!db) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    const definition =
        getMenuDefinition(key);

    if (!definition) {
        throw new Error(
            "Unknown CMS navigation menu.",
        );
    }

    const [menu] =
        await db
            .select({
                id:
                cmsNavigationMenus.id,

                key:
                cmsNavigationMenus.key,

                name:
                cmsNavigationMenus.name,

                description:
                cmsNavigationMenus.description,
            })
            .from(
                cmsNavigationMenus,
            )
            .where(
                eq(
                    cmsNavigationMenus.key,
                    key,
                ),
            )
            .limit(1);

    if (!menu) {
        throw new Error(
            `Navigation menu not found: ${key}`,
        );
    }

    const items =
        await db
            .select({
                label:
                cmsNavigationItems.label,

                linkType:
                cmsNavigationItems.linkType,

                path:
                cmsNavigationItems.path,

                url:
                cmsNavigationItems.url,

                enabled:
                cmsNavigationItems.enabled,

                openNewTab:
                cmsNavigationItems.openNewTab,

                sortOrder:
                cmsNavigationItems.sortOrder,
            })
            .from(
                cmsNavigationItems,
            )
            .where(
                eq(
                    cmsNavigationItems.menuId,
                    menu.id,
                ),
            )
            .orderBy(
                asc(
                    cmsNavigationItems.sortOrder,
                ),
            );

    return {
        key:
        menu.key,

        name:
        menu.name,

        description:
            menu.description ?? "",

        items:
            items.map(
                (item) => ({
                    label:
                    item.label,

                    linkType:
                    item.linkType,

                    path:
                        item.path ?? "",

                    url:
                        item.url ?? "",

                    enabled:
                    item.enabled,

                    openNewTab:
                    item.openNewTab,
                }),
            ),
    };
}

/*
|--------------------------------------------------------------------------
| Replace menu items
|--------------------------------------------------------------------------
|
| The menu itself is a system identity.
|
| Admin may edit its items, but cannot:
| - rename the key
| - create random system menus
| - delete the system menu
|
| Navigation items have no external database references, so replacing the
| set transactionally is simpler and safer than complex individual CRUD.
|
*/

export async function updateCmsNavigationMenu(
    input:
    CmsNavigationMenuUpdateInput,
) {
    await requireAdmin();

    if (!db) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    const data =
        cmsNavigationMenuUpdateSchema.parse(
            input,
        );

    const definition =
        getMenuDefinition(
            data.key,
        );

    if (!definition) {
        throw new Error(
            "This is not a recognized Nepal Heaven navigation menu.",
        );
    }

    const [menu] =
        await db
            .select({
                id:
                cmsNavigationMenus.id,
            })
            .from(
                cmsNavigationMenus,
            )
            .where(
                eq(
                    cmsNavigationMenus.key,
                    data.key,
                ),
            )
            .limit(1);

    if (!menu) {
        throw new Error(
            "Navigation menu does not exist.",
        );
    }

    await db.transaction(
        async (tx) => {
            await tx
                .delete(
                    cmsNavigationItems,
                )
                .where(
                    eq(
                        cmsNavigationItems.menuId,
                        menu.id,
                    ),
                );

            if (
                data.items.length >
                0
            ) {
                await tx
                    .insert(
                        cmsNavigationItems,
                    )
                    .values(
                        data.items.map(
                            (
                                item,
                                index,
                            ) => ({
                                id:
                                    randomUUID(),

                                menuId:
                                menu.id,

                                label:
                                item.label,

                                linkType:
                                item.linkType,

                                path:
                                    item.linkType ===
                                    "internal"
                                        ? item.path
                                        : null,

                                url:
                                    item.linkType ===
                                    "external"
                                        ? item.url
                                        : null,

                                /*
                                 * Array order is the
                                 * canonical menu order.
                                 */
                                sortOrder:
                                    (
                                        index +
                                        1
                                    ) *
                                    10,

                                enabled:
                                item.enabled,

                                openNewTab:
                                item.openNewTab,
                            }),
                        ),
                    );
            }
        },
    );

    return getCmsNavigationMenu(
        data.key,
    );
}