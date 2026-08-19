import {
  bigint,
    foreignKey,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  varchar,
} from "drizzle-orm/mysql-core";

import {
  defaultMomentColumn,
  uuidColumn,
  uuidPrimaryColumn,
} from "./columns";

import {
  users,
} from "./users";

import {
  destinations,
} from "./destinations";

import {
  packages,
} from "./packages";

import {
  experienceCategories,
} from "./experiences";

import {
  cmsOtherSettingsOptions,
} from "./cms-other-settings";

export const mediaTypeValues = [
  "image",
  "video",
] as const;

export const mediaLifecycleStatusValues = [
  "uploading",
  "processing",
  "ready",
  "failed",
  "archived",
] as const;

export const media = mysqlTable(
    "media",

    {
      id:
          uuidPrimaryColumn(
              "id",
          ).primaryKey(),

      type:
          mysqlEnum(
              "type",
              mediaTypeValues,
          ).notNull(),

      url:
          text(
              "url",
          ).notNull(),

      thumbnailUrl:
          text(
              "thumbnail_url",
          ),

      altText:
          text(
              "alt_text",
          ),

      title:
          text(
              "title",
          ),

      caption:
          text(
              "caption",
          ),

      provider:
          text(
              "provider",
          ),

      /*
      |--------------------------------------------------------------------------
      | Storage metadata
      |--------------------------------------------------------------------------
      */

      originalFilename:
          varchar(
              "original_filename",
              {
                length:
                    255,
              },
          ),

      storageProvider:
          varchar(
              "storage_provider",
              {
                length:
                    100,
              },
          ),

      storageKey:
          text(
              "storage_key",
          ),

      mimeType:
          varchar(
              "mime_type",
              {
                length:
                    191,
              },
          ),

      fileSizeBytes:
          bigint(
              "file_size_bytes",
              {
                mode:
                    "number",
              },
          ),

      width:
          int(
              "width",
          ),

      height:
          int(
              "height",
          ),

      durationSeconds:
          int(
              "duration_seconds",
          ),

      /*
      |--------------------------------------------------------------------------
      | Legacy category
      |--------------------------------------------------------------------------
      |
      | Keep this for existing Media rows while Media is migrated to the new
      | Other Settings-backed category relationship.
      |
      | New Media UI will use categoryOptionId.
      |
      */

      category:
          varchar(
              "category",
              {
                length:
                    100,
              },
          ),

      /*
      |--------------------------------------------------------------------------
      | CMS category
      |--------------------------------------------------------------------------
      |
      | References:
      |
      | /admin/cms/other-settings
      | → Categories
      |
      | NULL means:
      | None / Uncategorized
      |
      */

      categoryOptionId:
          uuidColumn(
              "category_option_id",
          ).references(
              () =>
                  cmsOtherSettingsOptions.id,
              {
                onDelete:
                    "set null",
              },
          ),

      /*
      |--------------------------------------------------------------------------
      | Associated destination
      |--------------------------------------------------------------------------
      */

      associatedDestinationId:
          uuidColumn(
              "associated_destination_id",
          ).references(
              () =>
                  destinations.id,
              {
                onDelete:
                    "set null",
              },
          ),

      /*
      |--------------------------------------------------------------------------
      | Associated package
      |--------------------------------------------------------------------------
      */

      associatedPackageId:
          uuidColumn(
              "associated_package_id",
          ).references(
              () =>
                  packages.id,
              {
                onDelete:
                    "set null",
              },
          ),

      /*
      |--------------------------------------------------------------------------
      | Associated experience
      |--------------------------------------------------------------------------
      */

      associatedExperienceId:
          uuidColumn(
              "associated_experience_id",
          ).references(
              () =>
                  experienceCategories.id,
              {
                onDelete:
                    "set null",
              },
          ),

      /*
      |--------------------------------------------------------------------------
      | General Settings Type
      |--------------------------------------------------------------------------
      |
      | Used when:
      |
      | Category = General
      |
      | Examples:
      |
      | Logo
      | Icons
      | Certificates
      | Website Media
      |
      */

        generalSettingsTypeOptionId:
            uuidColumn(
                "general_settings_type_option_id",
            ),
      lifecycleStatus:
          mysqlEnum(
              "lifecycle_status",
              mediaLifecycleStatusValues,
          )
              .default(
                  "ready",
              )
              .notNull(),

      processingError:
          text(
              "processing_error",
          ),

      sortOrder:
          int(
              "sort_order",
          )
              .default(
                  0,
              )
              .notNull(),

      createdByUserId:
          uuidColumn(
              "created_by_user_id",
          ).references(
              () =>
                  users.id,
              {
                onDelete:
                    "set null",
              },
          ),

      /*
      |--------------------------------------------------------------------------
      | Timestamps
      |--------------------------------------------------------------------------
      |
      | createdAt is the Media upload date.
      |
      */

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
        foreignKey({
            name:
                "media_general_type_option_fk",

            columns: [
                table.generalSettingsTypeOptionId,
            ],

            foreignColumns: [
                cmsOtherSettingsOptions.id,
            ],
        })
            .onDelete(
                "set null",
            )
            .onUpdate(
                "no action",
            ),
      index(
          "media_category_option_idx",
      ).on(
          table.categoryOptionId,
      ),

      index(
          "media_destination_idx",
      ).on(
          table.associatedDestinationId,
      ),

      index(
          "media_package_idx",
      ).on(
          table.associatedPackageId,
      ),

      index(
          "media_experience_idx",
      ).on(
          table.associatedExperienceId,
      ),

      index(
          "media_general_settings_type_idx",
      ).on(
          table.generalSettingsTypeOptionId,
      ),

      index(
          "media_created_at_idx",
      ).on(
          table.createdAt,
      ),
    ],
);