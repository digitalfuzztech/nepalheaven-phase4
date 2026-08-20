export type Destination = {
  slug: string;
  name: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
  image: string;
  altitude: string;
  season: string;
  duration: string;
  difficulty: string;
  difficultyOptionId: string | null;
  short: string;
  description: string;
  highlights: string[];
  tips: string[];
  included: string[];
  excluded: string[];
  itinerary: { day: string; title: string; detail: string }[];
  category: string;
  destinationTypeOptionId: string | null;
  faqs: Array<{
    q: string;

    a: string;
  }>;
  gallery: Array<{
    id: string;

    image: string;

    title: string;

    alt: string;

    caption: string;
  }>;
};

export type Package = {
  id: string;
  slug: string;
  title: string;
  destination: string;
  destinations: { slug: string; name: string }[];
  image: string;
  days: number;
  durationMinDays: number;
  durationMaxDays: number;
  groupSizeMin: number;
  groupSizeMax: number;
  price: number;
  oldPrice?: number;
  currency: string;
  rating: number;
  reviews: number;
  difficulty: string;
  difficultyOptionId: string | null;
  style: string;
  packageTypeOptionId: string | null;
  short: string;
  overview: string;
  highlights: string[];
  itinerary: { day: string; title: string; detail: string }[];
  included: string[];
  excluded: string[];
  tiers: { name: string; note: string; price: number; currency: string }[];
  gallery: {
    id: string;
    image: string;
    title: string;
    alt: string;
    caption: string;
  }[];
  packageReviews: {
    rating: number;
    text: string;
    customerName: string;
    countryCode: string;
  }[];
  faqs: { q: string; a: string }[];
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  blogTypeOptionId: string | null;
  date: string;
  readingTime: string;
  author: { name: string; role: string };
  image: string;
  body: string[];
  highlights: string[];
  aboutAuthor: string;
  blocks: Array<{
    id: string;
    type: "text" | "highlight" | "image";
    content: string;
    image?: string;
    alt: string;
    caption: string;
  }>;
};

export type Testimonial = {
  name: string;
  country: string;
  trip: string;
  quote: string;
  rating: number;
  avatar?: string;
};

export type FaqGroup = {
  category: string;
  items: { q: string; a: string }[];
};

export type Company = {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: { day: string; time: string }[];
  officeLatitude?: number | null;
  officeLongitude?: number | null;
};

export type PublicBranding = {
  companyName: string;

  mainLogoUrl: string | null;

  lightLogoUrl: string | null;

  faviconUrl: string | null;

  defaultOgImageUrl: string | null;

  defaultSeoTitle: string;

  defaultSeoDescription: string;

  copyrightText: string;

  socialLinks: {
    facebook: string;
    instagram: string;
    youtube: string;
    tiktok: string;
    linkedin: string;
    x: string;
  };
};

export type PublicNavigationItem = {
  label: string;

  href: string;

  external: boolean;

  openNewTab: boolean;
};

export type PublicFooterMenus = {
  company: PublicNavigationItem[];

  destinations: PublicNavigationItem[];

  journal: PublicNavigationItem[];

  legal: PublicNavigationItem[];
};

export type PublicFooterContent = {
  companyDescription: string;

  journalDescription: string;

  logoUrl: string | null;

  menus: PublicFooterMenus;
};

export type Activity = { name: string; detail: string; icon: string };
export type ExperienceCategory = {
  id: string;
  slug: string;
  name: string;
  short: string;
  description: string;
  detail: string;
  type: string;
  experienceTypeOptionId: string | null;
  cardLinkText: string;
  overview: string;
  image: string;
  count: number;
  highlights: string[];
  itinerary: { day: string; title: string; detail: string }[];
  included: string[];
  excluded: string[];
  faqs: { q: string; a: string }[];
  gallery: {
    id: string;
    image: string;
    title: string;
    alt: string;
    caption: string;
  }[];
  packages: Package[];
  seoTitle: string;
  seoDescription: string;
};
export type Stat = { value: number; suffix: string; label: string };
export type GalleryItem = {
  type: "image" | "video";

  image?: string;
  videoUrl?: string;
  thumbnail?: string;
  provider?: string;

  title: string;
  alt?: string;
  caption?: string;

  /*
   * Existing public Gallery subject.
   *
   * Examples:
   * Mountains
   * Culture
   * Wildlife
   * Lakes
   */
  category: string;

  span: string;

  /*
   * Media Library CMS classification.
   *
   * Examples:
   * Destination
   * Packages
   * Experience
   *
   * General media is excluded from the public Gallery.
   */
  cmsCategory?: string;
  cmsCategoryValue?: string;

  /*
   * Media Library "Associated To" information.
   */
  associatedToKind?: "destination" | "package" | "experience" | "general";

  associatedToName?: string;
  associatedToSlug?: string;

  packageType?: string;
  packageTypeOptionId?: string;
  generalSettingsType?: string;
};
export type BlogComment = {
  id: string;
  customerName: string;
  avatarUrl?: string;
  content: string;
  createdAt: string;
};
export type BlogEngagement = {
  likeCount: number;
  hasLiked: boolean;
  averageRating: number | null;
  ratingCount: number;
  currentUserRating: number | null;
  comments: BlogComment[];
};
export type PublicSearchResults = {
  query: string;
  destinations: Destination[];
  packages: Package[];
  experiences: ExperienceCategory[];
  articles: Post[];
};
export type TeamMember = { name: string; role: string; bio: string };
export type Milestone = { year: string; title: string; detail: string };
export type WhyUsItem = { title: string; detail: string; icon: string };

export type SiteImages = {
  heroEverest: string;
  destEverest: string;
  destAnnapurna: string;
  destPokhara: string;
  destChitwan: string;
  destLumbini: string;
  destMustang: string;
  destRara: string;
  destBandipur: string;
  destKathmandu: string;
  expParagliding: string;
  ctaLodge: string;
};

export type PublicSiteSettings = {
  company: Company;
  branding: PublicBranding;
  activities: Activity[];
  experienceCategories: LegacyExperienceCategory[];
  stats: Stat[];
  galleryItems: GalleryItem[];
  team: TeamMember[];
  milestones: Milestone[];
  awards: string[];
  partners: string[];
  whyUs: WhyUsItem[];
  images: SiteImages;
  primaryNavigation: PublicNavigationItem[];
  footer: PublicFooterContent | null;
};
type LegacyExperienceCategory = {
  name: string;
  detail: string;
  image: string;
  count?: number;
};

export type HomeContent = PublicSiteSettings & {
  destinations: Destination[];
  packages: Package[];
  posts: Post[];
  testimonials: Testimonial[];
};

export type ShellContent = {
  company: Company;

  branding: PublicBranding;
  primaryNavigation: PublicNavigationItem[];
  footer: PublicFooterContent | null;

  destinations: Pick<Destination, "slug" | "name">[];

  packages: Pick<Package, "slug" | "title">[];
};
