import { relations } from "drizzle-orm";

import {
  boolean,
  decimal,
    foreignKey,
  int,
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
  cmsOtherSettingsOptions,
} from "./cms-other-settings";

export const destinations = mysqlTable(
    "destinations",
    {
      id:
          uuidPrimaryColumn(
              "id",
          ).primaryKey(),

      name:
          text(
              "name",
          ).notNull(),

      slug:
          varchar(
              "slug",
              {
                length: 191,
              },
          )
              .notNull()
              .unique(),

      /*
      |--------------------------------------------------------------------------
      | Public copy
      |--------------------------------------------------------------------------
      */

      subtitle:
          text(
              "subtitle",
          ),

      /*
       * Legacy/public compatibility.
       *
       * During the transition this mirrors subtitle so the existing
       * public destination pages continue working.
       */
      shortDescription:
          text(
              "short_description",
          ),

      description:
          text(
              "description",
          ),

      /*
      |--------------------------------------------------------------------------
      | Direct destination main image
      |--------------------------------------------------------------------------
      |
      | This image is uploaded directly from Destination CMS.
      |
      | It does NOT create a Media Library record.
      |
      */

      heroImage:
          text(
              "hero_image",
          ),

      heroImageStorageKey:
          text(
              "hero_image_storage_key",
          ),

      /*
      |--------------------------------------------------------------------------
      | Destination metadata
      |--------------------------------------------------------------------------
      */

      region:
          text(
              "region",
          ),

        latitude:
            decimal(
                "latitude",
                {
                    precision:
                        10,

                    scale:
                        7,

                    mode:
                        "number",
                },
            ),

        longitude:
            decimal(
                "longitude",
                {
                    precision:
                        10,

                    scale:
                        7,

                    mode:
                        "number",
                },
            ),

      /*
       * Structured Other Settings reference.
       */
        destinationTypeOptionId:
            uuidColumn(
                "destination_type_option_id",
            ),

      /*
       * Legacy/public compatibility mirror.
       */
      category:
          text(
              "category",
          ),

        difficultyOptionId:
            uuidColumn(
                "difficulty_option_id",
            ),

      /*
       * Legacy/public compatibility mirror.
       */
      difficulty:
          text(
              "difficulty",
          ),

      /*
      |--------------------------------------------------------------------------
      | Duration
      |--------------------------------------------------------------------------
      */

      durationMinDays:
          int(
              "duration_min_days",
          ),

      durationMaxDays:
          int(
              "duration_max_days",
          ),

      /*
       * Legacy/public compatibility mirror.
       */
      duration:
          text(
              "duration",
          ),

      /*
      |--------------------------------------------------------------------------
      | Altitude
      |--------------------------------------------------------------------------
      */

      altitudeLabel:
          text(
              "altitude_label",
          ),

      minAltitude:
          int(
              "min_altitude",
          ),

      maxAltitude:
          int(
              "max_altitude",
          ),

      /*
       * Old compatibility column.
       * Do not use for new CMS content.
       */
      elevation:
          int(
              "elevation",
          ),

      /*
       * Legacy/public compatibility mirror generated from
       * destination_best_seasons.
       */
      bestSeason:
          text(
              "best_season",
          ),

      cancellationFeePercentage:
          decimal(
              "cancellation_fee_percentage",
              {
                precision: 5,
                scale: 2,
              },
          ),

      sortOrder:
          int(
              "sort_order",
          )
              .default(0)
              .notNull(),

      status:
          boolean(
              "status",
          )
              .default(true)
              .notNull(),

      seoTitle:
          text(
              "seo_title",
          ),

      seoDescription:
          text(
              "seo_description",
          ),

      createdAt:
          defaultMomentColumn(
              "created_at",
          ).notNull(),

        updatedAt:
            defaultMomentColumn(
                "updated_at",
            ).notNull(),
    },
    (table) => [
        foreignKey({
            name:
                "destinations_type_option_fk",

            columns: [
                table.destinationTypeOptionId,
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

        foreignKey({
            name:
                "destinations_difficulty_option_fk",

            columns: [
                table.difficultyOptionId,
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
    ],
);

/*
|--------------------------------------------------------------------------
| Best Season
|--------------------------------------------------------------------------
|
| A destination can have multiple month ranges:
|
| May → June
| October → November
|
*/

export const destinationBestSeasons =
    mysqlTable(
        "destination_best_seasons",
        {
          id:
              uuidPrimaryColumn(
                  "id",
              ).primaryKey(),

          destinationId:
              uuidColumn(
                  "destination_id",
              )
                  .notNull()
                  .references(
                      () =>
                          destinations.id,
                      {
                        onDelete:
                            "cascade",
                      },
                  ),

          fromMonth:
              int(
                  "from_month",
              ).notNull(),

          toMonth:
              int(
                  "to_month",
              ).notNull(),

          sortOrder:
              int(
                  "sort_order",
              )
                  .default(0)
                  .notNull(),
        },
    );

export const destinationHighlights =
    mysqlTable(
        "destination_highlights",
        {
          id:
              uuidPrimaryColumn(
                  "id",
              ).primaryKey(),

          destinationId:
              uuidColumn(
                  "destination_id",
              )
                  .notNull()
                  .references(
                      () =>
                          destinations.id,
                      {
                        onDelete:
                            "cascade",
                      },
                  ),

          item:
              text(
                  "item",
              ).notNull(),

          sortOrder:
              int(
                  "sort_order",
              )
                  .default(0)
                  .notNull(),
        },
    );

export const destinationTips =
    mysqlTable(
        "destination_tips",
        {
          id:
              uuidPrimaryColumn(
                  "id",
              ).primaryKey(),

          destinationId:
              uuidColumn(
                  "destination_id",
              )
                  .notNull()
                  .references(
                      () =>
                          destinations.id,
                      {
                        onDelete:
                            "cascade",
                      },
                  ),

          item:
              text(
                  "item",
              ).notNull(),

          sortOrder:
              int(
                  "sort_order",
              )
                  .default(0)
                  .notNull(),
        },
    );

export const destinationItineraries =
    mysqlTable(
        "destination_itineraries",
        {
          id:
              uuidPrimaryColumn(
                  "id",
              ).primaryKey(),

          destinationId:
              uuidColumn(
                  "destination_id",
              )
                  .notNull()
                  .references(
                      () =>
                          destinations.id,
                      {
                        onDelete:
                            "cascade",
                      },
                  ),

          dayLabel:
              text(
                  "day_label",
              ).notNull(),

          title:
              text(
                  "title",
              ).notNull(),

          description:
              text(
                  "description",
              ),

          sortOrder:
              int(
                  "sort_order",
              )
                  .default(0)
                  .notNull(),
        },
    );

export const destinationFaqs = mysqlTable("destination_faqs", {
    id: uuidPrimaryColumn("id").primaryKey(),

    destinationId: uuidColumn("destination_id")
        .notNull()
        .references(() => destinations.id, {
            onDelete: "cascade",
        }),

    question: text("question").notNull(),

    answer: text("answer").notNull(),

    sortOrder: int("sort_order")
        .default(0)
        .notNull(),
});

export const destinationInclusions =
    mysqlTable(
        "destination_inclusions",
        {
          id:
              uuidPrimaryColumn(
                  "id",
              ).primaryKey(),

          destinationId:
              uuidColumn(
                  "destination_id",
              )
                  .notNull()
                  .references(
                      () =>
                          destinations.id,
                      {
                        onDelete:
                            "cascade",
                      },
                  ),

          item:
              text(
                  "item",
              ).notNull(),

          sortOrder:
              int(
                  "sort_order",
              )
                  .default(0)
                  .notNull(),
        },
    );

export const destinationExclusions =
    mysqlTable(
        "destination_exclusions",
        {
          id:
              uuidPrimaryColumn(
                  "id",
              ).primaryKey(),

          destinationId:
              uuidColumn(
                  "destination_id",
              )
                  .notNull()
                  .references(
                      () =>
                          destinations.id,
                      {
                        onDelete:
                            "cascade",
                      },
                  ),

          item:
              text(
                  "item",
              ).notNull(),

          sortOrder:
              int(
                  "sort_order",
              )
                  .default(0)
                  .notNull(),
        },
    );

/*
|--------------------------------------------------------------------------
| Relations
|--------------------------------------------------------------------------
*/

export const destinationsRelations =
    relations(
        destinations,
        ({ many }) => ({
          bestSeasons:
              many(
                  destinationBestSeasons,
              ),

          highlights:
              many(
                  destinationHighlights,
              ),

          tips:
              many(
                  destinationTips,
              ),

          itineraries:
              many(
                  destinationItineraries,
              ),

            faqs: many(destinationFaqs),
          inclusions:
              many(
                  destinationInclusions,
              ),

          exclusions:
              many(
                  destinationExclusions,
              ),
        }),
    );

export const destinationBestSeasonsRelations =
    relations(
        destinationBestSeasons,
        ({ one }) => ({
          destination:
              one(
                  destinations,
                  {
                    fields: [
                      destinationBestSeasons.destinationId,
                    ],

                    references: [
                      destinations.id,
                    ],
                  },
              ),
        }),
    );

export const destinationHighlightsRelations =
    relations(
        destinationHighlights,
        ({ one }) => ({
          destination:
              one(
                  destinations,
                  {
                    fields: [
                      destinationHighlights.destinationId,
                    ],

                    references: [
                      destinations.id,
                    ],
                  },
              ),
        }),
    );

export const destinationTipsRelations =
    relations(
        destinationTips,
        ({ one }) => ({
          destination:
              one(
                  destinations,
                  {
                    fields: [
                      destinationTips.destinationId,
                    ],

                    references: [
                      destinations.id,
                    ],
                  },
              ),
        }),
    );

export const destinationItinerariesRelations =
    relations(
        destinationItineraries,
        ({ one }) => ({
          destination:
              one(
                  destinations,
                  {
                    fields: [
                      destinationItineraries.destinationId,
                    ],

                    references: [
                      destinations.id,
                    ],
                  },
              ),
        }),
    );

export const destinationFaqsRelations = relations(
    destinationFaqs,
    ({ one }) => ({
        destination: one(destinations, {
            fields: [destinationFaqs.destinationId],
            references: [destinations.id],
        }),
    }),
);

export const destinationInclusionsRelations =
    relations(
        destinationInclusions,
        ({ one }) => ({
          destination:
              one(
                  destinations,
                  {
                    fields: [
                      destinationInclusions.destinationId,
                    ],

                    references: [
                      destinations.id,
                    ],
                  },
              ),
        }),
    );

export const destinationExclusionsRelations =
    relations(
        destinationExclusions,
        ({ one }) => ({
          destination:
              one(
                  destinations,
                  {
                    fields: [
                      destinationExclusions.destinationId,
                    ],

                    references: [
                      destinations.id,
                    ],
                  },
              ),
        }),
    );