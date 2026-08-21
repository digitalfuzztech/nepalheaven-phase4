import { createFileRoute } from "@tanstack/react-router";

import { useMemo, useState } from "react";

import { Search, SlidersHorizontal } from "lucide-react";

import {
  getDestinationsFn,
  getPublicSiteSettingsFn,
} from "@/lib/content.functions";

import { getPublicDestinationListingPageFn } from "@/lib/cms-destination-listing.functions";

import { PageHero } from "@/components/PageHero";

import { DestinationCard } from "@/components/DestinationCard";

import { CtaBanner } from "@/components/CtaBanner";

import { cn } from "@/lib/utils";
import { getPublicSeoPageFn } from "@/lib/cms-page-content.functions";
import { staticSeo } from "@/lib/public-seo";

type FilterOption = {
  value: string;

  label: string;
};

export const Route = createFileRoute("/destinations/")({
  loader: async () => {
    const [destinations, settings, listingPage, seo] = await Promise.all([
      getDestinationsFn(),

      getPublicSiteSettingsFn(),

      getPublicDestinationListingPageFn(),
      getPublicSeoPageFn({ data: "/destinations" }),
    ]);

    return {
      destinations,

      images: settings.images,

      listingPage,
      seo,
    };
  },

  head: ({ loaderData }) =>
    loaderData?.seo
      ? staticSeo(
          loaderData.seo,
          "Destinations in Nepal — Everest, Annapurna, Mustang | Nepal Heaven",
          "Browse every region we operate in: altitude, best season, duration and difficulty for each Nepal destination.",
          "/destinations",
        )
      : {
          meta: [
            {
              title:
                "Destinations in Nepal — Everest, Annapurna, Mustang | Nepal Heaven",
            },

            {
              name: "description",

              content:
                "Browse every region we operate in: altitude, best season, duration and difficulty for each Nepal destination.",
            },

            {
              property: "og:title",

              content: "Destinations in Nepal | Nepal Heaven",
            },

            {
              property: "og:description",

              content:
                "Eight Nepal regions with altitude, season and difficulty detail.",
            },

            {
              property: "og:url",

              content: "/destinations",
            },
          ],

          links: [
            {
              rel: "canonical",

              href: "/destinations",
            },
          ],
        },

  component: DestinationsPage,
});

function DestinationsPage() {
  const { destinations, images, listingPage } = Route.useLoaderData();

  const [query, setQuery] = useState("");

  /*
   * Store stable Other Settings IDs,
   * NOT visible names.
   */
  const [destinationType, setDestinationType] = useState("all");

  const [difficulty, setDifficulty] = useState("all");

  /*
   * Destination Type options come LIVE
   * from CMS → Other Settings.
   */
  const destinationTypeOptions: FilterOption[] = useMemo(
    () => [
      {
        value: "all",

        label: "All",
      },

      ...listingPage.destinationTypes.map((option) => ({
        value: option.id,

        label: option.name,
      })),
    ],
    [listingPage.destinationTypes],
  );

  /*
   * Difficulty options come LIVE
   * from CMS → Other Settings.
   */
  const difficultyOptions: FilterOption[] = useMemo(
    () => [
      {
        value: "all",

        label: "All",
      },

      ...listingPage.difficulties.map((option) => ({
        value: option.id,

        label: option.name,
      })),
    ],
    [listingPage.difficulties],
  );

  const results = useMemo(() => {
    /*
     * Name fallback protects an older legacy destination
     * that may not yet have its structured option ID.
     */
    const selectedDestinationType = listingPage.destinationTypes.find(
      (option) => option.id === destinationType,
    );

    const selectedDifficulty = listingPage.difficulties.find(
      (option) => option.id === difficulty,
    );

    return destinations.filter((destination) => {
      const normalizedQuery = query.trim().toLowerCase();

      const matchesQuery =
        !normalizedQuery ||
        [
          destination.name,
          destination.region,
          destination.short,
          destination.category,
          destination.difficulty,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesDestinationType =
        destinationType === "all" ||
        destination.destinationTypeOptionId === destinationType ||
        (!destination.destinationTypeOptionId &&
          selectedDestinationType &&
          destination.category === selectedDestinationType.name);

      const matchesDifficulty =
        difficulty === "all" ||
        destination.difficultyOptionId === difficulty ||
        (!destination.difficultyOptionId &&
          selectedDifficulty &&
          destination.difficulty === selectedDifficulty.name);

      return matchesQuery && matchesDestinationType && matchesDifficulty;
    });
  }, [
    destinations,
    query,
    destinationType,
    difficulty,
    listingPage.destinationTypes,
    listingPage.difficulties,
  ]);

  return (
    <>
      <PageHero
        image={listingPage.heroImageUrl || images.destAnnapurna}
        eyebrow={listingPage.subtitle}
        title={listingPage.title}
        description={listingPage.description}
        crumbs={[
          {
            label: "Home",

            to: "/",
          },

          {
            label: "Destinations",
          },
        ]}
      />

      <section className="container-lux grid gap-10 py-20 lg:grid-cols-[18rem_1fr] lg:py-28">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            {/* CMS-managed form title */}
            <h2 className="flex items-center gap-2 text-lg">
              <SlidersHorizontal className="h-4 w-4 text-gold" aria-hidden />

              {listingPage.searchTitle}
            </h2>

            {/* CMS-managed search placeholder */}
            <label className="mt-6 flex items-center gap-2 rounded-2xl border border-border px-4 py-3">
              <Search
                className="h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden
              />

              <span className="sr-only">Search destinations</span>

              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={listingPage.searchPlaceholder}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>

            {/* IMPORTANT: renamed Category → Destination Type */}
            <FilterGroup
              label="Destination Type"
              options={destinationTypeOptions}
              value={destinationType}
              onChange={setDestinationType}
            />

            <FilterGroup
              label="Difficulty"
              options={difficultyOptions}
              value={difficulty}
              onChange={setDifficulty}
            />

            <p className="mt-8 text-xs text-muted-foreground">
              Showing {results.length} of {destinations.length} destinations
            </p>
          </div>
        </aside>

        <div>
          {/* Existing destination cards */}
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((destination, index) => (
              <DestinationCard
                key={destination.slug}
                destination={destination}
                delay={index * 60}
              />
            ))}
          </div>

          {/* Existing detailed destination rows */}
          <ul className="mt-12 grid gap-6">
            {results.map((destination) => (
              <li
                key={destination.slug}
                className="grid gap-6 rounded-3xl border border-border bg-card p-6 sm:grid-cols-[auto_1fr]"
              >
                <dl className="grid grid-cols-2 gap-4 sm:w-56 sm:grid-cols-1">
                  {[
                    ["Altitude", destination.altitude],

                    ["Best season", destination.season],

                    ["Duration", destination.duration],

                    ["Difficulty", destination.difficulty],
                  ].map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        {key}
                      </dt>

                      <dd className="mt-1 text-sm font-semibold text-foreground">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div>
                  <h3 className="text-xl">{destination.name}</h3>

                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {destination.description}
                  </p>

                  <ul className="mt-4 flex flex-wrap gap-2">
                    {destination.highlights.slice(0, 4).map((highlight) => (
                      <li
                        key={highlight}
                        className="rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground"
                      >
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="pb-24">
        <CtaBanner />
      </div>
    </>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;

  options: readonly FilterOption[];

  value: string;

  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="mt-7">
      <legend className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </legend>

      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",

              value === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-gold hover:text-gold",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
