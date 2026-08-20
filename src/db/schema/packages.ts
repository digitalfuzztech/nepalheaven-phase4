import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  foreignKey,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { destinations } from "./destinations";
import { cmsOtherSettingsOptions } from "./cms-other-settings";
import { defaultMomentColumn, uuidColumn, uuidPrimaryColumn } from "./columns";

export const packageDifficultyValues = [
  "easy",
  "moderate",
  "challenging",
  "extreme",
] as const;

export const cancellationFeeTypeValues = ["fixed", "percentage"] as const;

export const packages = mysqlTable(
  "packages",
  {
    id: uuidPrimaryColumn("id").primaryKey(),
    destinationId: uuidColumn("destination_id").references(
      () => destinations.id,
      {
        onDelete: "set null",
      },
    ),
    title: text("title").notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    destinationLabel: text("destination_label"),
    packageTypeOptionId: uuidColumn("package_type_option_id"),
    style: text("style"),
    shortDescription: text("short_description"),
    description: text("description"),
    overview: text("overview"),
    durationMinDays: int("duration_min_days"),
    durationMaxDays: int("duration_max_days"),
    days: int("days"),
    difficultyOptionId: uuidColumn("difficulty_option_id"),
    difficulty: text("difficulty"),
    groupSizeMin: int("group_size_min"),
    groupSizeMax: int("group_size_max"),
    maxAltitude: int("max_altitude"),
    startingPrice: decimal("starting_price", { precision: 12, scale: 2 }),
    oldPrice: decimal("old_price", { precision: 12, scale: 2 }),
    currency: text("currency").default("USD").notNull(),
    cancellationFeePercentage: decimal("cancellation_fee_percentage", {
      precision: 5,
      scale: 2,
    }),
    cancellationFeeType: mysqlEnum(
      "cancellation_fee_type",
      cancellationFeeTypeValues,
    ),
    cancellationFeeValue: decimal("cancellation_fee_value", {
      precision: 12,
      scale: 2,
    }),
    cancellationPolicyText: text("cancellation_policy_text"),
    rating: decimal("rating", { precision: 3, scale: 2 }),
    reviewCount: int("review_count").default(0).notNull(),
    heroImage: text("hero_image"),
    heroImageStorageKey: text("hero_image_storage_key"),
    sortOrder: int("sort_order").default(0).notNull(),
    status: boolean("status").default(true).notNull(),
    featured: boolean("featured").default(false).notNull(),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    createdAt: defaultMomentColumn("created_at").notNull(),
    updatedAt: defaultMomentColumn("updated_at").notNull(),
  },
  (table) => [
    foreignKey({
      name: "packages_type_option_fk",
      columns: [table.packageTypeOptionId],
      foreignColumns: [cmsOtherSettingsOptions.id],
    })
      .onDelete("set null")
      .onUpdate("no action"),
    foreignKey({
      name: "packages_difficulty_option_fk",
      columns: [table.difficultyOptionId],
      foreignColumns: [cmsOtherSettingsOptions.id],
    })
      .onDelete("set null")
      .onUpdate("no action"),
  ],
);

export const packageDestinations = mysqlTable(
  "package_destinations",
  {
    id: uuidPrimaryColumn("id").primaryKey(),
    packageId: uuidColumn("package_id")
      .notNull()
      .references(() => packages.id, { onDelete: "cascade" }),
    destinationId: uuidColumn("destination_id")
      .notNull()
      .references(() => destinations.id, { onDelete: "cascade" }),
    sortOrder: int("sort_order").default(0).notNull(),
  },
  (table) => [
    uniqueIndex("package_destinations_package_destination_unique").on(
      table.packageId,
      table.destinationId,
    ),
  ],
);

export const packageHighlights = mysqlTable("package_highlights", {
  id: uuidPrimaryColumn("id").primaryKey(),
  packageId: uuidColumn("package_id")
    .notNull()
    .references(() => packages.id, { onDelete: "cascade" }),
  item: text("item").notNull(),
  sortOrder: int("sort_order").default(0).notNull(),
});

export const packageTiers = mysqlTable("package_tiers", {
  id: uuidPrimaryColumn("id").primaryKey(),
  packageId: uuidColumn("package_id")
    .notNull()
    .references(() => packages.id, { onDelete: "cascade" }),
  tierOptionId: uuidColumn("tier_option_id").references(
    () => cmsOtherSettingsOptions.id,
    { onDelete: "set null" },
  ),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("USD").notNull(),
  sortOrder: int("sort_order").default(0).notNull(),
});

export const packageItineraries = mysqlTable("package_itineraries", {
  id: uuidPrimaryColumn("id").primaryKey(),
  packageId: uuidColumn("package_id")
    .notNull()
    .references(() => packages.id, { onDelete: "cascade" }),
  // Kept for existing numeric itineraries. New content should use dayLabel.
  day: int("day"),
  dayLabel: text("day_label"),
  minDay: int("min_day"),
  maxDay: int("max_day"),
  title: text("title").notNull(),
  description: text("description"),
  accommodation: text("accommodation"),
  meals: text("meals"),
  altitude: int("altitude"),
  sortOrder: int("sort_order").default(0).notNull(),
});

export const packageReviews = mysqlTable("package_reviews", {
  id: uuidPrimaryColumn("id").primaryKey(),
  packageId: uuidColumn("package_id")
    .notNull()
    .references(() => packages.id, { onDelete: "cascade" }),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  reviewText: text("review_text").notNull(),
  customerName: text("customer_name").notNull(),
  customerCountryCode: varchar("customer_country_code", {
    length: 2,
  }).notNull(),
  sortOrder: int("sort_order").default(0).notNull(),
  createdAt: defaultMomentColumn("created_at").notNull(),
  updatedAt: defaultMomentColumn("updated_at").notNull(),
});

export const packageFaqs = mysqlTable("package_faqs", {
  id: uuidPrimaryColumn("id").primaryKey(),
  packageId: uuidColumn("package_id")
    .notNull()
    .references(() => packages.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: int("sort_order").default(0).notNull(),
  createdAt: defaultMomentColumn("created_at").notNull(),
  updatedAt: defaultMomentColumn("updated_at").notNull(),
});

export const packageInclusions = mysqlTable("package_inclusions", {
  id: uuidPrimaryColumn("id").primaryKey(),
  packageId: uuidColumn("package_id")
    .notNull()
    .references(() => packages.id, { onDelete: "cascade" }),
  item: text("item").notNull(),
  sortOrder: int("sort_order").default(0).notNull(),
});

export const packageExclusions = mysqlTable("package_exclusions", {
  id: uuidPrimaryColumn("id").primaryKey(),
  packageId: uuidColumn("package_id")
    .notNull()
    .references(() => packages.id, { onDelete: "cascade" }),
  item: text("item").notNull(),
  sortOrder: int("sort_order").default(0).notNull(),
});

export const packagesRelations = relations(packages, ({ many, one }) => ({
  primaryDestination: one(destinations, {
    fields: [packages.destinationId],
    references: [destinations.id],
    relationName: "primaryDestination",
  }),
  destinations: many(packageDestinations),
  highlights: many(packageHighlights),
  tiers: many(packageTiers),
  itineraries: many(packageItineraries),
  inclusions: many(packageInclusions),
  exclusions: many(packageExclusions),
  reviews: many(packageReviews),
  faqs: many(packageFaqs),
}));

export const packageDestinationsRelations = relations(
  packageDestinations,
  ({ one }) => ({
    package: one(packages, {
      fields: [packageDestinations.packageId],
      references: [packages.id],
    }),
    destination: one(destinations, {
      fields: [packageDestinations.destinationId],
      references: [destinations.id],
    }),
  }),
);

export const packageHighlightsRelations = relations(
  packageHighlights,
  ({ one }) => ({
    package: one(packages, {
      fields: [packageHighlights.packageId],
      references: [packages.id],
    }),
  }),
);

export const packageTiersRelations = relations(packageTiers, ({ one }) => ({
  package: one(packages, {
    fields: [packageTiers.packageId],
    references: [packages.id],
  }),
}));

export const packageItinerariesRelations = relations(
  packageItineraries,
  ({ one }) => ({
    package: one(packages, {
      fields: [packageItineraries.packageId],
      references: [packages.id],
    }),
  }),
);

export const packageInclusionsRelations = relations(
  packageInclusions,
  ({ one }) => ({
    package: one(packages, {
      fields: [packageInclusions.packageId],
      references: [packages.id],
    }),
  }),
);

export const packageExclusionsRelations = relations(
  packageExclusions,
  ({ one }) => ({
    package: one(packages, {
      fields: [packageExclusions.packageId],
      references: [packages.id],
    }),
  }),
);

export const packageReviewsRelations = relations(packageReviews, ({ one }) => ({
  package: one(packages, {
    fields: [packageReviews.packageId],
    references: [packages.id],
  }),
}));

export const packageFaqsRelations = relations(packageFaqs, ({ one }) => ({
  package: one(packages, {
    fields: [packageFaqs.packageId],
    references: [packages.id],
  }),
}));
