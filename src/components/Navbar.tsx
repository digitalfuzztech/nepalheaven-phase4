import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Menu, Phone, Search, X, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import lightLogo from "@/assets/logo-light4.png";
import darkLogo from "@/assets/logo-dark2.png";
import type {
  Company,
  PublicBranding,
  PublicNavigationItem,
} from "@/lib/content.types";

const legacyLinks: PublicNavigationItem[] = [
  {
    label: "Home",
    href: "/",
    external: false,
    openNewTab: false,
  },
  {
    label: "Destinations",
    href: "/destinations",
    external: false,
    openNewTab: false,
  },
  {
    label: "Packages",
    href: "/packages",
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
    label: "About",
    href: "/about",
    external: false,
    openNewTab: false,
  },
  {
    label: "Blog",
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
    label: "Contact",
    href: "/contact",
    external: false,
    openNewTab: false,
  },
];


function usesSolidNavbar(pathname: string) {
  return (
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/verify-email" ||
    pathname === "/login" ||
    pathname === "/registration" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname.startsWith("/book/") ||
    pathname.startsWith("/booking/")
  );
}
function isNavigationItemActive(
    pathname: string,
    item: PublicNavigationItem,
) {
  if (item.external) {
    return false;
  }

  if (item.href === "/") {
    return pathname === "/";
  }

  return (
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`)
  );
}

function NavigationItemLink({
                              item,
                              className,
                              onClick,
                            }: {
  item: PublicNavigationItem;
  className?: string;
  onClick?: () => void;
}) {
  /*
   * External CMS links use a normal anchor.
   */
  if (item.external) {
    return (
        <a
            href={item.href}
            target={item.openNewTab ? "_blank" : undefined}
            rel={item.openNewTab ? "noopener noreferrer" : undefined}
            onClick={onClick}
            className={className}
        >
          {item.label}
        </a>
    );
  }

  /*
   * Internal CMS links must use TanStack Link
   * so navigation remains client-side / SPA.
   *
   * CMS paths are dynamic strings rather than
   * compile-time route literals, hence the cast.
   */
  return (
      <Link
          to={item.href as never}
          onClick={onClick}
          className={className}
      >
        {item.label}
      </Link>
  );
}
export function Navbar({
                         company,
                         branding,
                         primaryNavigation,
                       }: {
  company: Company;

  branding:
      PublicBranding;

  primaryNavigation:
      PublicNavigationItem[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const pathname = useLocation().pathname;
  const forceSolid = usesSolidNavbar(pathname);
  const effectiveScrolled = forceSolid || scrolled;
  const navbarDarkLogo =
      branding.mainLogoUrl ||
      darkLogo;

  const navbarLightLogo =
      branding.lightLogoUrl ||
      lightLogo;
  const links =
      primaryNavigation.length > 0
          ? primaryNavigation
          : legacyLinks;


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!searchOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [searchOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
        !forceSolid &&
          "transition-[background-color,box-shadow,padding,border-color] duration-500",
        effectiveScrolled
          ? "border-b border-border/60 bg-background/70 py-2 shadow-[var(--shadow-soft)] backdrop-blur-2xl [backdrop-filter:blur(24px)_saturate(160%)]"
          : "border-b border-transparent bg-transparent py-5",
      )}
    >
      <div className="container-lux grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 lg:flex lg:justify-between">
        <Link
          to="/"
          className="flex items-center"
          aria-label={`${company.name} home`}
        >
          <img
            src={effectiveScrolled ? navbarDarkLogo : navbarLightLogo}
            alt="Nepal Heaven"
            className={
              effectiveScrolled
                ? "h-14 w-auto"
                : "h-16 w-auto transition-all duration-500"
            }
          />
        </Link>
        <nav aria-label="Primary" className="hidden xl:block">
          <ul className="flex items-center gap-1 whitespace-nowrap">
            {links.map((item) => {
              const active = isNavigationItemActive(
                  pathname,
                  item,
              );

              return (
                  <li
                      key={`${item.label}-${item.href}`}
                  >
                    <NavigationItemLink
                        item={item}
                        className={cn(
                            "relative inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-300",

                            effectiveScrolled
                                ? "text-foreground/75 hover:text-foreground"
                                : "text-primary-foreground/85 hover:text-primary-foreground",

                            "after:absolute after:inset-x-3.5 after:bottom-1 after:h-px after:origin-right after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100",

                            active &&
                            "text-gold after:origin-left after:scale-x-100",
                        )}
                    />
                  </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen((s) => !s)}
            aria-label="Search the site"
            aria-expanded={searchOpen}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full border transition-colors duration-300",
              effectiveScrolled
                ? "border-border text-foreground hover:border-gold hover:text-gold"
                : "border-primary-foreground/30 text-primary-foreground hover:border-gold hover:text-gold",
            )}
          >
            <Search className="h-4 w-4" aria-hidden />
          </button>

          <a
            href={`tel:${company.phone.replace(/\s/g, "")}`}
            className={cn(
              "hidden items-center gap-2 text-sm font-semibold transition-colors duration-300 lg:inline-flex",
              effectiveScrolled
                ? "text-foreground hover:text-gold"
                : "text-primary-foreground hover:text-gold",
            )}
          >
            <Phone className="h-4 w-4" aria-hidden />
            {company.phone}
          </a>

          <Link
            to={user?.role === "customer" ? "/account" : "/login"}
            aria-label={
              user?.role === "customer" ? "Open traveller account" : "Sign in"
            }
            className={cn(
              "hidden h-10 w-10 place-items-center rounded-full border sm:grid",
              effectiveScrolled
                ? "border-border text-foreground hover:border-gold hover:text-gold"
                : "border-primary-foreground/30 text-primary-foreground hover:border-gold hover:text-gold",
            )}
          >
            <UserRound className="h-4 w-4" />
          </Link>
          <Link
            to="/packages"
            className="bg-gold-gradient hidden rounded-full px-5 py-2.5 text-sm font-bold text-gold-foreground shadow-[var(--shadow-soft)] transition-transform duration-300 hover:scale-[1.04] sm:inline-flex"
          >
            Book Now
          </Link>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full border transition-colors duration-300 xl:hidden",
              effectiveScrolled
                ? "border-border text-foreground"
                : "border-primary-foreground/30 text-primary-foreground",
            )}
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {searchOpen ? (
        <div className="container-lux mt-3">
          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              const q = searchQuery.trim();
              if (!q) return;
              setSearchOpen(false);
              void navigate({ to: "/search", search: { q } });
            }}
            className="glass-card animate-reveal flex items-center gap-3 rounded-2xl px-5 py-3"
          >
            <Search
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <input
              autoFocus
              type="search"
              placeholder="Search destinations, treks, experiences…"
              aria-label="Search destinations"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!searchQuery.trim()}
              className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"
            >
              Search
            </button>
          </form>
        </div>
      ) : null}

      {open ? (
        <nav aria-label="Mobile" className="container-lux mt-3 xl:hidden">
          <ul className="glass-card animate-reveal grid gap-1 rounded-3xl p-3">
            {links.map((item) => {
              const active = isNavigationItemActive(
                  pathname,
                  item,
              );

              return (
                  <li
                      key={`${item.label}-${item.href}`}
                  >
                    <NavigationItemLink
                        item={item}
                        onClick={() => setOpen(false)}
                        className={cn(
                            "block rounded-2xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent",

                            active &&
                            "bg-accent text-primary",
                        )}
                    />
                  </li>
              );
            })}
            <li>
              <Link
                to={user?.role === "customer" ? "/account" : "/login"}
                onClick={() => setOpen(false)}
                className="block rounded-2xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
              >
                {user?.role === "customer" ? "My account" : "Sign in"}
              </Link>
            </li>
            <li>
              <Link
                to="/compare"
                onClick={() => setOpen(false)}
                className="block rounded-2xl border border-border px-4 py-3 text-center text-sm font-semibold"
              >
                Compare trips
              </Link>
            </li>
            <li className="px-1 pb-1 pt-2">
              <a
                href={`tel:${company.phone.replace(/\s/g, "")}`}
                className="block rounded-2xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
              >
                Call {company.phone}
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
