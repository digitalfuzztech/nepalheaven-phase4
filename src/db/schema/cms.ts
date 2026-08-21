import { relations } from "drizzle-orm";
import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  varchar,
} from "drizzle-orm/mysql-core";
import {
  defaultMomentColumn,
  momentColumn,
  uuidColumn,
  uuidPrimaryColumn,
} from "./columns";
import { cmsOtherSettingsOptions } from "./cms-other-settings";
import { destinations } from "./destinations";
import { packages } from "./packages";
import { experienceCategories } from "./experiences";

export const blogCategories = mysqlTable("blog_categories", {
  id: uuidPrimaryColumn("id").primaryKey(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 191 }).notNull().unique(),
});

export const blogPosts = mysqlTable("blog_posts", {
  id: uuidPrimaryColumn("id").primaryKey(),
  categoryId: uuidColumn("category_id").references(() => blogCategories.id, {
    onDelete: "set null",
  }),
  blogTypeOptionId: uuidColumn("blog_type_option_id").references(
    () => cmsOtherSettingsOptions.id,
    { onDelete: "set null" },
  ),
  title: text("title").notNull(),
  slug: varchar("slug", { length: 191 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content"),
  coverImage: text("cover_image"),
  coverImageStorageKey: text("cover_image_storage_key"),
  authorName: text("author_name"),
  authorRole: text("author_role"),
  aboutAuthor: text("about_author"),
  readingTimeMinutes: int("reading_time_minutes"),
  status: text("status").default("draft").notNull(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  publishedAt: momentColumn("published_at"),
  createdAt: defaultMomentColumn("created_at").notNull(),
  updatedAt: defaultMomentColumn("updated_at").notNull(),
});

export const blogContentBlocks = mysqlTable("blog_content_blocks", {
  id: uuidPrimaryColumn("id").primaryKey(),
  blogPostId: uuidColumn("blog_post_id")
    .notNull()
    .references(() => blogPosts.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["text", "highlight", "image"]).notNull(),
  content: text("content"),
  imageUrl: text("image_url"),
  imageStorageKey: text("image_storage_key"),
  altText: text("alt_text"),
  caption: text("caption"),
  sortOrder: int("sort_order").default(0).notNull(),
  createdAt: defaultMomentColumn("created_at").notNull(),
  updatedAt: defaultMomentColumn("updated_at").notNull(),
});

export const blogHighlights = mysqlTable("blog_highlights", {
  id: uuidPrimaryColumn("id").primaryKey(),
  blogPostId: uuidColumn("blog_post_id")
    .notNull()
    .references(() => blogPosts.id, { onDelete: "cascade" }),
  item: text("item").notNull(),
  sortOrder: int("sort_order").default(0).notNull(),
});

export const testimonials = mysqlTable("testimonials", {
  id: uuidPrimaryColumn("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  content: text("content").notNull(),
  rating: text("rating"),
  tripName: text("trip_name"),
  avatarUrl: text("avatar_url"),
  avatarStorageKey: text("avatar_storage_key"),
  countryCode: varchar("country_code", { length: 2 }),
  associationType: mysqlEnum("association_type", [
    "destination",
    "package",
    "experience",
  ]),
  destinationId: uuidColumn("destination_id").references(
    () => destinations.id,
    { onDelete: "set null" },
  ),
  packageId: uuidColumn("package_id").references(() => packages.id, {
    onDelete: "set null",
  }),
  experienceId: uuidColumn("experience_id").references(
    () => experienceCategories.id,
    { onDelete: "set null" },
  ),
  sortOrder: int("sort_order").default(0).notNull(),
  status: text("status").default("published").notNull(),
  createdAt: defaultMomentColumn("created_at").notNull(),
  updatedAt: defaultMomentColumn("updated_at").notNull(),
});

export const blogCategoriesRelations = relations(
  blogCategories,
  ({ many }) => ({
    posts: many(blogPosts),
  }),
);

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  category: one(blogCategories, {
    fields: [blogPosts.categoryId],
    references: [blogCategories.id],
  }),
}));

export const faqs = mysqlTable("faqs", {
  id: uuidPrimaryColumn("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category"),
  sortOrder: text("sort_order").default("0").notNull(),
  status: text("status").default("published").notNull(),
});

export const siteSettings = mysqlTable("site_settings", {
  id: uuidPrimaryColumn("id").primaryKey(),
  key: varchar("key", { length: 191 }).notNull().unique(),
  value: text("value"),
  updatedAt: defaultMomentColumn("updated_at").notNull(),
});
