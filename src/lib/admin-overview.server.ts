import {
    count,
    eq,
} from "drizzle-orm";

import { db } from "@/db";

import {
    blogPosts,
    bookings,
    cmsFooterSettings,
    cmsGeneralSettings,
    cmsNavigationMenus,
    cmsPages,
    destinations,
    emailTemplates,
    experienceCategories,
    faqs,
    leads,
    media,
    packages,
    testimonials,
    users,
} from "@/db/schema";

import { requireAdmin } from "@/lib/auth.server";

function getCount(
    rows: Array<{
        value: number;
    }>,
) {
    return Number(rows[0]?.value ?? 0);
}

/*
|--------------------------------------------------------------------------
| CMS Overview
|--------------------------------------------------------------------------
*/

export async function getCmsOverview() {
    await requireAdmin();

    if (!db) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    const [
        destinationRows,
        packageRows,
        experienceRows,
        blogRows,
        testimonialRows,
        faqRows,
        mediaRows,
        emailTemplateRows,
        cmsPageRows,
        generalSettingsRows,
        footerSettingsRows,
        navigationMenuRows,
    ] = await Promise.all([
        db
            .select({
                value: count(),
            })
            .from(destinations),

        db
            .select({
                value: count(),
            })
            .from(packages),

        db
            .select({
                value: count(),
            })
            .from(experienceCategories),

        db
            .select({
                value: count(),
            })
            .from(blogPosts),

        db
            .select({
                value: count(),
            })
            .from(testimonials),

        db
            .select({
                value: count(),
            })
            .from(faqs),

        db
            .select({
                value: count(),
            })
            .from(media),

        db
            .select({
                value: count(),
            })
            .from(emailTemplates),

        db
            .select({
                value: count(),
            })
            .from(cmsPages),

        db
            .select({
                value: count(),
            })
            .from(cmsGeneralSettings),

        db
            .select({
                value: count(),
            })
            .from(cmsFooterSettings),

        db
            .select({
                value: count(),
            })
            .from(cmsNavigationMenus),
    ]);

    return {
        destinations: getCount(
            destinationRows,
        ),

        packages: getCount(
            packageRows,
        ),

        experiences: getCount(
            experienceRows,
        ),

        blogPosts: getCount(
            blogRows,
        ),

        testimonials: getCount(
            testimonialRows,
        ),

        faqs: getCount(
            faqRows,
        ),

        media: getCount(
            mediaRows,
        ),

        emailTemplates: getCount(
            emailTemplateRows,
        ),

        pages: getCount(
            cmsPageRows,
        ),

        generalSettings: getCount(
            generalSettingsRows,
        ),

        footerSettings: getCount(
            footerSettingsRows,
        ),

        navigationMenus: getCount(
            navigationMenuRows,
        ),
    };
}

/*
|--------------------------------------------------------------------------
| Main Admin Dashboard
|--------------------------------------------------------------------------
*/

export async function getAdminDashboardStats() {
    await requireAdmin();

    if (!db) {
        throw new Error(
            "Database connection is not configured.",
        );
    }

    const [
        bookingRows,
        customerRows,
        newLeadRows,

        publishedDestinationRows,
        publishedPackageRows,
        publishedExperienceRows,
        publishedBlogRows,
        publishedTestimonialRows,
        publishedFaqRows,
    ] = await Promise.all([
        /*
         * Real bookings only.
         *
         * booking_intents are intentionally NOT counted here.
         */
        db
            .select({
                value: count(),
            })
            .from(bookings),

        /*
         * Customers only — exclude the platform admin.
         */
        db
            .select({
                value: count(),
            })
            .from(users)
            .where(
                eq(
                    users.role,
                    "customer",
                ),
            ),

        db
            .select({
                value: count(),
            })
            .from(leads)
            .where(
                eq(
                    leads.status,
                    "new",
                ),
            ),

        db
            .select({
                value: count(),
            })
            .from(destinations)
            .where(
                eq(
                    destinations.status,
                    true,
                ),
            ),

        db
            .select({
                value: count(),
            })
            .from(packages)
            .where(
                eq(
                    packages.status,
                    true,
                ),
            ),

        db
            .select({
                value: count(),
            })
            .from(experienceCategories)
            .where(
                eq(
                    experienceCategories.status,
                    true,
                ),
            ),

        db
            .select({
                value: count(),
            })
            .from(blogPosts)
            .where(
                eq(
                    blogPosts.status,
                    "published",
                ),
            ),

        db
            .select({
                value: count(),
            })
            .from(testimonials)
            .where(
                eq(
                    testimonials.status,
                    "published",
                ),
            ),

        db
            .select({
                value: count(),
            })
            .from(faqs)
            .where(
                eq(
                    faqs.status,
                    "published",
                ),
            ),
    ]);

    const publishedContent =
        getCount(
            publishedDestinationRows,
        ) +
        getCount(
            publishedPackageRows,
        ) +
        getCount(
            publishedExperienceRows,
        ) +
        getCount(
            publishedBlogRows,
        ) +
        getCount(
            publishedTestimonialRows,
        ) +
        getCount(
            publishedFaqRows,
        );

    return {
        bookings: getCount(
            bookingRows,
        ),

        customers: getCount(
            customerRows,
        ),

        newLeads: getCount(
            newLeadRows,
        ),

        publishedContent,
    };
}