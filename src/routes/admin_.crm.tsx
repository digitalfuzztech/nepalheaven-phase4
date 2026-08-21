import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";

import { getAdminSessionFn } from "@/lib/auth.functions";
import { CalendarCheck, CreditCard, Inbox, Users } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin_/crm")({
  loader: async () => {
    const admin = await getAdminSessionFn();

    if (!admin) {
      throw redirect({
        to: "/admin",
        search: {
          redirect: "/admin/crm",
        },
      });
    }

    return admin;
  },

  component: AdminCrmPage,
});

function AdminCrmPage() {
  const location = useLocation();
  if (location.pathname.replace(/\/+$/, "") !== "/admin/crm") return <Outlet />;

  return (
    <AdminShell>
      <div className="p-5 lg:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
          Customer operations
        </p>

        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0c1724]">
          CRM
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          View registered customers and enquiries captured by the Nepal Heaven
          website, bookings, and immutable payment records.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <CrmCard
            title="Customers"
            description="Search registered customer accounts, filter by country, and review contact details."
            to="/admin/crm/customers"
            icon={Users}
          />
          <CrmCard
            title="Leads"
            description="Review newsletter, destination, experience, contact, and WhatsApp acquisition records."
            to="/admin/crm/leads"
            icon={Inbox}
          />
          <CrmCard title="Bookings" description="Review confirmed and cancelled reservations, financial snapshots, invoices, and current VAT rules." to="/admin/crm/bookings" icon={CalendarCheck} />
          <CrmCard title="Payments" description="Review every payment transaction without changing immutable gateway fields." to="/admin/crm/payments" icon={CreditCard} />
        </div>
      </div>
    </AdminShell>
  );
}

function CrmCard({
  title,
  description,
  to,
  icon: Icon,
}: {
  title: string;
  description: string;
  to: "/admin/crm/customers" | "/admin/crm/leads" | "/admin/crm/bookings" | "/admin/crm/payments";
  icon: typeof Users;
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-7 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0c1724] text-gold">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="mt-6 text-xl font-semibold text-[#0c1724]">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {to === "/admin/crm/customers" ? (
        <Link
          to="/admin/crm/customers"
          search={{ page: 1, q: "", country: "" }}
          className="mt-6 inline-flex rounded-full bg-[#0c1724] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16283b]"
        >
          Open {title}
        </Link>
      ) : to === "/admin/crm/leads" ? (
        <Link
          to="/admin/crm/leads"
          search={{
            type: "newsletter",
            newsletterStatus: "subscribed",
            visibility: "visible",
            page: 1,
          }}
          className="mt-6 inline-flex rounded-full bg-[#0c1724] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16283b]"
        >
          Open {title}
        </Link>
      ) : to === "/admin/crm/bookings" ? <Link to="/admin/crm/bookings" search={{tab:"confirmed",page:1,q:""}} className="mt-6 inline-flex rounded-full bg-[#0c1724] px-5 py-2.5 text-sm font-semibold text-white">Open {title}</Link> : <Link to="/admin/crm/payments" search={{page:1,q:"",status:"",purpose:"",provider:""}} className="mt-6 inline-flex rounded-full bg-[#0c1724] px-5 py-2.5 text-sm font-semibold text-white">Open {title}</Link>}
    </section>
  );
}
