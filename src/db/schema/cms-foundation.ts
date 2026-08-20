import {
  boolean,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

import { defaultMomentColumn, uuidColumn, uuidPrimaryColumn } from "./columns";

import { media } from "./media";
import { users } from "./users";

/*
|--------------------------------------------------------------------------
| Publishing
|--------------------------------------------------------------------------
*/

export const cmsPublishingStatusValues = [
  "draft",
  "published",
  "archived",
] as const;

/*
|--------------------------------------------------------------------------
| CMS Pages
|--------------------------------------------------------------------------
|
| Important:
|
| This is NOT a free-form page builder.
|
| React continues to control:
| - layout
| - responsive behavior
| - animation
| - visual structure
|
| CMS controls:
| - text/content
| - section visibility
| - SEO
| - featured references
|
*/

export const cmsPages = mysqlTable(
  "cms_pages",
  {
    id: uuidPrimaryColumn("id").primaryKey(),

    key: varchar("key", { length: 100 }).notNull(),

    name: varchar("name", { length: 180 }).notNull(),

    routePath: varchar("route_path", {
      length: 191,
    }),

    status: mysqlEnum("status", cmsPublishingStatusValues)
      .default("published")
      .notNull(),

    seoTitle: text("seo_title"),

    seoDescription: text("seo_description"),

    ogImageMediaId: uuidColumn("og_image_media_id").references(() => media.id, {
      onDelete: "set null",
    }),

    noIndex: boolean("no_index").default(false).notNull(),

    updatedByUserId: uuidColumn("updated_by_user_id").references(
      () => users.id,
      {
        onDelete: "set null",
      },
    ),

    createdAt: defaultMomentColumn("created_at").notNull(),

    updatedAt: defaultMomentColumn("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("cms_pages_key_unique").on(table.key),

    index("cms_pages_status_idx").on(table.status),
  ],
);

/*
|--------------------------------------------------------------------------
| CMS Page Sections
|--------------------------------------------------------------------------
|
| Example:
|
| page = home
|
| section keys:
| hero
| about
| destinations
| expert_quote
| packages
| adventures
| why_us
| testimonials
| gallery
| journal
| credibility
| cta
|
| The content column stores serialized JSON.
|
| Later CMS server code MUST validate each section through an explicit Zod
| schema before JSON is stored here.
|
*/

export const cmsPageSections = mysqlTable(
  "cms_page_sections",
  {
    id: uuidPrimaryColumn("id").primaryKey(),

    pageId: uuidColumn("page_id")
      .notNull()
      .references(() => cmsPages.id, {
        onDelete: "cascade",
      }),

    sectionKey: varchar("section_key", {
      length: 100,
    }).notNull(),

    schemaVersion: int("schema_version").default(1).notNull(),

    content: text("content").notNull(),

    enabled: boolean("enabled").default(true).notNull(),

    sortOrder: int("sort_order").default(0).notNull(),

    updatedByUserId: uuidColumn("updated_by_user_id").references(
      () => users.id,
      {
        onDelete: "set null",
      },
    ),

    createdAt: defaultMomentColumn("created_at").notNull(),

    updatedAt: defaultMomentColumn("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("cms_page_sections_page_section_unique").on(
      table.pageId,
      table.sectionKey,
    ),

    index("cms_page_sections_page_sort_idx").on(table.pageId, table.sortOrder),
  ],
);

/*
|--------------------------------------------------------------------------
| General Website Settings
|--------------------------------------------------------------------------
|
| There will normally be ONE canonical record:
|
| key = general
|
| Navbar, Footer, Contact and other website areas should eventually read
| common company identity/contact information from this record rather than
| maintaining duplicate values.
|
*/

export const cmsGeneralSettings = mysqlTable(
  "cms_general_settings",
  {
    id: uuidPrimaryColumn("id").primaryKey(),

    key: varchar("key", {
      length: 50,
    })
      .default("general")
      .notNull(),

    websiteName: text("website_name").notNull(),

    companyName: text("company_name").notNull(),

    tagline: text("tagline"),

    mainLogoMediaId: uuidColumn("main_logo_media_id").references(
      () => media.id,
      {
        onDelete: "set null",
      },
    ),

    lightLogoMediaId: uuidColumn("light_logo_media_id").references(
      () => media.id,
      {
        onDelete: "set null",
      },
    ),

    faviconMediaId: uuidColumn("favicon_media_id").references(() => media.id, {
      onDelete: "set null",
    }),

    address: text("address"),

    country: text("country"),

    phone: text("phone"),

    whatsapp: text("whatsapp"),

    email: text("email"),

    /*
     * Serialized JSON.
     *
     * Example:
     *
     * [
     *   {
     *     "day": "Monday – Friday",
     *     "time": "09:00 – 17:00"
     *   }
     * ]
     */
    officeHours: text("office_hours"),

    officeLatitude: decimal("office_latitude", { precision: 10, scale: 7 }),

    officeLongitude: decimal("office_longitude", { precision: 10, scale: 7 }),

    facebookUrl: text("facebook_url"),

    instagramUrl: text("instagram_url"),

    youtubeUrl: text("youtube_url"),

    tiktokUrl: text("tiktok_url"),

    linkedinUrl: text("linkedin_url"),

    xUrl: text("x_url"),

    copyrightText: text("copyright_text"),

    defaultSeoTitle: text("default_seo_title"),

    defaultSeoDescription: text("default_seo_description"),

    defaultOgImageMediaId: uuidColumn("default_og_image_media_id").references(
      () => media.id,
      {
        onDelete: "set null",
      },
    ),

    updatedByUserId: uuidColumn("updated_by_user_id").references(
      () => users.id,
      {
        onDelete: "set null",
      },
    ),

    createdAt: defaultMomentColumn("created_at").notNull(),

    updatedAt: defaultMomentColumn("updated_at").notNull(),
  },
  (table) => [uniqueIndex("cms_general_settings_key_unique").on(table.key)],
);

/*
|--------------------------------------------------------------------------
| Footer-specific Settings
|--------------------------------------------------------------------------
|
| Contact information and social links DO NOT belong here.
|
| They come from cms_general_settings.
|
*/

export const cmsFooterSettings = mysqlTable(
  "cms_footer_settings",
  {
    id: uuidPrimaryColumn("id").primaryKey(),

    key: varchar("key", {
      length: 50,
    })
      .default("footer")
      .notNull(),

    companyDescription: text("company_description"),

    journalDescription: text("journal_description"),

    /*
     * Optional footer-specific logo.
     *
     * NULL later means:
     * use General Settings light logo.
     */
    logoMediaId: uuidColumn("logo_media_id").references(() => media.id, {
      onDelete: "set null",
    }),

    updatedByUserId: uuidColumn("updated_by_user_id").references(
      () => users.id,
      {
        onDelete: "set null",
      },
    ),

    createdAt: defaultMomentColumn("created_at").notNull(),

    updatedAt: defaultMomentColumn("updated_at").notNull(),
  },
  (table) => [uniqueIndex("cms_footer_settings_key_unique").on(table.key)],
);

/*
|--------------------------------------------------------------------------
| Navigation
|--------------------------------------------------------------------------
*/

export const cmsNavigationLinkTypeValues = ["internal", "external"] as const;

export const cmsNavigationMenus = mysqlTable(
  "cms_navigation_menus",
  {
    id: uuidPrimaryColumn("id").primaryKey(),

    key: varchar("key", {
      length: 100,
    }).notNull(),

    name: varchar("name", {
      length: 180,
    }).notNull(),

    description: text("description"),

    createdAt: defaultMomentColumn("created_at").notNull(),

    updatedAt: defaultMomentColumn("updated_at").notNull(),
  },
  (table) => [uniqueIndex("cms_navigation_menus_key_unique").on(table.key)],
);

export const cmsNavigationItems = mysqlTable(
  "cms_navigation_items",
  {
    id: uuidPrimaryColumn("id").primaryKey(),

    menuId: uuidColumn("menu_id")
      .notNull()
      .references(() => cmsNavigationMenus.id, {
        onDelete: "cascade",
      }),

    label: varchar("label", {
      length: 180,
    }).notNull(),

    linkType: mysqlEnum("link_type", cmsNavigationLinkTypeValues)
      .default("internal")
      .notNull(),

    /*
     * Internal:
     * path = /destinations
     *
     * External:
     * url = https://example.com
     */
    path: varchar("path", {
      length: 500,
    }),

    url: text("url"),

    sortOrder: int("sort_order").default(0).notNull(),

    enabled: boolean("enabled").default(true).notNull(),

    openNewTab: boolean("open_new_tab").default(false).notNull(),

    createdAt: defaultMomentColumn("created_at").notNull(),

    updatedAt: defaultMomentColumn("updated_at").notNull(),
  },
  (table) => [
    index("cms_navigation_items_menu_sort_idx").on(
      table.menuId,
      table.sortOrder,
    ),
  ],
);

/*
|--------------------------------------------------------------------------
| Featured Content
|--------------------------------------------------------------------------
|
| This table references existing canonical entities without copying their
| content into page configuration.
|
| Example:
|
| groupKey   = home.destinations.primary
| entityType = destination
| entityId   = <actual destination UUID>
|
*/

export const cmsFeaturedEntityTypeValues = [
  "destination",
  "package",
  "experience",
  "blog_post",
  "testimonial",
  "media",
] as const;

export const cmsFeaturedContent = mysqlTable(
  "cms_featured_content",
  {
    id: uuidPrimaryColumn("id").primaryKey(),

    groupKey: varchar("group_key", {
      length: 150,
    }).notNull(),

    entityType: mysqlEnum("entity_type", cmsFeaturedEntityTypeValues).notNull(),

    /*
     * Polymorphic entity reference.
     *
     * There is intentionally no DB foreign key because this UUID can point
     * to several different entity tables.
     *
     * Later CMS services will validate the referenced record before saving.
     */
    entityId: uuidColumn("entity_id").notNull(),

    /*
     * Optional semantic slot:
     *
     * primary
     * secondary
     * hero
     * etc.
     */
    slot: varchar("slot", {
      length: 100,
    }),

    sortOrder: int("sort_order").default(0).notNull(),

    enabled: boolean("enabled").default(true).notNull(),

    updatedByUserId: uuidColumn("updated_by_user_id").references(
      () => users.id,
      {
        onDelete: "set null",
      },
    ),

    createdAt: defaultMomentColumn("created_at").notNull(),

    updatedAt: defaultMomentColumn("updated_at").notNull(),
  },
  (table) => [
    index("cms_featured_content_group_sort_idx").on(
      table.groupKey,
      table.sortOrder,
    ),

    uniqueIndex("cms_featured_content_group_entity_unique").on(
      table.groupKey,
      table.entityType,
      table.entityId,
    ),
  ],
);
