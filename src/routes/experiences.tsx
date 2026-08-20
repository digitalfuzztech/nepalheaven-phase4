import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import {
  getExperiencesFn,
  getPublicSiteSettingsFn,
} from "@/lib/content.functions";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { CtaBanner } from "@/components/CtaBanner";
import { getPublicExperienceListingFn } from "@/lib/cms-page-content.functions";
import { ExperienceCard } from "@/components/ExperienceCard";

export const Route = createFileRoute("/experiences")({
  loader: async () => {
    const [experienceCategories, settings, listing] = await Promise.all([
      getExperiencesFn(),
      getPublicSiteSettingsFn(),
      getPublicExperienceListingFn(),
    ]);
    return { experienceCategories, images: settings.images, listing };
  },
  head: () => ({
    meta: [
      {
        title:
          "Nepal Experiences — Adventure, Culture, Wellness | Nepal Heaven",
      },
      {
        name: "description",
        content:
          "Choose how you travel: adventure, luxury, culture, wellness, photography, pilgrimage, food, family or honeymoon journeys in Nepal.",
      },
      { property: "og:title", content: "Nepal Experiences | Nepal Heaven" },
      {
        property: "og:description",
        content:
          "Nine ways to travel Nepal, each designed around a different kind of traveller.",
      },
      { property: "og:url", content: "/experiences" },
    ],
    links: [{ rel: "canonical", href: "/experiences" }],
  }),
  component: ExperiencesPage,
});

function ExperiencesPage() {
  const pathname = useLocation().pathname;
  if (pathname !== "/experiences" && pathname !== "/experiences/")
    return <Outlet />;
  const { experienceCategories, images, listing } = Route.useLoaderData();
  return (
    <>
      <PageHero
        image={listing.heroImageUrl ?? images.expParagliding}
        eyebrow={listing.heroSubtitle}
        title={listing.heroTitle}
        description={listing.heroDescription}
        crumbs={[{ label: "Home", to: "/" }, { label: "Experiences" }]}
      />

      <section className="container-lux py-20 lg:py-28">
        <SectionHeading
          eyebrow={listing.sectionTwoSubtitle}
          title={listing.sectionTwoTitle}
          description={listing.sectionTwoDescription}
        />

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {experienceCategories.map((c, i) => (
            <Reveal key={c.name} as="li" delay={i * 60}>
              <ExperienceCard experience={c} />
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="bg-summit py-24">
        <div className="container-lux grid gap-12 lg:grid-cols-2 lg:items-center">
          <SectionHeading
            eyebrow={listing.sectionThreeSubtitle}
            tone="light"
            title={listing.sectionThreeTitle}
            description={listing.sectionThreeDescription}
          />
          <div className="glass-dark rounded-3xl p-8">
            <ul className="space-y-5 text-primary-foreground/80">
              {listing.highlightedTexts.map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="bg-gold-gradient grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold text-gold-foreground">
                    {i + 1}
                  </span>
                  <span className="pt-1 text-sm">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="py-24">
        <CtaBanner />
      </div>
    </>
  );
}
