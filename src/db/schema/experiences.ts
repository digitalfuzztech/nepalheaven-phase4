import { boolean, int, mysqlTable, text, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import { packages } from "./packages";
import { defaultMomentColumn, uuidColumn, uuidPrimaryColumn } from "./columns";
import { cmsOtherSettingsOptions } from "./cms-other-settings";

export const experienceCategories = mysqlTable("experience_categories", {
  id: uuidPrimaryColumn("id").primaryKey(), slug: varchar("slug", { length: 191 }).notNull().unique(), name: text("name").notNull(),
  shortDescription: text("short_description"), description: text("description"), heroImage: text("hero_image"), sortOrder: int("sort_order").default(0).notNull(),
  heroImageStorageKey: text("hero_image_storage_key"), experienceTypeOptionId: uuidColumn("experience_type_option_id").references(() => cmsOtherSettingsOptions.id, { onDelete: "set null" }),
  experienceType: text("experience_type"), cardLinkText: text("card_link_text"), overview: text("overview"),
  status: boolean("status").default(true).notNull(), seoTitle: text("seo_title"), seoDescription: text("seo_description"),
  createdAt: defaultMomentColumn("created_at").notNull(), updatedAt: defaultMomentColumn("updated_at").notNull(),
});
export const experienceItineraries = mysqlTable("experience_itineraries", {
  id: uuidPrimaryColumn("id").primaryKey(), experienceId: uuidColumn("experience_id").notNull().references(() => experienceCategories.id, { onDelete: "cascade" }),
  minDay: int("min_day").notNull(), maxDay: int("max_day").notNull(), title: text("title").notNull(), description: text("description"), sortOrder: int("sort_order").default(0).notNull(),
  createdAt: defaultMomentColumn("created_at").notNull(), updatedAt: defaultMomentColumn("updated_at").notNull(),
});
export const experienceFaqs = mysqlTable("experience_faqs", {
  id: uuidPrimaryColumn("id").primaryKey(), experienceId: uuidColumn("experience_id").notNull().references(() => experienceCategories.id, { onDelete: "cascade" }),
  question: text("question").notNull(), answer: text("answer").notNull(), sortOrder: int("sort_order").default(0).notNull(),
  createdAt: defaultMomentColumn("created_at").notNull(), updatedAt: defaultMomentColumn("updated_at").notNull(),
});
export const experienceInclusions = mysqlTable("experience_inclusions", {
  id: uuidPrimaryColumn("id").primaryKey(), experienceId: uuidColumn("experience_id").notNull().references(() => experienceCategories.id, { onDelete: "cascade" }),
  item: text("item").notNull(), sortOrder: int("sort_order").default(0).notNull(),
});
export const experienceExclusions = mysqlTable("experience_exclusions", {
  id: uuidPrimaryColumn("id").primaryKey(), experienceId: uuidColumn("experience_id").notNull().references(() => experienceCategories.id, { onDelete: "cascade" }),
  item: text("item").notNull(), sortOrder: int("sort_order").default(0).notNull(),
});
export const experienceHighlights = mysqlTable("experience_highlights", {
  id: uuidPrimaryColumn("id").primaryKey(), experienceId: uuidColumn("experience_id").notNull().references(() => experienceCategories.id, { onDelete: "cascade" }),
  item: text("item").notNull(), sortOrder: int("sort_order").default(0).notNull(),
});
export const experiencePackages = mysqlTable("experience_packages", {
  id: uuidPrimaryColumn("id").primaryKey(), experienceId: uuidColumn("experience_id").notNull().references(() => experienceCategories.id, { onDelete: "cascade" }),
  packageId: uuidColumn("package_id").notNull().references(() => packages.id, { onDelete: "cascade" }), sortOrder: int("sort_order").default(0).notNull(),
}, (table) => [uniqueIndex("experience_packages_experience_package_unique").on(table.experienceId, table.packageId)]);
