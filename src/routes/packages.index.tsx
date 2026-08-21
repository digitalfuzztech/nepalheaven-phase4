import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  getPackagesFn,
  getPublicSiteSettingsFn,
} from "@/lib/content.functions";
import { PageHero } from "@/components/PageHero";
import { PackageCard } from "@/components/PackageCard";
import { CtaBanner } from "@/components/CtaBanner";
import { cn } from "@/lib/utils";
import { getPublicPackageListingPageFn } from "@/lib/cms-package-listing.functions";
import { getPublicSeoPageFn } from "@/lib/cms-page-content.functions";
import { staticSeo } from "@/lib/public-seo";

const sorts = [
  "Recommended",
  "Price: low to high",
  "Price: high to low",
  "Duration",
] as const;
type PackageSearch = {
  q?: string | undefined;
  destination?: string | undefined;
  arrival?: string | undefined;
  departure?: string | undefined;
  travellers?: number | undefined;
  budget?: number | undefined;
  packageType?: string | undefined;
  style?: string | undefined;
  difficulty?: string | undefined;
  maxPrice?: number | undefined;
  maxDays?: number | "30-plus" | undefined;
};
const text = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;
const number = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};
const maxDays = (value: unknown) =>
  value === "30-plus" ? value : number(value);
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const Route = createFileRoute("/packages/")({
  validateSearch: (search: Record<string, unknown>): PackageSearch => ({
    q: text(search["q"]),
    destination: text(search["destination"]),
    arrival: text(search["arrival"]),
    departure: text(search["departure"]),
    travellers: number(search["travellers"]),
    budget: number(search["budget"]),
    packageType: text(search["packageType"]),
    style: text(search["style"]),
    difficulty: text(search["difficulty"]),
    maxPrice: number(search["maxPrice"]),
    maxDays: maxDays(search["maxDays"]),
  }),
  loader: async () => {
    const [packages, settings, listingPage, seo] = await Promise.all([
      getPackagesFn(),
      getPublicSiteSettingsFn(),
      getPublicPackageListingPageFn(),
      getPublicSeoPageFn({ data: "/packages" }),
    ]);
    return { packages, images: settings.images, listingPage, seo };
  },
  head: ({ loaderData }) =>
    loaderData?.seo
      ? staticSeo(
          loaderData.seo,
          "Nepal Tour Packages & Treks — Prices and Dates | Nepal Heaven",
          "Compare curated Nepal packages: Everest Base Camp, Annapurna Circuit, luxury private tours, safaris and helicopter journeys.",
          "/packages",
        )
      : {
          meta: [
            {
              title:
                "Nepal Tour Packages & Treks — Prices and Dates | Nepal Heaven",
            },
            {
              name: "description",
              content:
                "Compare curated Nepal packages: Everest Base Camp, Annapurna Circuit, luxury private tours, safaris and helicopter journeys.",
            },
            {
              property: "og:title",
              content: "Nepal Tour Packages | Nepal Heaven",
            },
            {
              property: "og:description",
              content:
                "Curated Himalayan trips with transparent pricing and ratings.",
            },
            { property: "og:url", content: "/packages" },
          ],
          links: [{ rel: "canonical", href: "/packages" }],
        },
  component: PackagesPage,
});

function PackagesPage() {
  const { images, packages, listingPage } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const update = (patch: Partial<PackageSearch>) =>
    void navigate({
      search: (current) => ({ ...current, ...patch }),
      replace: true,
      resetScroll: false,
    });
  const [sort, setSort] = useState<(typeof sorts)[number]>("Recommended");
  const windowDays =
    search.arrival && search.departure && search.departure > search.arrival
      ? Math.ceil(
          (Date.parse(`${search.departure}T00:00:00Z`) -
            Date.parse(`${search.arrival}T00:00:00Z`)) /
            86400000,
        )
      : undefined;
  const highestPrice = Math.max(0, ...packages.map((item) => item.price));
  const maxPriceCeiling = Math.ceil(highestPrice / 1000) * 1000;
  const maxPriceOptions = Array.from(
    { length: maxPriceCeiling / 1000 },
    (_, index) => (index + 1) * 1000,
  );
  const durationOptions = Array.from({ length: 30 }, (_, index) => index + 1);

  const results = useMemo(() => {
    const filtered = packages.filter(
      (p) =>
        (!search.destination ||
          p.destinations.some((d) => d.slug === search.destination)) &&
        (!search.budget ||
          (search.budget === 1 && p.price < 1500) ||
          (search.budget === 2 && p.price >= 1500 && p.price <= 3000) ||
          (search.budget === 3 && p.price > 3000 && p.price <= 6000) ||
          (search.budget === 4 && p.price > 6000)) &&
        (!windowDays || p.durationMaxDays <= windowDays) &&
        (!search.packageType ||
          p.packageTypeOptionId === search.packageType ||
          (!p.packageTypeOptionId &&
            p.style ===
              listingPage.packageTypes.find(
                (option) => option.id === search.packageType,
              )?.name)) &&
        (!search.style || p.style === search.style) &&
        (!search.difficulty ||
          p.difficultyOptionId === search.difficulty ||
          (!p.difficultyOptionId &&
            p.difficulty ===
              listingPage.difficulties.find(
                (option) => option.id === search.difficulty,
              )?.name)) &&
        (!search.maxPrice || p.price <= search.maxPrice) &&
        (!search.maxDays ||
          (search.maxDays === "30-plus"
            ? p.durationMaxDays > 30
            : p.durationMaxDays <= search.maxDays)) &&
        (!search.q ||
          `${p.title} ${p.destination} ${p.style} ${p.difficulty} ${p.highlights.join(" ")}`
            .toLowerCase()
            .includes(search.q.toLowerCase())),
    );
    const sorted = [...filtered];
    if (sort === "Price: low to high") sorted.sort((a, b) => a.price - b.price);
    if (sort === "Price: high to low") sorted.sort((a, b) => b.price - a.price);
    if (sort === "Duration") sorted.sort((a, b) => b.days - a.days);
    return sorted;
  }, [
    packages,
    search,
    sort,
    windowDays,
    listingPage.packageTypes,
    listingPage.difficulties,
  ]);

  return (
    <>
      <PageHero
        image={listingPage.heroImageUrl ?? images.destEverest}
        eyebrow={listingPage.subtitle}
        title={listingPage.title}
        description={listingPage.description}
        crumbs={[{ label: "Home", to: "/" }, { label: "Packages" }]}
      />

      <section className="container-lux py-20 lg:py-28">
        {Object.values(search).some((value) => value !== undefined) ? (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">Active filters</span>
            {search.destination ? (
              <span className="rounded-full bg-accent px-3 py-1 text-xs">
                {search.destination.replaceAll("-", " ")}
              </span>
            ) : null}
            {search.budget ? (
              <span className="rounded-full bg-accent px-3 py-1 text-xs">
                Budget {search.budget}
              </span>
            ) : null}
            {windowDays ? (
              <span className="rounded-full bg-accent px-3 py-1 text-xs">
                {windowDays}-day trip window
              </span>
            ) : null}
            {search.travellers ? (
              <span className="rounded-full bg-accent px-3 py-1 text-xs">
                {search.travellers} travellers
              </span>
            ) : null}
            <button
              type="button"
              onClick={() =>
                void navigate({ search: {}, replace: true, resetScroll: false })
              }
              className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
            >
              Clear filters
            </button>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="flex min-w-[16rem] flex-1 items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
            <Search
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span className="sr-only">Search packages</span>
            <input
              type="search"
              value={search.q ?? ""}
              onChange={(e) => update({ q: e.target.value || undefined })}
              placeholder={listingPage.searchPlaceholder}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm">
            <span className="text-muted-foreground">Sort</span>
            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value as (typeof sorts)[number])
              }
              className="bg-transparent font-semibold outline-none"
            >
              {sorts.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="rounded-2xl border border-border bg-card px-4 py-3 text-sm">
            <span className="mr-2 text-muted-foreground">Difficulty</span>
            <select
              value={search.difficulty ?? ""}
              onChange={(e) =>
                update({ difficulty: e.target.value || undefined })
              }
              className="bg-transparent font-semibold outline-none"
            >
              <option value="">All</option>
              {listingPage.difficulties.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
          <label className="rounded-2xl border border-border bg-card px-4 py-3 text-sm">
            <span className="mr-2 text-muted-foreground">Max price</span>
            <select
              value={search.maxPrice ?? ""}
              onChange={(e) => update({ maxPrice: number(e.target.value) })}
              className="bg-transparent font-semibold outline-none"
            >
              <option value="">Any</option>
              {maxPriceOptions.map((value) => (
                <option key={value} value={value}>
                  {money.format(value)}
                </option>
              ))}
            </select>
          </label>
          <label className="rounded-2xl border border-border bg-card px-4 py-3 text-sm">
            <span className="mr-2 text-muted-foreground">Max duration</span>
            <select
              value={search.maxDays ?? ""}
              onChange={(e) => update({ maxDays: maxDays(e.target.value) })}
              className="bg-transparent font-semibold outline-none"
            >
              <option value="">Any</option>
              {durationOptions.map((value) => (
                <option key={value} value={value}>
                  {value} {value === 1 ? "day" : "days"}
                </option>
              ))}
              <option value="30-plus">30+ days</option>
            </select>
          </label>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Package Type
          </p>
          <ul className="flex flex-wrap gap-2">
            {[{ id: "", name: "All" }, ...listingPage.packageTypes].map(
              (option) => (
                <li key={option.id || "all"}>
                  <button
                    type="button"
                    aria-pressed={(search.packageType ?? "") === option.id}
                    onClick={() =>
                      update({ packageType: option.id || undefined })
                    }
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
                      (search.packageType ?? "") === option.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-gold hover:text-gold",
                    )}
                  >
                    {option.name}
                  </button>
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((p, i) => (
            <PackageCard key={p.slug} pkg={p} delay={i * 60} />
          ))}
        </div>

        {results.length === 0 ? (
          <p className="mt-16 text-center text-muted-foreground">
            No packages match that search — try a different style or region.
          </p>
        ) : null}
      </section>

      <div className="pb-24">
        <CtaBanner />
      </div>
    </>
  );
}
