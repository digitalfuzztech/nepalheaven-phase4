import {
  createFileRoute,
  Link,
  redirect,
} from "@tanstack/react-router";
import { getAdminSessionFn } from "@/lib/auth.functions";
import {
  BookOpen,
  FileText,
  GalleryHorizontalEnd,
  Globe2,
  Image,
  Mail,
  Map,
  MessageCircleQuestion,
  Mountain,
  Navigation,
  PackageOpen,
  Settings2,
  Star,
} from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";


export const Route = createFileRoute("/admin_/cms")({
  loader: async () => {
    const admin = await getAdminSessionFn();

    if (!admin) {
      throw redirect({
        to: "/admin",
        search: {
          redirect: "/admin/cms",
        },
      });
    }

    return admin;
  },

  component: AdminCmsPage,
});

const modules = [
  {
    title: "General Settings",
    description:
        "Company identity, contact information, logos, social links and global website settings.",
    icon: Settings2,
    futurePath: "/admin/cms/general",
  },
  {
    title: "Navigation",
    description:
        "Primary navigation and footer menu structure.",
    icon: Navigation,
    futurePath: "/admin/cms/navigation",
  },
  {
    title: "Homepage",
    description:
        "Hero content, featured destinations, packages, testimonials, journal and homepage sections.",
    icon: Globe2,
    futurePath: "/admin/cms/home",
  },
  {
    title: "Destinations",
    description:
        "Destination pages, highlights, itineraries, travel information and SEO.",
    icon: Map,
    futurePath: "/admin/cms/destinations",
  },
  {
    title: "Packages",
    description:
        "Journey packages, pricing tiers, itineraries, inclusions and cancellation policies.",
    icon: PackageOpen,
    futurePath: "/admin/cms/packages",
  },
  {
    title: "Experiences",
    description:
        "Experience categories and their related journeys.",
    icon: Mountain,
    futurePath: "/admin/cms/experiences",
  },
  {
    title: "Blog",
    description:
        "Articles, categories, authors and publishing.",
    icon: FileText,
    futurePath: "/admin/cms/blog",
  },
  {
    title: "Gallery & Media",
    description:
        "Reusable website images, videos, metadata and gallery content.",
    icon: GalleryHorizontalEnd,
    futurePath: "/admin/cms/gallery",
  },
  {
    title: "Testimonials",
    description:
        "Traveller testimonials and featured reviews.",
    icon: Star,
    futurePath: "/admin/cms/testimonials",
  },
  {
    title: "FAQs",
    description:
        "Frequently asked questions used throughout the website.",
    icon: MessageCircleQuestion,
    futurePath: "/admin/cms/faqs",
  },
  {
    title: "Email Templates",
    description:
        "Customer and internal transactional email templates.",
    icon: Mail,
    futurePath: "/admin/cms/email-templates",
  },
  {
    title: "SEO",
    description:
        "Default metadata and page-level search visibility settings.",
    icon: Image,
    futurePath: "/admin/cms/seo",
  },
] as const;

function AdminCmsPage() {


  return (
      <AdminShell>
        <div className="p-5 lg:p-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                Website
              </p>

              <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0c1724]">
                Content Management System
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Manage the content displayed across Nepal Heaven.
                Website design and application logic remain
                controlled by the codebase.
              </p>
            </div>

            <Link
                to="/"
                target="_blank"
                className="inline-flex w-fit items-center rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-[#0c1724] shadow-sm transition hover:bg-black/5"
            >
              View website
            </Link>
          </div>

          <div className="mt-8 rounded-2xl border border-gold/25 bg-gold/5 p-5">
            <div className="flex gap-3">
              <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-gold" />

              <div>
                <p className="text-sm font-semibold text-[#0c1724]">
                  Phase 4 CMS
                </p>

                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  The CMS foundation is being built progressively.
                  Each module becomes editable only after its
                  database model, validation and public rendering
                  path have been verified.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => {
              const Icon = module.icon;

              return (
                  <section
                      key={module.title}
                      className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0c1724] text-gold">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h2 className="mt-5 text-lg font-semibold text-[#0c1724]">
                      {module.title}
                    </h2>

                    <p className="mt-2 min-h-16 text-sm leading-relaxed text-muted-foreground">
                      {module.description}
                    </p>

                    <div className="mt-5">
                  <span className="inline-flex rounded-full bg-black/5 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                    Editor coming in Phase 4
                  </span>
                    </div>
                  </section>
              );
            })}
          </div>
        </div>
      </AdminShell>
  );
}