import {
  createFileRoute,
  Link,
  redirect,
} from "@tanstack/react-router";

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
  SlidersHorizontal,
  Star,
  PanelBottom,
} from "lucide-react";

import {
  AdminShell,
} from "@/components/admin/AdminShell";

import {
  getAdminSessionFn,
} from "@/lib/auth.functions";

import {
  getCmsOverviewFn,
} from "@/lib/admin-overview.functions";

export const Route =
    createFileRoute("/admin_/cms")({
      loader: async () => {
        const admin =
            await getAdminSessionFn();

        if (!admin) {
          throw redirect({
            to: "/admin",
            search: {
              redirect: "/admin/cms",
            },
          });
        }

        const overview =
            await getCmsOverviewFn();

        return {
          admin,
          overview,
        };
      },

      component: AdminCmsPage,
    });

function AdminCmsPage() {
  const {
    overview,
  } = Route.useLoaderData();

  const modules = [
    {
      title: "General Settings",
      description:
          "Company identity, contact information, logos, social links and global website settings.",
      icon: Settings2,
      value: overview.generalSettings,
      valueLabel:
          overview.generalSettings === 1
              ? "configured record"
              : "records",
      to: "/admin/cms/general" as const,
    },
    {
      title: "Other Settings",
      description:
          "Reusable categories, difficulty levels and destination, package, experience and general content types.",
      icon: SlidersHorizontal,
      value: 6,
      valueLabel: "option groups",
      to: "/admin/cms/other-settings" as const,
    },

    {
      title: "Navigation",
      description:
          "Primary navigation and footer menu structure.",
      icon: Navigation,
      value: overview.navigationMenus,
      valueLabel: "menus",
      to: "/admin/cms/navigation" as const,
    },

    {
      title: "Footer",
      description:
          "Footer-specific copy, menu groups, legal links and featured package references.",
      icon: PanelBottom,
      value: overview.footerSettings,
      valueLabel:
          overview.footerSettings === 1
              ? "configured record"
              : "records",
      to: "/admin/cms/footer" as const,
    },

    {
      title: "Homepage",
      description:
          "Hero content, featured destinations, packages, testimonials, journal and homepage sections.",
      icon: Globe2,
      value: overview.pages,
      valueLabel: "CMS pages available",
      to: null,
    },

    {
      title: "Destinations",
      description:
          "Destination pages, highlights, itineraries, travel information and SEO.",
      icon: Map,
      value: overview.destinations,
      valueLabel: "destinations",
      to: "/admin/cms/destinations" as const,
    },

    {
      title: "Packages",
      description:
          "Journey packages, pricing tiers, itineraries, inclusions and cancellation policies.",
      icon: PackageOpen,
      value: overview.packages,
      valueLabel: "packages",
      to: null,
    },

    {
      title: "Experiences",
      description:
          "Experience categories and their related journeys.",
      icon: Mountain,
      value: overview.experiences,
      valueLabel: "experiences",
      to: null,
    },

    {
      title: "Blog",
      description:
          "Articles, categories, authors and publishing.",
      icon: FileText,
      value: overview.blogPosts,
      valueLabel: "articles",
      to: null,
    },

    {
      title: "Gallery & Media",
      description:
          "Reusable website images, videos, metadata and gallery content.",
      icon: GalleryHorizontalEnd,
      value: overview.media,
      valueLabel: "media records",
      to: "/admin/cms/media" as const,
    },

    {
      title: "Testimonials",
      description:
          "Traveller testimonials and featured reviews.",
      icon: Star,
      value: overview.testimonials,
      valueLabel: "testimonials",
      to: null,
    },

    {
      title: "FAQs",
      description:
          "Frequently asked questions used throughout the website.",
      icon: MessageCircleQuestion,
      value: overview.faqs,
      valueLabel: "FAQs",
      to: null,
    },

    {
      title: "Email Templates",
      description:
          "Customer and internal transactional email templates.",
      icon: Mail,
      value: overview.emailTemplates,
      valueLabel: "templates",
      to: "/admin/cms/email-templates" as const,
    },

    {
      title: "SEO",
      description:
          "Default metadata and page-level search visibility settings.",
      icon: Image,
      value: overview.pages,
      valueLabel: "page identities",
      to: null,
    },
  ];

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
                Manage the content displayed
                across Nepal Heaven. Website
                design and application logic
                remain controlled by the
                codebase.
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
                  CMS foundation connected
                </p>

                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  These record counts now come
                  directly from MariaDB.
                  Individual editors will be
                  activated progressively as
                  each CMS module is built and
                  verified.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {modules.map(
                (module) => {
                  const Icon =
                      module.icon;

                  return (
                      <section
                          key={module.title}
                          className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0c1724] text-gold">
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-semibold text-[#0c1724]">
                              {
                                module.value
                              }
                            </p>

                            <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                              {
                                module.valueLabel
                              }
                            </p>
                          </div>
                        </div>

                        <h2 className="mt-5 text-lg font-semibold text-[#0c1724]">
                          {
                            module.title
                          }
                        </h2>

                        <p className="mt-2 min-h-16 text-sm leading-relaxed text-muted-foreground">
                          {
                            module.description
                          }
                        </p>

                        <div className="mt-5">
                          {module.to ? (
                              <Link
                                  to={module.to}
                                  className="inline-flex rounded-full bg-[#0c1724] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#16283b]"
                              >
                                Open editor
                              </Link>
                          ) : (
                              <span className="inline-flex rounded-full bg-black/5 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
      Editor coming in Phase 4
    </span>
                          )}
                        </div>
                      </section>
                  );
                },
            )}
          </div>
        </div>
      </AdminShell>
  );
}