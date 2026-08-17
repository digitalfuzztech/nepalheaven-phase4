import {
  bigint,
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

import { users } from "./users";

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

export const media = mysqlTable("media", {
  id: uuidPrimaryColumn("id").primaryKey(),

  type: mysqlEnum(
      "type",
      mediaTypeValues,
  ).notNull(),

  url: text("url").notNull(),

  thumbnailUrl: text("thumbnail_url"),

  altText: text("alt_text"),

  title: text("title"),

  caption: text("caption"),

  provider: text("provider"),

  /*
  |--------------------------------------------------------------------------
  | Phase 4 Media Library metadata
  |--------------------------------------------------------------------------
  */

  originalFilename: varchar(
      "original_filename",
      {
        length: 255,
      },
  ),

  storageProvider: varchar(
      "storage_provider",
      {
        length: 100,
      },
  ),

  storageKey: text("storage_key"),

  mimeType: varchar("mime_type", {
    length: 191,
  }),

  fileSizeBytes: bigint(
      "file_size_bytes",
      {
        mode: "number",
      },
  ),

  width: int("width"),

  height: int("height"),

  durationSeconds: int(
      "duration_seconds",
  ),

  category: varchar("category", {
    length: 100,
  }),

  lifecycleStatus: mysqlEnum(
      "lifecycle_status",
      mediaLifecycleStatusValues,
  )
      .default("ready")
      .notNull(),

  processingError: text(
      "processing_error",
  ),

  sortOrder: int("sort_order")
      .default(0)
      .notNull(),

  createdByUserId: uuidColumn(
      "created_by_user_id",
  ).references(() => users.id, {
    onDelete: "set null",
  }),

  createdAt: defaultMomentColumn(
      "created_at",
  ).notNull(),

  updatedAt: defaultMomentColumn(
      "updated_at",
  ).notNull(),
});