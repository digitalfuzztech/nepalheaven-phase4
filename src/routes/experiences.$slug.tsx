import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, MessageCircle, Sparkles, X } from "lucide-react";
import {
  getExperienceBySlugFn,
  getExperiencesFn,
} from "@/lib/content.functions";
import { submitExperienceInquiryFn } from "@/lib/lead.functions";
import { useAuth } from "@/lib/auth";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { PackageCard } from "@/components/PackageCard";
import { SectionHeading } from "@/components/SectionHeading";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { FaqAccordion } from "@/components/FaqAccordion";
import { ExperienceCard } from "@/components/ExperienceCard";
import type { ExperienceCategory } from "@/lib/content.types";

export const Route = createFileRoute("/experiences/$slug")({
  loader: async ({ params }) => {
    const [experience, experiences] = await Promise.all([
      getExperienceBySlugFn({
        data: { slug: params.slug },
      }),
      getExperiencesFn(),
    ]);
    if (!experience) throw notFound();
    return { experience, experiences };
  },
  head: ({ loaderData, params }) =>
    loaderData
      ? {
          meta: [
            { title: loaderData.experience.seoTitle },
            {
              name: "description",
              content: loaderData.experience.seoDescription,
            },
            { property: "og:url", content: `/experiences/${params.slug}` },
          ],
          links: [{ rel: "canonical", href: `/experiences/${params.slug}` }],
        }
      : { meta: [{ title: "Experience unavailable | Nepal Heaven" }] },
  component: ExperienceDetail,
});

function ExperienceDetail() {
  const { experience, experiences } = Route.useLoaderData();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState<number | null>(null);
  const relatedExperiences = useMemo(
    () => getRelatedExperiences(experience, experiences),
    [experience, experiences],
  );
  useEffect(() => {
    if (activeImage === null) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveImage(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [activeImage]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const result = await submitExperienceInquiryFn({
        data: {
          experienceSlug: experience.slug,
          name: String(data.get("name") || ""),
          email: String(data.get("email") || ""),
          phone: String(data.get("phone") || ""),
          travelDate: String(data.get("date") || ""),
          message: String(data.get("message") || ""),
          interestedIn: experience.name,
          marketingOptIn: data.get("marketingOptIn") === "on",
        },
      });
      if (result.ok) setSent(true);
      else setError(result.message);
    } catch {
      setError("Please check your details and try again.");
    } finally {
      setBusy(false);
    }
  }
  const inputClass =
    "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold";
  return (
    <>
      <PageHero
        image={experience.image}
        eyebrow={experience.type}
        title={experience.name}
        description={experience.short}
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Experiences", to: "/experiences" },
          { label: experience.name },
        ]}
      />
      <div className="container-lux grid gap-x-14 gap-y-20 py-20 lg:grid-cols-[1fr_23rem] lg:py-28">
        <Reveal as="section" className="lg:col-start-1 lg:row-start-1">
          <h2 className="text-3xl">Overview</h2>
          <p className="mt-5 whitespace-pre-line leading-relaxed text-muted-foreground">
            {experience.overview || experience.description}
          </p>
          <h2 className="mt-10 text-3xl">What travellers can expect</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {experience.highlights.map((item) => (
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
        <aside className="order-last lg:sticky lg:top-28 lg:order-none lg:col-start-2 lg:row-start-1 lg:self-start">
          <div className="glass-card rounded-3xl p-7">
            <Sparkles className="h-7 w-7 text-gold" />
            <h2 className="mt-5 text-2xl">Shape this around you</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Tell our local team your pace, dates and interests. We can build a
              private itinerary without claiming fixed availability.
            </p>
            <WhatsAppLink
              context="experience"
              slug={experience.slug}
              className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-forest/25 px-5 py-3 text-sm font-bold text-forest hover:bg-forest/5"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Ask about {experience.name} on WhatsApp
            </WhatsAppLink>
            {sent ? (
              <p className="mt-6 rounded-2xl bg-sand p-5 text-sm">
                Thank you — your {experience.name} inquiry is safely with us.
              </p>
            ) : (
              <form onSubmit={submit} className="mt-6 space-y-3">
                <input
                  className={inputClass}
                  name="name"
                  required
                  minLength={2}
                  maxLength={120}
                  placeholder="Full name"
                  defaultValue={user?.name}
                />
                <input
                  className={inputClass}
                  name="email"
                  type="email"
                  required
                  placeholder="Email address"
                  defaultValue={user?.email}
                />
                <input
                  className={inputClass}
                  name="phone"
                  type="tel"
                  placeholder="Phone / WhatsApp (optional)"
                  defaultValue={user?.phone}
                />
                <input
                  className={inputClass}
                  name="date"
                  type="date"
                  aria-label="Preferred date"
                />
                <textarea
                  className={inputClass}
                  name="message"
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={4}
                  placeholder="Tell us about the journey you have in mind…"
                />
                <label className="flex items-start gap-3 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    name="marketingOptIn"
                    className="mt-0.5"
                  />
                  Send me Nepal travel inspiration, offers and trip updates.
                </label>
                {error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : null}
                <button
                  disabled={busy}
                  className="bg-gold-gradient w-full rounded-2xl px-5 py-3 text-sm font-bold text-gold-foreground disabled:opacity-60"
                >
                  {busy ? "Submitting…" : `Ask about ${experience.name}`}
                </button>
              </form>
            )}
          </div>
        </aside>
        {experience.itinerary.length ? (
          <Reveal as="section" className="lg:col-start-1">
            <h2 className="text-3xl">Day by day</h2>
            <ol className="mt-8 border-l border-border pl-8">
              {experience.itinerary.map((row, index) => (
                <li
                  key={`${row.day}-${index}`}
                  className="relative pb-10 last:pb-0"
                >
                  <span className="bg-gold-gradient absolute -left-[2.15rem] top-1.5 h-4 w-4 rounded-full ring-4 ring-background" />
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                    {row.day}
                  </p>
                  <h3 className="mt-2 text-xl">{row.title}</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {row.detail}
                  </p>
                </li>
              ))}
            </ol>
          </Reveal>
        ) : null}
        {experience.included.length || experience.excluded.length ? (
          <Reveal
            as="section"
            className="grid gap-8 sm:grid-cols-2 lg:col-start-1"
          >
            <ExperienceList
              title="Included"
              items={experience.included}
              included
            />
            <ExperienceList title="Excluded" items={experience.excluded} />
          </Reveal>
        ) : null}
        {experience.gallery.length ? (
          <Reveal as="section" className="lg:col-start-1">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-3xl">Gallery</h2>
              {experience.gallery.length > 6 ? (
                <a
                  href={`/gallery?category=experience&associatedTo=${experience.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-gold transition-colors hover:text-foreground"
                >
                  See More
                </a>
              ) : null}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {experience.gallery.slice(0, 6).map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Preview ${item.title || item.alt || "gallery image"}`}
                  className="zoom-media group aspect-[4/3] overflow-hidden rounded-2xl text-left"
                >
                  <img
                    src={item.image}
                    alt={item.alt}
                    loading="lazy"
                    className="h-full w-full cursor-zoom-in object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </button>
              ))}
            </div>
          </Reveal>
        ) : null}
        {experience.faqs.length ? (
          <Reveal as="section" className="lg:col-start-1">
            <h2 className="text-3xl">Frequently asked</h2>
            <div className="mt-6">
              <FaqAccordion items={experience.faqs} />
            </div>
          </Reveal>
        ) : null}
      </div>
      {relatedExperiences.length ? (
        <section className="container-lux py-24">
          <SectionHeading eyebrow="Explore more" title="Related experiences" />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedExperiences.map((item) => (
              <li key={item.id}>
                <ExperienceCard experience={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="bg-sand py-24">
        <div className="container-lux">
          <SectionHeading
            eyebrow="Related journeys"
            title={`Trips for ${experience.name.toLowerCase()} travellers`}
            description={`${experience.count} published ${experience.count === 1 ? "journey" : "journeys"} currently connected.`}
          />
          {experience.packages.length ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {experience.packages.map((pkg, index) => (
                <PackageCard key={pkg.slug} pkg={pkg} delay={index * 60} />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-muted-foreground">
              No published journeys are connected yet. Ask us for a custom
              itinerary.
            </p>
          )}
        </div>
      </section>
      {activeImage !== null && experience.gallery[activeImage] ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setActiveImage(null)}
        >
          <figure
            className="relative max-h-[92vh] max-w-6xl overflow-hidden rounded-2xl bg-black"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={experience.gallery[activeImage].image}
              alt={experience.gallery[activeImage].alt}
              className="max-h-[92vh] max-w-full object-contain"
            />
            <button
              type="button"
              onClick={() => setActiveImage(null)}
              aria-label="Close gallery preview"
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-black/70 text-white"
            >
              <X className="h-5 w-5" />
            </button>
            {experience.gallery[activeImage].title ||
            experience.gallery[activeImage].caption ? (
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-6 pt-16 text-white">
                <p className="font-semibold">
                  {experience.gallery[activeImage].title}
                </p>
                {experience.gallery[activeImage].caption ? (
                  <p className="mt-1 text-sm text-white/70">
                    {experience.gallery[activeImage].caption}
                  </p>
                ) : null}
              </figcaption>
            ) : null}
          </figure>
        </div>
      ) : null}
    </>
  );
}

function ExperienceList({
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
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
            ) : (
              <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            )}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function score(seed: string, value: string) {
  let hash = 2166136261;
  for (const char of `${seed}:${value}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function getRelatedExperiences(
  current: ExperienceCategory,
  all: ExperienceCategory[],
) {
  const eligible = all.filter((item) => item.id !== current.id);
  const sameType = (item: ExperienceCategory) =>
    current.experienceTypeOptionId && item.experienceTypeOptionId
      ? current.experienceTypeOptionId === item.experienceTypeOptionId
      : Boolean(current.type.trim()) &&
        current.type.trim().toLowerCase() === item.type.trim().toLowerCase();
  const same = eligible
    .filter(sameType)
    .sort((a, b) => score(current.id, a.id) - score(current.id, b.id));
  const fallback = eligible
    .filter((item) => !sameType(item))
    .sort((a, b) => score(current.id, a.id) - score(current.id, b.id));
  return [...same.slice(0, 3), ...fallback].slice(0, 3);
}
