import {
    index,
    int,
    mysqlTable,
    uniqueIndex,
    varchar,
} from "drizzle-orm/mysql-core";

import {
    defaultMomentColumn,
    uuidPrimaryColumn,
} from "./columns";

export const cmsOtherSettingsOptions =
    mysqlTable(
        "cms_other_settings_options",

        {
            id:
                uuidPrimaryColumn(
                    "id",
                ).primaryKey(),

            groupKey:
                varchar(
                    "group_key",
                    {
                        length:
                            50,
                    },
                ).notNull(),

            name:
                varchar(
                    "name",
                    {
                        length:
                            191,
                    },
                ).notNull(),

            /*
             * Stable internal key.
             *
             * Example:
             *
             * Visible name:
             * Basecamp Trek
             *
             * Internal value:
             * basecamp-trek
             *
             * If the visible name is edited later,
             * this value stays unchanged.
             */
            value:
                varchar(
                    "value",
                    {
                        length:
                            191,
                    },
                ).notNull(),

            sortOrder:
                int(
                    "sort_order",
                )
                    .default(0)
                    .notNull(),

            createdAt:
                defaultMomentColumn(
                    "created_at",
                ).notNull(),

            updatedAt:
                defaultMomentColumn(
                    "updated_at",
                ).notNull(),
        },

        (
            table,
        ) => [
            uniqueIndex(
                "cms_other_settings_group_value_unique",
            ).on(
                table.groupKey,
                table.value,
            ),

            index(
                "cms_other_settings_group_sort_idx",
            ).on(
                table.groupKey,
                table.sortOrder,
            ),
        ],
    );