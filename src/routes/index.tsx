import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowDown,
  Star,
  ShieldCheck,
  BadgeDollarSign,
  PenLine,
  Headphones,
  BedDouble,
  HeartPulse,
  Footprints,
  Mountain,
  Wind,
  Waves,
  Plane,
  ArrowDownWideNarrow,
  Zap,
  Binoculars,
  MapPin,
  Sunrise,
  Compass,
  Quote,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import { getHomeContentFn } from "@/lib/content.functions";
import {
  getPublicAboutPageFn,
  getPublicHomePageFn,
  getPublicSeoPageFn,
} from "@/lib/cms-page-content.functions";
import { staticSeo } from "@/lib/public-seo";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { DestinationCard } from "@/components/DestinationCard";
import { PackageCard } from "@/components/PackageCard";
import { BookingSearchCard } from "@/components/BookingSearchCard";
import { Testimonials } from "@/components/Testimonials";
import { Counter } from "@/components/Counter";
import { CtaBanner } from "@/components/CtaBanner";
import { TrustMarquee } from "@/components/TrustMarquee";
import { ImmersiveBand } from "@/components/ImmersiveBand";
import { NewsletterForm } from "@/components/NewsletterForm";
import { useParallax } from "@/components/Parallax";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { homeIcon } from "@/lib/home-icons";

const iconMap: Record<string, LucideIcon> = {
  ShieldCheck,
  BadgeDollarSign,
  PenLine,
  Headphones,
  BedDouble,
  HeartPulse,
  Footprints,
  Mountain,
  Wind,
  Waves,
  Plane,
  ArrowDownWideNarrow,
  Zap,
  Binoculars,
};

export const Route = createFileRoute("/")({
  loader: async () => {
    const [content, page, about, seo] = await Promise.all([
      getHomeContentFn(),
      getPublicHomePageFn(),
      getPublicAboutPageFn(),
      getPublicSeoPageFn({ data: "/" }),
    ]);
    return { ...content, page, about, seo };
  },

  head: ({ loaderData }) => {
    if (loaderData?.seo)
      return staticSeo(
        loaderData.seo,
        loaderData.branding.defaultSeoTitle,
        loaderData.branding.defaultSeoDescription,
        "/",
      );
    const title =
      loaderData?.branding.defaultSeoTitle ||
      "Nepal Heaven — Heaven on Earth Awaits | Luxury Nepal Travel";

    const description =
      loaderData?.branding.defaultSeoDescription ||
      "Discover unforgettable adventures across Nepal with expertly crafted journeys — Everest, Annapurna, Mustang, Chitwan and beyond.";

    const ogImage = loaderData?.branding.defaultOgImageUrl;

    return {
      meta: [
        {
          title,
        },

        {
          name: "description",
          content: description,
        },

        {
          property: "og:title",
          content: title,
        },

        {
          property: "og:description",
          content: description,
        },

        {
          property: "og:type",
          content: "website",
        },

        {
          name: "twitter:card",
          content: "summary_large_image",
        },

        {
          property: "og:url",
          content: "/",
        },

        ...(ogImage
          ? [
              {
                property: "og:image",
                content: ogImage,
              },

              {
                name: "twitter:image",
                content: ogImage,
              },
            ]
          : []),
      ],

      links: [
        {
          rel: "canonical",
          href: "/",
        },
      ],
    };
  },

  component: Home,
});

function Home() {
  const { page } = Route.useLoaderData();
  return (
    <>
      <Hero />
      <TrustMarquee marks={page.trustTexts} />
      <SearchBand />
      <StoryIntro />
      <PopularDestinations />
      <MomentBand />
      <TopPackages />
      <Adventures />
      <WhyUs />
      <ReviewsAndStats />
      <GalleryPreview />
      <Stories />
      <NewsletterBand />
      <div className="pt-24">
        <CtaBanner
          image={page.ctaImageUrl || undefined}
          subtitle={page.ctaSubtitle}
          title={page.ctaTitle}
          description={page.ctaDescription}
          mainText={page.ctaMainText}
          mainLink={page.ctaMainLink}
          secondaryText={page.ctaSecondaryText}
          secondaryLink={page.ctaSecondaryLink}
        />
      </div>
    </>
  );
}

function NewsletterBand() {
  const { page } = Route.useLoaderData();
  return (
    <section className="bg-sand py-20">
      <div className="container-lux mx-auto grid max-w-4xl gap-8 rounded-[2rem] border border-gold/20 bg-card p-8 md:grid-cols-[1fr_22rem] md:items-center md:p-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            {page.newsletterSubtitle}
          </p>
          <h2 className="mt-3 text-3xl">{page.newsletterTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {page.newsletterDescription}
          </p>
        </div>
        <NewsletterForm source="homepage" />
      </div>
    </section>
  );
}

function Hero() {
  const { images, page } = Route.useLoaderData();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="grain relative isolate flex min-h-[100svh] items-center overflow-hidden">
      <img
        src={page.heroImageUrl || images.heroEverest}
        alt="Mount Everest at sunrise above a sea of clouds"
        width={1920}
        height={1088}
        style={{
          transform: `translate3d(0, ${offset * 0.35}px, 0) scale(1.12)`,
        }}
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
      />
      <div className="bg-veil absolute inset-0" />
      <div className="absolute inset-0 bg-primary/35" />
      <div className="absolute inset-0 bg-[radial-gradient(75%_60%_at_8%_85%,color-mix(in_oklab,var(--gold)_26%,transparent),transparent_60%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background/90 to-transparent" />

      <div className="container-lux relative grid gap-14 pb-40 pt-40 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <p className="animate-reveal eyebrow">{page.heroSubtitle}</p>
          <h1
            className="animate-reveal mt-6 max-w-4xl text-[2.6rem] leading-[1.02] text-primary-foreground sm:text-6xl lg:text-[5.2rem]"
            style={{ animationDelay: "120ms" }}
          >
            {page.heroTitle}
          </h1>
          <p
            className="animate-reveal mt-7 max-w-xl text-lg leading-relaxed text-primary-foreground/85"
            style={{ animationDelay: "240ms" }}
          >
            {page.heroDescription}
          </p>
          <div
            className="animate-reveal mt-10 flex flex-wrap gap-4"
            style={{ animationDelay: "360ms" }}
          >
            <Link
              to="/packages"
              className="bg-gold-gradient shadow-glow inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-gold-foreground transition-transform duration-300 hover:scale-[1.04]"
            >
              Explore Packages
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              to="/contact"
              className="glass-dark inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-primary-foreground transition-colors duration-300 hover:text-gold"
            >
              Plan My Trip
            </Link>
            <WhatsAppLink
              context="homepage"
              className="glass-dark inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-primary-foreground transition-colors duration-300 hover:text-gold"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              WhatsApp us
            </WhatsAppLink>
          </div>

          <dl
            className="animate-reveal glass-dark mt-14 inline-flex flex-wrap gap-x-12 gap-y-6 rounded-3xl px-8 py-6"
            style={{ animationDelay: "480ms" }}
          >
            {page.heroStats.map((s) => (
              <div key={`${s.value}-${s.text}`}>
                <dt className="font-[family-name:var(--font-display)] text-2xl font-semibold text-gold">
                  {s.value}
                </dt>
                <dd className="mt-1 text-xs uppercase tracking-[0.18em] text-primary-foreground/70">
                  {s.text}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Floating live-journey cards */}
        <div
          className="animate-reveal hidden lg:block"
          style={{ animationDelay: "620ms" }}
        >
          <div className="animate-float glass-dark ml-auto max-w-sm rounded-[1.75rem] p-6">
            <div className="flex items-center gap-3">
              <span className="animate-pulse-ring grid h-10 w-10 place-items-center rounded-full bg-gold-gradient text-gold-foreground">
                <Sunrise className="h-4.5 w-4.5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-primary-foreground">
                  {page.floatingTitle}
                </p>
                <p className="text-xs text-primary-foreground/65">
                  {page.floatingSubtitle}
                </p>
              </div>
            </div>
            <div className="mt-5 h-px w-full bg-primary-foreground/15" />
            <p className="mt-5 text-sm leading-relaxed text-primary-foreground/80">
              {page.floatingDescription}
            </p>
          </div>

          <div
            className="animate-float glass-dark mt-5 ml-auto flex max-w-xs items-center gap-4 rounded-[1.5rem] p-5"
            style={{ animationDelay: "700ms" }}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-foreground/10 text-gold">
              <MapPin className="h-4.5 w-4.5" aria-hidden />
            </span>
            <p className="text-xs leading-relaxed text-primary-foreground/80">
              <span className="font-semibold text-primary-foreground">
                8 regions
              </span>{" "}
              operated in-house — no subcontracted crews, ever.
            </p>
          </div>
        </div>
      </div>

      <a
        href="#discover"
        aria-label="Scroll to content"
        className="animate-float absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-primary-foreground/70 transition-colors hover:text-gold sm:flex"
      >
        <span className="text-[0.6rem] uppercase tracking-[0.3em]">Scroll</span>
        <span className="grid h-10 w-10 place-items-center rounded-full border border-primary-foreground/30">
          <ArrowDown className="h-4 w-4" aria-hidden />
        </span>
      </a>
    </section>
  );
}

function SearchBand() {
  const { destinations } = Route.useLoaderData();
  return (
    <section
      id="discover"
      className="container-lux relative z-10 -mt-14 sm:-mt-16"
    >
      <Reveal>
        <BookingSearchCard destinations={destinations} />
      </Reveal>
    </section>
  );
}

function StoryIntro() {
  const { images, page } = Route.useLoaderData();
  const { ref, progress } = useParallax<HTMLDivElement>();

  return (
    <section className="container-lux py-24 lg:py-32">
      <div className="grid gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div ref={ref} className="relative">
          <div
            className="zoom-media overflow-hidden rounded-[2rem] shadow-[var(--shadow-elevated)]"
            style={{ transform: `translate3d(0, ${progress * 26}px, 0)` }}
          >
            <img
              src={page.aboutBigImageUrl || images.destAnnapurna}
              alt="Annapurna range above terraced foothills"
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div
            className="zoom-media absolute -bottom-10 -right-4 w-44 overflow-hidden rounded-[1.5rem] border-4 border-background shadow-[var(--shadow-elevated)] sm:w-56"
            style={{ transform: `translate3d(0, ${progress * -34}px, 0)` }}
          >
            <img
              src={page.aboutSmallImageUrl || images.destKathmandu}
              alt="Kathmandu courtyard temple at dusk"
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
          </div>
          <div className="glass-card animate-float absolute -left-4 top-8 rounded-2xl px-5 py-4 sm:-left-8">
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-gold">
              {page.aboutBigTitle}
            </p>
            <p className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {page.aboutBigSubtitle}
            </p>
          </div>
        </div>

        <div>
          <SectionHeading
            eyebrow={page.aboutSubtitle}
            title={page.aboutTitle}
            description={page.aboutDescription}
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {page.aboutCards.map((item, i) => {
            const Icon = homeIcon(item.icon, Compass);
              return (
                <Reveal key={item.title} delay={i * 80}>
                  <div className="hairline hover-lift h-full rounded-2xl bg-card/70 p-6 backdrop-blur-sm">
                    <Icon className="h-5 w-5 text-gold" aria-hidden />
                    <h3 className="mt-4 text-base">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function PopularDestinations() {
  const { destinations, page } = Route.useLoaderData();
  const featured =
    destinations.find((item) => item.id === page.primaryDestinationId) ??
    destinations[0];
  const selectedSecondary = page.secondaryDestinationIds.flatMap(
    (id) => destinations.find((item) => item.id === id) ?? [],
  );
  const rest = selectedSecondary.length
    ? selectedSecondary
    : destinations.filter((item) => item.id !== featured?.id);

  return (
    <section className="section-band py-24 lg:py-32">
      <div className="container-lux">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            eyebrow={page.destinationsSubtitle}
            title={page.destinationsTitle}
            description={page.destinationsDescription}
          />
          <Link
            to="/destinations"
            className="group inline-flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-gold"
          >
            {page.destinationsLinkText}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>

        {featured ? (
          <Reveal className="mt-14">
            <Link
              to="/destinations/$slug"
              params={{ slug: featured.slug }}
              className="zoom-media sheen group relative grid min-h-[26rem] overflow-hidden rounded-[2rem] border border-border/60 shadow-[var(--shadow-elevated)] lg:min-h-[32rem]"
            >
              <img
                src={featured.image}
                alt={`${featured.name}, Nepal`}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="bg-veil absolute inset-0" />
              <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_100%_100%,color-mix(in_oklab,var(--gold)_26%,transparent),transparent_65%)]" />
              <div className="relative mt-auto grid gap-8 p-8 sm:p-12 lg:grid-cols-[1.3fr_1fr] lg:items-end">
                <div>
                  <span className="glass-dark inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary-foreground">
                    <Star
                      className="h-3.5 w-3.5 fill-current text-gold"
                      aria-hidden
                    />
                    Most requested region
                  </span>
                  <h3 className="mt-6 text-4xl leading-tight text-primary-foreground sm:text-5xl">
                    {featured.name}
                  </h3>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/80">
                    {featured.short}
                  </p>
                </div>
                <dl className="glass-dark grid grid-cols-3 gap-4 rounded-2xl p-5">
                  {[
                    { k: "Altitude", v: featured.altitude },
                    { k: "Season", v: featured.season },
                    { k: "Duration", v: featured.duration },
                  ].map((s) => (
                    <div key={s.k}>
                      <dt className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-primary-foreground/60">
                        {s.k}
                      </dt>
                      <dd className="mt-1.5 text-xs font-semibold text-primary-foreground">
                        {s.v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Link>
          </Reveal>
        ) : null}

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((d, i) => (
            <DestinationCard key={d.slug} destination={d} delay={i * 70} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MomentBand() {
  const { images, page } = Route.useLoaderData();
  return (
    <ImmersiveBand
      image={images.destMustang}
      alt="Upper Mustang high desert cliffs at golden hour"
    >
      <div className="max-w-3xl">
        <Quote className="h-10 w-10 text-gold" aria-hidden />
        <p className="mt-8 font-[family-name:var(--font-display)] text-3xl leading-[1.2] text-primary-foreground sm:text-4xl lg:text-[3.25rem]">
          {page.expertText}{" "}
          <span className="text-gradient-gold">
            {page.expertHighlightedText}
          </span>
        </p>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-primary-foreground/70">
          {page.expertName} · {page.expertPosition}
        </p>
        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            to="/destinations"
            className="bg-gold-gradient shadow-glow inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-gold-foreground transition-transform duration-300 hover:scale-[1.04]"
          >
            Find your region
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            to="/about"
            className="glass-dark inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-primary-foreground transition-colors hover:text-gold"
          >
            Meet the team
          </Link>
        </div>
      </div>
    </ImmersiveBand>
  );
}

function TopPackages() {
  const { packages, page } = Route.useLoaderData();
  const primary = page.primaryPackageIds.flatMap(
    (id) => packages.find((item) => item.id === id) ?? [],
  );
  const secondary = page.secondaryPackageIds.flatMap(
    (id) => packages.find((item) => item.id === id) ?? [],
  );
  const primaryTours = primary.length ? primary : packages.slice(0, 4);
  const secondaryTours = secondary.length ? secondary : packages.slice(4);
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-24 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
      />
      <div className="container-lux relative">
        <SectionHeading
          eyebrow={page.toursSubtitle}
          title={page.toursTitle}
          description={page.toursDescription}
          align="center"
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {primaryTours.map((p, i) => (
            <PackageCard key={p.slug} pkg={p} delay={i * 80} layout="row" />
          ))}
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {secondaryTours.map((p, i) => (
            <PackageCard key={p.slug} pkg={p} delay={i * 80} />
          ))}
        </div>
        <Reveal className="mt-14">
          <div className="flex justify-center">
            <Link
              to="/packages"
              className="group hairline inline-flex items-center gap-2 rounded-full bg-card px-8 py-4 text-sm font-bold text-primary shadow-[var(--shadow-soft)] transition-colors hover:text-gold"
            >
              {page.toursLinkText}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Adventures() {
  const { activities, page } = Route.useLoaderData();
  const items = page.adventures.length
    ? page.adventures.map((item) => ({
        name: item.title,
        detail: item.description,
        icon: item.icon,
      }))
    : activities;
  return (
    <section className="section-band py-24 lg:py-32">
      <div className="container-lux">
        <SectionHeading
          eyebrow={page.adventuresSubtitle}
          title={page.adventuresTitle}
          description={page.adventuresDescription}
        />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((a, i) => {
            const Icon = iconMap[a.icon] ?? homeIcon(a.icon, Mountain);
            return (
              <Reveal key={a.name} as="li" delay={i * 60}>
                <div className="hover-lift group relative h-full overflow-hidden rounded-3xl border border-border bg-card p-7 transition-colors hover:border-gold/50">
                  <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-gold/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="bg-summit grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground shadow-[var(--shadow-soft)] transition-transform duration-500 group-hover:-rotate-6">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-6 text-lg">{a.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {a.detail}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function WhyUs() {
  const { whyUs, page } = Route.useLoaderData();
  const whyUsItems = page.whyCards.length
    ? page.whyCards.map((item) => ({
        title: item.title,
        detail: item.description,
        icon: item.icon,
      }))
    : whyUs;
  return (
    <section className="bg-summit grain relative overflow-hidden py-24 lg:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full bg-gold/15 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
      />
      <div className="container-lux relative">
        <SectionHeading
          eyebrow={page.whySubtitle}
          title={page.whyTitle}
          description={page.whyDescription}
          tone="light"
          align="center"
        />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {whyUsItems.map((w, i) => {
            const Icon = iconMap[w.icon] ?? homeIcon(w.icon, ShieldCheck);
            return (
              <Reveal key={w.title} as="li" delay={i * 70}>
                <div className="glass-dark h-full rounded-3xl p-8 transition-transform duration-500 hover:-translate-y-2">
                  <Icon className="h-7 w-7 text-gold" aria-hidden />
                  <h3 className="mt-6 text-xl text-primary-foreground">
                    {w.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-primary-foreground/70">
                    {w.detail}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function ReviewsAndStats() {
  const { stats, testimonials, page, about } = Route.useLoaderData();
  const chosen =
    page.aboutCounterIndex === null
      ? null
      : about.counters[page.aboutCounterIndex];
  const visibleStats = chosen
    ? [{ value: chosen.number, suffix: chosen.symbol, label: chosen.text }]
    : stats;
  return (
    <section className="container-lux py-24 lg:py-32">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <SectionHeading
            eyebrow={page.testimonialsSubtitle}
            title={page.testimonialsTitle}
            description={page.testimonialsDescription}
          />
          <dl className="mt-12 grid grid-cols-2 gap-4">
            {visibleStats.map((s, i) => (
              <Reveal key={s.label} delay={i * 90}>
                <div className="hairline hover-lift rounded-2xl bg-card/70 p-6 backdrop-blur-sm">
                  <dt className="font-[family-name:var(--font-display)] text-4xl font-semibold text-primary sm:text-5xl">
                    <Counter value={s.value} suffix={s.suffix} />
                  </dt>
                  <dd className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {s.label}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
        <Reveal delay={120}>
          <Testimonials testimonials={testimonials} />
        </Reveal>
      </div>
    </section>
  );
}

function GalleryPreview() {
  const { galleryItems, page } = Route.useLoaderData();
  const curated = page.galleryMediaIds.flatMap(
    (id) => galleryItems.find((item) => item.id === id) ?? [],
  );
  const visible = curated.length ? curated : galleryItems.slice(0, 8);
  return (
    <section className="section-band py-24 lg:py-32">
      <div className="container-lux">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            eyebrow={page.gallerySubtitle}
            title={page.galleryTitle}
            description={page.galleryDescription}
          />
          <Link
            to="/gallery"
            search={{ category: undefined, associatedTo: undefined }}
            className="group inline-flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-gold"
          >
            {page.galleryLinkText}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
        <ul className="mt-12 columns-2 gap-4 [column-fill:_balance] sm:columns-3 lg:columns-4">
          {visible.map((g, i) => (
            <li
              key={g.id ?? `${g.title}-${i}`}
              className="mb-4 break-inside-avoid"
            >
              <Reveal delay={i * 50}>
                <figure className="zoom-media group relative overflow-hidden rounded-2xl">
                  {g.type === "video" ? (
                    <video
                      src={g.videoUrl}
                      poster={g.thumbnail}
                      controls
                      preload="metadata"
                      className="w-full object-cover"
                    />
                  ) : (
                    <img
                      src={g.image}
                      alt={g.title}
                      loading="lazy"
                      className="w-full object-cover"
                    />
                  )}
                  <figcaption className="bg-veil absolute inset-x-0 bottom-0 p-4 text-xs font-semibold text-primary-foreground opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    {g.title}
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Stories() {
  const { posts, page } = Route.useLoaderData();
  const selected = page.blogIds.flatMap(
    (id) => posts.find((item) => item.id === id) ?? [],
  );
  const visiblePosts = selected.length ? selected : posts.slice(0, 3);
  return (
    <section className="container-lux py-24 lg:py-32">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <SectionHeading
          eyebrow={page.journalSubtitle}
          title={page.journalTitle}
          description={page.journalDescription}
        />
        <Link
          to="/blog"
          className="group inline-flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-gold"
        >
          Read the journal
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {visiblePosts.map((p, i) => (
          <Reveal key={p.slug} as="article" delay={i * 80}>
            <Link
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="hover-lift group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card"
            >
              <div className="zoom-media aspect-[16/10]">
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-7">
                <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                  <span className="rounded-full bg-accent px-2.5 py-1 text-accent-foreground">
                    {p.category}
                  </span>
                  <span>{p.readingTime}</span>
                </div>
                <h3 className="mt-4 text-xl leading-snug transition-colors group-hover:text-primary">
                  {p.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {p.excerpt}
                </p>
                <span className="mt-auto pt-6 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                  {p.date}
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-16">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 rounded-3xl border border-border bg-card px-8 py-7 text-center">
          {page.trustTexts.map((text, index) => (
            <span
              key={`${text}-${index}`}
              className={
                index === 0
                  ? "inline-flex items-center gap-2 text-sm font-semibold text-foreground"
                  : "text-sm text-muted-foreground"
              }
            >
              {index === 0 ? (
                <Star className="h-4 w-4 fill-current text-gold" aria-hidden />
              ) : null}
              {text}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
