import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Handshake,
} from "lucide-react";
import { getPublicSiteSettingsFn } from "@/lib/content.functions";
import { getPublicAboutPageFn } from "@/lib/cms-page-content.functions";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { Counter } from "@/components/Counter";
import { CtaBanner } from "@/components/CtaBanner";
export const Route = createFileRoute("/about")({
  loader: async () => {
    const [settings, page] = await Promise.all([
      getPublicSiteSettingsFn(),
      getPublicAboutPageFn(),
    ]);
    return { settings, page };
  },
  head: () => ({
    meta: [
      { title: "About Nepal Heaven — Locally Owned Himalayan Specialists" },
      {
        name: "description",
        content:
          "Founded in Kathmandu by mountain professionals. Our story, team, milestones, awards and partners.",
      },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});
function AboutPage() {
  const { settings, page } = Route.useLoaderData();
  const teamTrackRef = useRef<HTMLUListElement>(null);
  const counters = page.counters.length
    ? page.counters
    : settings.stats
        .slice(0, 4)
        .map((x) => ({ number: x.value, symbol: x.suffix, text: x.label }));
  const team = page.team.length
    ? page.team
    : settings.team.map((x) => ({
        photoMediaId: null,
        photoUrl: null,
        name: x.name,
        position: x.role,
        achievement: x.bio,
      }));
  const milestones = page.milestones.length
    ? page.milestones
    : settings.milestones.map((x) => ({
        year: x.year,
        title: x.title,
        description: x.detail,
      }));
  const awards = page.awards.length ? page.awards : settings.awards,
    partners = page.partners.length ? page.partners : settings.partners;
  const [left, right] = splitStoryAtSentence(page.storyText);
  return (
    <>
      <PageHero
        image={page.heroImageUrl ?? settings.images.destBandipur}
        eyebrow={page.heroSubtitle}
        title={page.heroTitle}
        description={page.heroDescription}
        crumbs={[{ label: "Home", to: "/" }, { label: "About" }]}
      />
      <section className="container-lux grid gap-14 py-20 lg:grid-cols-2 lg:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Mission"
            title={page.missionTitle}
            description={page.missionDescription}
          />
        </Reveal>
        <Reveal delay={100}>
          <SectionHeading
            eyebrow="Vision"
            title={page.visionTitle}
            description={page.visionDescription}
          />
        </Reveal>
        <Reveal delay={160} className="lg:col-span-2">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-12">
            <h2 className="text-3xl">{page.storyTitle}</h2>
            <div className="mt-6 grid gap-6 text-base leading-relaxed text-muted-foreground lg:grid-cols-2">
              <p>{left}</p>
              <p>{right}</p>
            </div>
          </div>
        </Reveal>
      </section>
      <section className="bg-summit py-24">
        <div className="container-lux">
          <dl className="grid gap-10 text-center sm:grid-cols-4">
            {counters.slice(0, 4).map((s) => (
              <Reveal key={s.text}>
                <div>
                  <dt className="font-[family-name:var(--font-display)] text-4xl font-semibold text-gold sm:text-5xl">
                    <Counter value={s.number} suffix={s.symbol} />
                  </dt>
                  <dd className="mt-2 text-xs font-semibold uppercase tracking-[.18em] text-primary-foreground/70">
                    {s.text}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>
      <section className="container-lux py-24">
        <div className="flex items-end justify-between gap-6">
          <SectionHeading eyebrow="Our people" title="Meet the team" />
          {team.length > 1 ? (
            <div className="flex gap-2" aria-label="Team carousel controls">
              {([-1, 1] as const).map((direction) => (
                <button
                  key={direction}
                  type="button"
                  aria-label={
                    direction < 0
                      ? "Previous team members"
                      : "Next team members"
                  }
                  onClick={() =>
                    teamTrackRef.current?.scrollBy({
                      left: direction * teamTrackRef.current.clientWidth * 0.9,
                      behavior: "smooth",
                    })
                  }
                  className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground transition hover:border-gold hover:text-gold"
                >
                  {direction < 0 ? (
                    <ChevronLeft className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <ul
          ref={teamTrackRef}
          className="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto overflow-y-hidden scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {team.map((m, i) => (
            <Reveal
              key={m.name}
              as="li"
              delay={i * 70}
              className="w-full shrink-0 snap-start sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)]"
            >
              <div className="hover-lift h-full rounded-3xl border border-border bg-card p-7 text-center">
                {m.photoUrl ? (
                  <img
                    src={m.photoUrl}
                    alt={m.name}
                    className="mx-auto h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <span className="bg-summit mx-auto grid h-20 w-20 place-items-center rounded-full text-2xl text-white">
                    {m.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                )}
                <h3 className="mt-5 text-lg">{m.name}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[.14em] text-gold">
                  {m.position}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {m.achievement}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>
      <section className="bg-sand py-24">
        <div className="container-lux">
          <SectionHeading eyebrow="Milestones" title="Our journey" />
          <ol className="mt-14 border-l border-border pl-8">
            {milestones.map((m) => (
              <li
                key={`${m.year}-${m.title}`}
                className="relative pb-12 last:pb-0"
              >
                <span className="bg-gold-gradient absolute -left-[2.15rem] top-1.5 h-4 w-4 rounded-full ring-4 ring-sand" />
                <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">
                  {m.year}
                </p>
                <h3 className="mt-2 text-xl">{m.title}</h3>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  {m.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="container-lux grid gap-12 py-24 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Recognition" title="Awards" />
          <ul className="mt-8 space-y-3">
            {awards.map((a) => (
              <li key={a} className="flex gap-3 rounded-2xl border bg-card p-5">
                <Award className="h-4 w-4 text-gold" />
                {a}
              </li>
            ))}
          </ul>
          <a
            href="/gallery?category=general&associatedTo=company-documents"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 font-semibold text-gold"
          >
            View Certificates and Legal Documents
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        <div>
          <SectionHeading eyebrow="Accredited by" title="Partners" />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {partners.map((p) => (
              <li key={p} className="flex gap-3 rounded-2xl border bg-card p-5">
                <Handshake className="h-4 w-4 text-forest" />
                {p}
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
export function splitStoryAtSentence(story: string): [string, string] {
  const clean = story.trim();
  if (!clean) return ["", ""];
  const words = [...clean.matchAll(/\S+/g)];
  if (words.length < 2) return [clean, ""];
  const midpoint =
    words[Math.floor(words.length / 2)]?.index ?? Math.floor(clean.length / 2);
  const boundaries = [...clean.matchAll(/[.!?](?:["'”’)]*)\s+/g)].map(
    (match) => (match.index ?? 0) + match[0].trimEnd().length,
  );
  const split = boundaries.reduce(
    (best, point) =>
      Math.abs(point - midpoint) < Math.abs(best - midpoint) ? point : best,
    boundaries[0] ?? midpoint,
  );
  return [clean.slice(0, split).trim(), clean.slice(split).trim()];
}
