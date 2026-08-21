import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import {
  getAdminCancelledBookingFn,
  getAdminConfirmedBookingFn,
} from "@/lib/booking.functions";

/**
 * Stable read-only entry point for an admin booking record. Detailed booking
 * management remains Phase 5; this bridge only resolves the existing
 * status-specific read-only pages so visible record links cannot hit a 404.
 */
export const Route = createFileRoute("/admin_/crm/bookings/$reference")({
  loader: async ({ params }) => {
    const reference = params.reference.trim().toUpperCase();
    if (!/^NH-\d{4}-[A-F0-9]{16}$/.test(reference)) throw notFound();

    const confirmed = await getAdminConfirmedBookingFn({ data: { reference } });
    if (confirmed.ok)
      throw redirect({
        to: "/admin/crm/bookings/confirmed/$reference",
        params: { reference },
      });
    if (
      confirmed.code === "AUTH_REQUIRED" ||
      confirmed.code === "CUSTOMER_REQUIRED"
    )
      throw redirect({
        to: "/admin",
        search: {
          redirect: `/admin/crm/bookings/${encodeURIComponent(reference)}`,
        },
      });

    const cancelled = await getAdminCancelledBookingFn({ data: { reference } });
    if (cancelled.ok)
      throw redirect({
        to: "/admin/crm/bookings/cancelled/$reference",
        params: { reference },
      });
    if (
      cancelled.code === "AUTH_REQUIRED" ||
      cancelled.code === "CUSTOMER_REQUIRED"
    )
      throw redirect({
        to: "/admin",
        search: {
          redirect: `/admin/crm/bookings/${encodeURIComponent(reference)}`,
        },
      });
    throw notFound();
  },
  component: () => null,
});
