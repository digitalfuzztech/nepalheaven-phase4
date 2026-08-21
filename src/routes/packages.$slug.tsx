import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Check,
  Clock,
  MessageCircle,
  Signal,
  Star,
  Users,
  X,
} from "lucide-react";
import { getPackageBySlugFn, getPackagesFn } from "@/lib/content.functions";
import { getMyConfirmedBookingForPackageFn } from "@/lib/booking.functions";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { FaqAccordion } from "@/components/FaqAccordion";
import { PackageCard } from "@/components/PackageCard";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { countryName } from "@/lib/countries";
import type { Package } from "@/lib/content.types";
import { getPublicFormsFn } from "@/lib/cms-page-content.functions";

export const Route = createFileRoute("/packages/$slug")({
  loader: async ({ params }) => {
    const [pkg, packages, customerBookingResult, forms] = await Promise.all([
      getPackageBySlugFn({ data: { slug: params.slug } }),
      getPackagesFn(),
      getMyConfirmedBookingForPackageFn({ data: { slug: params.slug } }),
      getPublicFormsFn(),
    ]);
    if (!pkg) throw notFound();
    return { pkg, packages, customerBookingResult, forms };
  },
  head: ({ loaderData, params }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.pkg.title} | Nepal Heaven` },
            { name: "description", content: loaderData.pkg.short },
            { property: "og:url", content: `/packages/${params.slug}` },
          ],
          links: [{ rel: "canonical", href: `/packages/${params.slug}` }],
        }
      : {
          meta: [
            { title: "Package unavailable | Nepal Heaven" },
            { name: "robots", content: "noindex" },
          ],
        },
  component: PackageDetail,
});

function PackageDetail() {
  const {
    pkg: p,
    packages,
    customerBookingResult,
    forms,
  } = Route.useLoaderData();
  const copy = forms.package;
  const customerBooking = customerBookingResult.ok
    ? customerBookingResult.booking
    : null;
  const related = useMemo(() => getOtherTours(p, packages), [p, packages]);
  const [galleryPreviewId, setGalleryPreviewId] = useState<string | null>(null);
  const active = p.gallery.find((item) => item.id === galleryPreviewId) ?? null;
  useEffect(() => {
    if (!active) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setGalleryPreviewId(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [active]);
  const money = (value: number, currency = p.currency) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  const duration =
    p.durationMinDays === p.durationMaxDays
      ? `${p.durationMinDays} Day${p.durationMinDays === 1 ? "" : "s"}`
      : `${p.durationMinDays}–${p.durationMaxDays} Days`;
  const group =
    p.groupSizeMin === p.groupSizeMax
      ? `${p.groupSizeMin} traveller${p.groupSizeMin === 1 ? "" : "s"}`
      : `${p.groupSizeMin}–${p.groupSizeMax} travellers`;
  return (
    <>
      <PageHero
        image={p.image}
        eyebrow={p.style}
        title={p.title}
        description={p.short}
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Packages", to: "/packages" },
          { label: p.title },
        ]}
      />
      <div className="container-lux grid gap-14 py-20 lg:grid-cols-[1fr_23rem] lg:py-28">
        <div className="space-y-20">
          <Reveal as="section">
            <dl className="grid grid-cols-2 gap-6 rounded-3xl border border-border bg-card p-7 sm:grid-cols-4">
              {[
                { icon: Clock, k: "Duration", v: duration },
                { icon: Signal, k: "Difficulty", v: p.difficulty },
                { icon: Users, k: "Group size", v: group },
                {
                  icon: Star,
                  k: "Rating",
                  v: `${p.rating.toFixed(1)} (${p.reviews})`,
                },
              ].map(({ icon: Icon, k, v }) => (
                <div key={k} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <div>
                    <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      {k}
                    </dt>
                    <dd className="mt-1 font-semibold">{v}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <h2 className="mt-14 text-3xl">Tour overview</h2>
            <p className="mt-5 whitespace-pre-line leading-relaxed text-muted-foreground">
              {p.overview}
            </p>
            {p.destinations.length ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {p.destinations.map((d) => (
                  <Link
                    key={d.slug}
                    to="/destinations/$slug"
                    params={{ slug: d.slug }}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-gold hover:text-gold"
                  >
                    {d.name}
                  </Link>
                ))}
              </div>
            ) : null}
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {p.highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl bg-sand p-4 text-sm"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          {p.itinerary.length ? (
            <Reveal as="section">
              <h2 className="text-3xl">Day by day</h2>
              <ol className="mt-8 border-l border-border pl-8">
                {p.itinerary.map((step, index) => (
                  <li
                    key={`${step.day}-${index}`}
                    className="relative pb-10 last:pb-0"
                  >
                    <span className="bg-gold-gradient absolute -left-[2.15rem] top-1.5 h-4 w-4 rounded-full ring-4 ring-background" />
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                      {step.day}
                    </p>
                    <h3 className="mt-2 text-xl">{step.title}</h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {step.detail}
                    </p>
                  </li>
                ))}
              </ol>
            </Reveal>
          ) : null}
          {p.tiers.length ? (
            <Reveal as="section">
              <h2 className="text-3xl">Pricing</h2>
              <div className="mt-8 grid gap-5 sm:grid-cols-3">
                {p.tiers.map((tier, index) => (
                  <div
                    key={`${tier.name}-${index}`}
                    className={
                      index === 1
                        ? "bg-summit rounded-3xl p-7 text-primary-foreground shadow-elevated"
                        : "rounded-3xl border border-border bg-card p-7"
                    }
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.2em]">
                      {tier.name}
                    </p>
                    <p className="mt-4 text-3xl font-semibold">
                      {money(tier.price, tier.currency)}
                    </p>
                    <p className="mt-2 text-sm opacity-70">
                      {copy.perPersonText} {tier.note}
                    </p>
                    <Link
                      to={
                        customerBooking
                          ? "/account/bookings/$reference"
                          : "/book/$slug"
                      }
                      params={
                        customerBooking
                          ? { reference: customerBooking.reference }
                          : { slug: p.slug }
                      }
                      className="mt-6 block rounded-2xl border border-current/20 px-5 py-3 text-center text-sm font-bold"
                    >
                      {customerBooking ? "View my booking" : "Reserve"}
                    </Link>
                  </div>
                ))}
              </div>
            </Reveal>
          ) : null}
          <Reveal as="section" className="grid gap-8 sm:grid-cols-2">
            <List title="Included" items={p.included} included />
            <List title="Excluded" items={p.excluded} />
          </Reveal>
          {p.gallery.length ? (
            <Reveal as="section">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl">Gallery</h2>
                {p.gallery.length > 6 ? (
                  <Link
                    to="/gallery"
                    search={{ category: "package", associatedTo: p.slug }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-gold"
                  >
                    See More
                  </Link>
                ) : null}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {p.gallery.slice(0, 6).map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setGalleryPreviewId(item.id)}
                    className="zoom-media aspect-[4/3] overflow-hidden rounded-2xl"
                  >
                    <img
                      src={item.image}
                      alt={item.alt}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </Reveal>
          ) : null}
          {p.packageReviews.length ? (
            <Reveal as="section">
              <h2 className="text-3xl">Traveller reviews</h2>
              <ul className="mt-8 grid gap-5 sm:grid-cols-2">
                {p.packageReviews.map((review, index) => (
                  <li
                    key={`${review.customerName}-${index}`}
                    className="rounded-3xl border border-border bg-card p-7"
                  >
                    <RatingStars rating={review.rating} />
                    <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      “{review.text}”
                    </blockquote>
                    <p className="mt-5 text-sm font-semibold">
                      {review.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {countryName(review.countryCode) ?? review.countryCode}
                    </p>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}
          {p.faqs.length ? (
            <Reveal as="section">
              <h2 className="text-3xl">Frequently asked</h2>
              <div className="mt-6">
                <FaqAccordion items={p.faqs} />
              </div>
            </Reveal>
          ) : null}
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="glass-card rounded-3xl p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {copy.priceLabel}
            </p>
            <p className="mt-1 text-4xl font-semibold text-primary">
              {money(p.price)}
            </p>
            {p.oldPrice ? (
              <p className="text-sm text-muted-foreground line-through">
                <span className="sr-only">{copy.originalPriceLabel}: </span>
                {money(p.oldPrice)}
              </p>
            ) : null}
            <p className="mt-1 text-xs text-muted-foreground">
              {copy.perPersonText}
            </p>
            <div className="mt-6 space-y-3">
              {customerBooking ? (
                <Link
                  to="/account/bookings/$reference"
                  params={{ reference: customerBooking.reference }}
                  className="bg-gold-gradient block rounded-2xl px-6 py-4 text-center text-sm font-bold"
                >
                  View my booking
                </Link>
              ) : (
                <Link
                  to="/book/$slug"
                  params={{ slug: p.slug }}
                  className="bg-gold-gradient block rounded-2xl px-6 py-4 text-center text-sm font-bold"
                >
                  {copy.bookButtonText}
                </Link>
              )}
              <Link
                to="/contact"
                search={{ package: p.slug }}
                className="block rounded-2xl border border-border px-6 py-4 text-center text-sm font-bold"
              >
                {copy.contactButtonText}
              </Link>
              <WhatsAppLink
                context="package"
                slug={p.slug}
                className="flex items-center justify-center gap-2 rounded-2xl border border-forest/25 px-6 py-4 text-sm font-bold text-forest"
              >
                <MessageCircle className="h-4 w-4" />
                {copy.whatsappText}
              </WhatsAppLink>
            </div>
            {copy.helperText ? (
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                {copy.helperText}
              </p>
            ) : null}
          </div>
        </aside>
      </div>
      {related.length ? (
        <section className="bg-sand py-24">
          <div className="container-lux">
            <SectionHeading
              eyebrow="You may also like"
              title="Other journeys travellers compare"
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <PackageCard
                  key={item.slug}
                  pkg={item}
                  delay={index * 70}
                  comparisonBaseSlug={p.slug}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setGalleryPreviewId(null)}
        >
          <figure
            className="relative max-h-[92vh] max-w-6xl overflow-hidden rounded-2xl bg-black"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={active.image}
              alt={active.alt}
              className="max-h-[92vh] max-w-full object-contain"
            />
            <button
              type="button"
              onClick={() => setGalleryPreviewId(null)}
              aria-label="Close gallery preview"
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-black/70 text-white"
            >
              <X className="h-5 w-5" />
            </button>
            {active.title || active.caption ? (
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-6 pt-16 text-white">
                <p className="font-semibold">{active.title}</p>
                {active.caption ? (
                  <p className="mt-1 text-sm text-white/70">{active.caption}</p>
                ) : null}
              </figcaption>
            ) : null}
          </figure>
        </div>
      ) : null}
    </>
  );
}
function List({
  title,
  items,
  included = false,
}: {
  title: string;
  items: string[];
  included?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-7">
      <h2 className="text-2xl">{title}</h2>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 text-sm text-muted-foreground"
          >
            {included ? (
              <Check className="mt-0.5 h-4 w-4 text-forest" />
            ) : (
              <X className="mt-0.5 h-4 w-4 text-destructive" />
            )}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
function stableScore(seed: string, value: string) {
  let hash = 2166136261;
  for (const char of `${seed}:${value}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function getOtherTours(current: Package, all: Package[]) {
  const eligible = all.filter((item) => item.id !== current.id);
  const sameType = (item: Package) => {
    if (current.packageTypeOptionId && item.packageTypeOptionId) {
      return item.packageTypeOptionId === current.packageTypeOptionId;
    }
    const currentType = current.style.trim().toLowerCase();
    return (
      Boolean(currentType) && item.style.trim().toLowerCase() === currentType
    );
  };
  const same = eligible
    .filter(sameType)
    .sort(
      (a, b) => stableScore(current.id, a.id) - stableScore(current.id, b.id),
    );
  const fallback = eligible
    .filter((item) => !sameType(item))
    .sort(
      (a, b) => stableScore(current.id, a.id) - stableScore(current.id, b.id),
    );
  return [...same.slice(0, 3), ...fallback].slice(0, 3);
}
function RatingStars({ rating }: { rating: number }) {
  return (
    <div
      className="flex gap-1 text-gold"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, rating - index));
        return (
          <span key={index} className="relative h-4 w-4">
            <Star className="absolute h-4 w-4" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star className="h-4 w-4 fill-current" />
            </span>
          </span>
        );
      })}
    </div>
  );
}
