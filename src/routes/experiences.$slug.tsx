import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, MessageCircle, Sparkles } from "lucide-react";
import { getExperienceBySlugFn, getExperiencesFn } from "@/lib/content.functions";
import { submitExperienceInquiryFn } from "@/lib/lead.functions";
import { useAuth } from "@/lib/auth";
import { PageHero } from "@/components/PageHero";
import { PackageCard } from "@/components/PackageCard";
import { SectionHeading } from "@/components/SectionHeading";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { FaqAccordion } from "@/components/FaqAccordion";
import type { ExperienceCategory } from "@/lib/content.types";

export const Route = createFileRoute("/experiences/$slug")({
  loader: async ({ params }) => {
    const [experience, experiences] = await Promise.all([getExperienceBySlugFn({
      data: { slug: params.slug },
    }), getExperiencesFn()]);
    if (!experience) throw notFound();
    return { experience, experiences };
  },
  head: ({ loaderData, params }) =>
    loaderData
      ? {
          meta: [
            { title: loaderData.experience.seoTitle },
            { name: "description", content: loaderData.experience.seoDescription },
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
  const relatedExperiences = useMemo(() => getRelatedExperiences(experience, experiences), [experience, experiences]);
  useEffect(() => { if (activeImage === null) return; const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setActiveImage(null);};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close); }, [activeImage]);
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
      <section className="container-lux grid gap-12 py-20 lg:grid-cols-[1.25fr_0.75fr] lg:py-28">
        <div>
          <p className="text-lg leading-8 text-muted-foreground">
            {experience.overview || experience.description}
          </p>
          <h2 className="mt-10 text-3xl">What travellers can expect</h2>
          <ul className="mt-6 grid gap-3">
            {experience.highlights.map((item) => (
              <li key={item} className="flex gap-3 rounded-2xl bg-sand p-4">
                <Check className="mt-1 h-4 w-4 shrink-0 text-forest" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <aside className="rounded-3xl border border-gold/25 bg-card p-8">
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
        </aside>
      </section>
      {experience.itinerary.length || experience.included.length || experience.excluded.length ? <section className="bg-sand py-24"><div className="container-lux grid gap-12 lg:grid-cols-2"><div><SectionHeading eyebrow="Day by day" title="Experience itinerary"/><div className="mt-8 space-y-4">{experience.itinerary.map((row)=><div key={`${row.day}-${row.title}`} className="rounded-2xl bg-card p-5"><p className="text-xs font-bold uppercase text-gold">{row.day}</p><h3 className="mt-2 text-lg">{row.title}</h3><p className="mt-2 text-sm text-muted-foreground">{row.detail}</p></div>)}</div></div><div className="grid gap-8 sm:grid-cols-2"><div><h2 className="text-2xl">Included</h2><ul className="mt-5 space-y-2">{experience.included.map((item)=><li key={item} className="flex gap-2"><Check className="h-4 w-4 text-forest"/>{item}</li>)}</ul></div><div><h2 className="text-2xl">Not included</h2><ul className="mt-5 space-y-2">{experience.excluded.map((item)=><li key={item}>{item}</li>)}</ul></div></div></div></section>:null}
      {experience.gallery.length?<section className="container-lux py-24"><div className="flex items-end justify-between"><SectionHeading eyebrow="Gallery" title={`${experience.name} in pictures`}/>{experience.gallery.length>6?<a href={`/gallery?category=experience&associatedTo=${experience.slug}`} target="_blank" rel="noreferrer" className="font-semibold text-gold">See More</a>:null}</div><ul className="mt-10 grid auto-rows-[13rem] grid-cols-2 gap-4 lg:grid-cols-3">{experience.gallery.slice(0,6).map((item,index)=><li key={item.id}><button type="button" onClick={()=>setActiveImage(index)} className="h-full w-full overflow-hidden rounded-3xl"><img src={item.image} alt={item.alt} className="h-full w-full object-cover"/></button></li>)}</ul></section>:null}
      {experience.faqs.length?<section className="bg-sand py-24"><div className="container-lux max-w-3xl"><SectionHeading eyebrow="Questions" title="Experience FAQs"/><div className="mt-8"><FaqAccordion items={experience.faqs}/></div></div></section>:null}
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
      {relatedExperiences.length?<section className="container-lux py-24"><SectionHeading eyebrow="Explore more" title="Related experiences"/><div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{relatedExperiences.map((item)=><Link key={item.id} to="/experiences/$slug" params={{slug:item.slug}} className="overflow-hidden rounded-3xl border bg-card"><img src={item.image} alt={item.name} className="aspect-[16/10] w-full object-cover"/><div className="p-6"><p className="text-xs font-bold uppercase text-gold">{item.type}</p><h3 className="mt-2 text-xl">{item.name}</h3></div></Link>)}</div></section>:null}
      {activeImage!==null&&experience.gallery[activeImage]?<div className="fixed inset-0 z-[100] grid place-items-center bg-black/90 p-5" role="dialog" aria-modal="true" onClick={()=>setActiveImage(null)}><button type="button" onClick={()=>setActiveImage(null)} className="absolute right-5 top-5 rounded-full bg-white px-4 py-2">Close</button><figure onClick={(e)=>e.stopPropagation()}><img src={experience.gallery[activeImage].image} alt={experience.gallery[activeImage].alt} className="max-h-[82vh] max-w-[90vw] rounded-2xl"/><figcaption className="mt-3 text-center text-white">{experience.gallery[activeImage].caption||experience.gallery[activeImage].title}</figcaption></figure></div>:null}
    </>
  );
}

function score(seed:string,value:string){let hash=2166136261;for(const char of `${seed}:${value}`){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619);}return hash>>>0;}
function getRelatedExperiences(current:ExperienceCategory,all:ExperienceCategory[]){const eligible=all.filter((item)=>item.id!==current.id);const sameType=(item:ExperienceCategory)=>current.experienceTypeOptionId&&item.experienceTypeOptionId?current.experienceTypeOptionId===item.experienceTypeOptionId:Boolean(current.type.trim())&&current.type.trim().toLowerCase()===item.type.trim().toLowerCase();const same=eligible.filter(sameType).sort((a,b)=>score(current.id,a.id)-score(current.id,b.id));const fallback=eligible.filter((item)=>!sameType(item)).sort((a,b)=>score(current.id,a.id)-score(current.id,b.id));return [...same.slice(0,3),...fallback].slice(0,3);}
