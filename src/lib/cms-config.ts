export type CmsPageDefinition = {
    key: string;
    name: string;
    routePath: string | null;
};

export const cmsPageDefinitions: CmsPageDefinition[] = [
    {
        key: "home",
        name: "Homepage",
        routePath: "/",
    },
    {
        key: "destinations-index",
        name: "Destinations Listing",
        routePath: "/destinations",
    },
    {
        key: "packages-index",
        name: "Packages Listing",
        routePath: "/packages",
    },
    {
        key: "experiences-index",
        name: "Experiences Listing",
        routePath: "/experiences",
    },
    {
        key: "about",
        name: "About",
        routePath: "/about",
    },
    {
        key: "blog-index",
        name: "Blog Listing",
        routePath: "/blog",
    },
    {
        key: "gallery",
        name: "Gallery",
        routePath: "/gallery",
    },
    {
        key: "contact",
        name: "Contact",
        routePath: "/contact",
    },

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    {
        key: "login",
        name: "Customer Login",
        routePath: "/login",
    },
    {
        key: "registration",
        name: "Customer Registration",
        routePath: "/registration",
    },
    {
        key: "forgot-password",
        name: "Customer Forgot Password",
        routePath: "/forgot-password",
    },
    {
        key: "admin-login",
        name: "Admin Login",
        routePath: "/admin",
    },

    /*
    |--------------------------------------------------------------------------
    | Dashboards
    |--------------------------------------------------------------------------
    */

    {
        key: "customer-dashboard",
        name: "Customer Dashboard",
        routePath: "/account",
    },
    {
        key: "admin-dashboard",
        name: "Admin Dashboard",
        routePath: "/admin/dashboard",
    },

    /*
    |--------------------------------------------------------------------------
    | Booking / Payment
    |--------------------------------------------------------------------------
    */

    {
        key: "booking",
        name: "Booking Checkout",
        routePath: "/book/$slug",
    },
    {
        key: "payment",
        name: "Payment",
        routePath: "/booking/payment",
    },
    {
        key: "booking-success",
        name: "Booking Success",
        routePath: "/booking/success",
    },

    /*
    |--------------------------------------------------------------------------
    | Success / Thank-you states
    |--------------------------------------------------------------------------
    |
    | These are currently embedded inside existing routes rather than dedicated
    | public URLs. They still get CMS identities so their copy can later be
    | managed independently.
    |
    */

    {
        key: "thank-you-contact",
        name: "Contact Thank-you",
        routePath: null,
    },
    {
        key: "thank-you-newsletter",
        name: "Newsletter Thank-you",
        routePath: null,
    },
    {
        key: "thank-you-destination",
        name: "Destination Inquiry Thank-you",
        routePath: null,
    },
    {
        key: "thank-you-experience",
        name: "Experience Inquiry Thank-you",
        routePath: null,
    },
    {
        key: "thank-you-itinerary",
        name: "Itinerary Request Thank-you",
        routePath: null,
    },
];

export const cmsNavigationMenuDefinitions = [
    {
        key: "primary",
        name: "Primary Navigation",
        description: "Main website navigation displayed in the Navbar.",
    },
    {
        key: "footer_company",
        name: "Footer — Company",
        description: "Company links displayed in the Footer.",
    },
    {
        key: "footer_destinations",
        name: "Footer — Destinations",
        description: "Destination links displayed in the Footer.",
    },
    {
        key: "footer_journal",
        name: "Footer — Journal",
        description: "Journal and editorial links displayed in the Footer.",
    },
    {
        key: "footer_legal",
        name: "Footer — Legal",
        description: "Privacy, terms and other legal links.",
    },
] as const;

export const cmsPrimaryNavigationDefaults = [
    {
        label: "Home",
        path: "/",
        sortOrder: 10,
    },
    {
        label: "Destinations",
        path: "/destinations",
        sortOrder: 20,
    },
    {
        label: "Packages",
        path: "/packages",
        sortOrder: 30,
    },
    {
        label: "Experiences",
        path: "/experiences",
        sortOrder: 40,
    },
    {
        label: "About",
        path: "/about",
        sortOrder: 50,
    },
    {
        label: "Blog",
        path: "/blog",
        sortOrder: 60,
    },
    {
        label: "Gallery",
        path: "/gallery",
        sortOrder: 70,
    },
    {
        label: "Contact",
        path: "/contact",
        sortOrder: 80,
    },
] as const;