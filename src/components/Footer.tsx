import { Link } from "@tanstack/react-router";
import {
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import type {
  PublicNavigationItem,
  ShellContent,
} from "@/lib/content.types";

import whiteLogo from "@/assets/logo-light4.png";
import { NewsletterForm } from "@/components/NewsletterForm";

const legacyCompanyLinks: PublicNavigationItem[] = [
  {
    label: "About us",
    href: "/about",
    external: false,
    openNewTab: false,
  },
  {
    label: "Experiences",
    href: "/experiences",
    external: false,
    openNewTab: false,
  },
  {
    label: "Travel stories",
    href: "/blog",
    external: false,
    openNewTab: false,
  },
  {
    label: "Gallery",
    href: "/gallery",
    external: false,
    openNewTab: false,
  },
  {
    label: "FAQ",
    href: "/faq",
    external: false,
    openNewTab: false,
  },
  {
    label: "Contact",
    href: "/contact",
    external: false,
    openNewTab: false,
  },
];

function FooterNavigationLink({
                                item,
                                className,
                              }: {
  item: PublicNavigationItem;
  className?: string;
}) {
  if (item.external) {
    return (
        <a
            href={item.href}
            target={item.openNewTab ? "_blank" : undefined}
            rel={item.openNewTab ? "noopener noreferrer" : undefined}
            className={className}
        >
          {item.label}
        </a>
    );
  }

  /*
   * Internal CMS links stay inside TanStack Router
   * so Footer navigation remains SPA navigation.
   */
  return (
      <Link
          to={item.href as never}
          className={className}
      >
        {item.label}
      </Link>
  );
}

export function Footer({
                         company,
                         branding,
                         footer,
                         destinations,
                         packages,
                       }: ShellContent) {
  /*
   * Footer-specific logo wins.
   *
   * If none is assigned:
   *   CMS Light Logo
   *       ↓
   *   existing Phase 3 white logo
   */
  const footerLogo =
      footer?.logoUrl ||
      branding.lightLogoUrl ||
      whiteLogo;

  const companyDescription =
      footer?.companyDescription?.trim() ||
      "Fifteen years designing private Himalayan journeys — from the Khumbu icefall to the walled lanes of Lo Manthang. Licensed, insured and locally owned in Kathmandu.";

  const journalDescription =
      footer?.journalDescription?.trim() ||
      "Seasonal route notes, permit changes and quiet-season offers. One considered email a month.";

  /*
   * Company links:
   * CMS when configured,
   * exact Phase 3 links otherwise.
   */
  const companyLinks =
      footer?.menus.company &&
      footer.menus.company.length > 0
          ? footer.menus.company
          : legacyCompanyLinks;

  /*
   * Destinations:
   * CMS menu when configured.
   *
   * Otherwise preserve the original
   * first-six-destinations behavior.
   */
  const destinationLinks: PublicNavigationItem[] =
      footer?.menus.destinations &&
      footer.menus.destinations.length > 0
          ? footer.menus.destinations
          : destinations.slice(0, 6).map((destination) => ({
            label: destination.name,
            href: `/destinations/${destination.slug}`,
            external: false,
            openNewTab: false,
          }));

  /*
   * There was no equivalent Journal navigation
   * in the Phase 3 Footer, so an empty CMS menu
   * simply renders nothing.
   */
  const journalLinks =
      footer?.menus.journal ?? [];

  /*
   * Same for Legal links — don't invent Privacy,
   * Terms, etc. when the CMS has none configured.
   */
  const legalLinks =
      footer?.menus.legal ?? [];

  const socialLinks = [
    {
      Icon: Instagram,
      label: "Instagram",
      href: branding.socialLinks.instagram,
    },
    {
      Icon: Facebook,
      label: "Facebook",
      href: branding.socialLinks.facebook,
    },
    {
      Icon: Youtube,
      label: "YouTube",
      href: branding.socialLinks.youtube,
    },
    {
      Icon: Twitter,
      label: "X",
      href: branding.socialLinks.x,
    },
  ];

  const copyrightText =
      branding.copyrightText.trim() ||
      "Nepal Heaven Travels & Tours Pvt. Ltd. All rights reserved.";

  return (
      <footer className="bg-summit relative mt-24 overflow-hidden text-primary-foreground">
        <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl"
        />

        <div className="container-lux relative py-20">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
            {/* Company */}
            <div>
              <div className="flex items-center gap-3">
                <img
                    src={footerLogo}
                    alt={company.name}
                    className="h-30 w-auto transition-all duration-500"
                />
              </div>

              <p className="mt-5 max-w-sm text-sm leading-relaxed text-primary-foreground/70">
                {companyDescription}
              </p>

              <ul className="mt-6 space-y-3 text-sm text-primary-foreground/75">
                <li className="flex gap-3">
                  <MapPin
                      className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                      aria-hidden
                  />

                  {company.address}
                </li>

                <li className="flex gap-3">
                  <Phone
                      className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                      aria-hidden
                  />

                  <a
                      className="hover:text-gold"
                      href={`tel:${company.phone.replace(/\s/g, "")}`}
                  >
                    {company.phone}
                  </a>
                </li>

                <li className="flex gap-3">
                  <Mail
                      className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                      aria-hidden
                  />

                  <a
                      className="hover:text-gold"
                      href={`mailto:${company.email}`}
                  >
                    {company.email}
                  </a>
                </li>
              </ul>
            </div>

            {/* Company links */}
            <nav aria-label="Quick links">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gold">
                Company
              </h3>

              <ul className="mt-5 space-y-3 text-sm text-primary-foreground/75">
                {companyLinks.map((item) => (
                    <li
                        key={`${item.label}-${item.href}`}
                    >
                      <FooterNavigationLink
                          item={item}
                          className="transition-colors hover:text-gold"
                      />
                    </li>
                ))}
              </ul>
            </nav>

            {/* Destinations */}
            <nav aria-label="Destinations">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gold">
                Destinations
              </h3>

              <ul className="mt-5 space-y-3 text-sm text-primary-foreground/75">
                {destinationLinks.map((item) => (
                    <li
                        key={`${item.label}-${item.href}`}
                    >
                      <FooterNavigationLink
                          item={item}
                          className="transition-colors hover:text-gold"
                      />
                    </li>
                ))}
              </ul>
            </nav>

            {/* Journal */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gold">
                Journal
              </h3>

              <p className="mt-5 text-sm leading-relaxed text-primary-foreground/70">
                {journalDescription}
              </p>

              {journalLinks.length > 0 ? (
                  <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
                    {journalLinks.map((item) => (
                        <li
                            key={`${item.label}-${item.href}`}
                        >
                          <FooterNavigationLink
                              item={item}
                              className="transition-colors hover:text-gold"
                          />
                        </li>
                    ))}
                  </ul>
              ) : null}

              <div className="mt-5">
                <NewsletterForm
                    source="footer"
                    dark
                />
              </div>

              <h3 className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-gold">
                Top packages
              </h3>

              <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
                {packages
                    .slice(0, 4)
                    .map((packageItem) => (
                        <li
                            key={
                              packageItem.slug
                            }
                        >
                          <Link
                              to="/packages/$slug"
                              params={{
                                slug:
                                packageItem.slug,
                              }}
                              className="transition-colors hover:text-gold"
                          >
                            {
                              packageItem.title
                            }
                          </Link>
                        </li>
                    ))}
              </ul>
            </div>
          </div>

          {/* Bottom row */}
          <div className="mt-14 flex flex-col-reverse items-center justify-between gap-6 border-t border-primary-foreground/15 pt-8 sm:flex-row">
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <p className="text-xs text-primary-foreground/60">
                © {new Date().getFullYear()}{" "}
                {copyrightText}
              </p>

              {legalLinks.length > 0 ? (
                  <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-primary-foreground/60 sm:justify-start">
                    {legalLinks.map((item) => (
                        <li
                            key={`${item.label}-${item.href}`}
                        >
                          <FooterNavigationLink
                              item={item}
                              className="transition-colors hover:text-gold"
                          />
                        </li>
                    ))}
                  </ul>
              ) : null}
            </div>

            <ul className="flex items-center gap-3">
              {socialLinks.map(
                  ({
                     Icon,
                     label,
                     href,
                   }) => (
                      <li key={label}>
                        <a
                            href={
                                href || "#"
                            }
                            target={
                              href
                                  ? "_blank"
                                  : undefined
                            }
                            rel={
                              href
                                  ? "noopener noreferrer"
                                  : undefined
                            }
                            aria-label={`${company.name} on ${label}`}
                            className="grid h-10 w-10 place-items-center rounded-full border border-primary-foreground/20 text-primary-foreground/80 transition-colors hover:border-gold hover:text-gold"
                        >
                          <Icon
                              className="h-4 w-4"
                              aria-hidden
                          />
                        </a>
                      </li>
                  ),
              )}
            </ul>
          </div>
        </div>
      </footer>
  );
}