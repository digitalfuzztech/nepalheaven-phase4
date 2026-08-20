import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import type { ExperienceCategory } from "@/lib/content.types";

export function ExperienceCard({
  experience,
}: {
  experience: ExperienceCategory;
}) {
  return (
    <Link
      to="/experiences/$slug"
      params={{ slug: experience.slug }}
      className="zoom-media hover-lift group relative flex h-full min-h-[24rem] flex-col justify-end overflow-hidden rounded-3xl"
    >
      <img
        src={experience.image}
        alt={experience.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="bg-veil absolute inset-0" />
      <div className="relative p-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
          {experience.count} journeys
        </p>
        <h2 className="mt-3 text-2xl text-primary-foreground">
          {experience.name}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-primary-foreground/80">
          {experience.detail}
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold transition-transform duration-500 group-hover:translate-x-1">
          {experience.cardLinkText}
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
