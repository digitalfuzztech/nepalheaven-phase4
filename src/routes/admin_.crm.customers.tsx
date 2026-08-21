import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Search, Users } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrmPagination } from "@/components/admin/CrmPagination";
import { getAdminSessionFn } from "@/lib/auth.functions";
import { countryName } from "@/lib/countries";
import { getCrmCustomersFn } from "@/lib/crm.functions";

const birthDate = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

function formatBirthDate(value: string | null) {
  if (!value) return "—";
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? "—" : birthDate.format(parsed);
}

type CustomerSearch = {
  page: number;
  q: string;
  country: string;
};

function cleanText(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function pageNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export const Route = createFileRoute("/admin_/crm/customers")({
  validateSearch: (search: Record<string, unknown>): CustomerSearch => ({
    page: pageNumber(search["page"]),
    q: cleanText(search["q"], 120),
    country: cleanText(search["country"], 120),
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    if (!(await getAdminSessionFn()))
      throw redirect({
        to: "/admin",
        search: { redirect: "/admin/crm/customers" },
      });
    return getCrmCustomersFn({ data: deps });
  },
  pendingComponent: CustomersPending,
  errorComponent: CustomersError,
  component: CustomersPage,
});

function CustomersPage() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [query, setQuery] = useState(search.q);

  useEffect(() => setQuery(search.q), [search.q]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void navigate({
      search: { ...search, q: query.trim(), page: 1 },
      resetScroll: false,
    });
  }

  function goToPage(page: number) {
    void navigate({ search: { ...search, page }, resetScroll: false });
  }

  return (
    <AdminShell>
      <main className="min-w-0 max-w-full p-5 sm:p-7 lg:p-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <Link
              to="/admin/crm"
              className="text-sm font-semibold text-muted-foreground transition hover:text-[#0c1724]"
            >
              ← Back to CRM
            </Link>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-gold">
              Customer CRM
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0c1724]">
              Registered customers
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Customer accounts created through Nepal Heaven registration.
              Administrative accounts are excluded.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-2xl border bg-white px-5 py-4 shadow-sm">
            <Users className="h-5 w-5 text-gold" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Matching customers
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#0c1724]">
                {data.total.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <section className="mt-8 min-w-0 rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-5">
          <form
            onSubmit={submit}
            className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(14rem,0.45fr)_auto]"
          >
            <label className="min-w-0">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Search name or email
              </span>
              <span className="relative block">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search customers"
                  className="w-full min-w-0 rounded-xl border bg-white py-3 pl-11 pr-4 outline-none transition focus:border-gold"
                />
              </span>
            </label>
            <label className="min-w-0">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Country
              </span>
              <select
                value={search.country}
                onChange={(event) =>
                  void navigate({
                    search: {
                      ...search,
                      country: event.target.value,
                      page: 1,
                    },
                    resetScroll: false,
                  })
                }
                className="w-full min-w-0 rounded-xl border bg-white px-4 py-3 outline-none transition focus:border-gold"
              >
                <option value="">All Countries</option>
                {data.countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="self-end rounded-xl bg-[#0c1724] px-6 py-3 font-semibold text-white transition hover:bg-[#16283b]"
            >
              Search
            </button>
          </form>
        </section>

        <section className="mt-6 min-w-0 max-w-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b bg-[#faf9f6] text-xs uppercase tracking-[0.1em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Customer ID</th>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Date of Birth</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Country</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.length ? (
                  data.rows.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b last:border-0 hover:bg-black/[0.015]"
                    >
                      <td className="px-5 py-4">
                        <span
                          title={customer.id}
                          className="font-mono text-xs font-semibold text-[#0c1724]"
                        >
                          {customer.customerId}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#0c1724]">
                        <span className="block">{customer.name}</span>
                        <span
                          className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                            customer.blockedAt
                              ? "bg-red-100 text-red-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {customer.blockedAt ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <a
                          href={`mailto:${customer.email}`}
                          className="break-all text-[#0c1724] hover:text-gold"
                        >
                          {customer.email}
                        </a>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {formatBirthDate(customer.dateOfBirth)}
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {customer.phone || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {customer.country ||
                          countryName(customer.nationality) ||
                          "—"}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          to="/admin/crm/customers/$id"
                          params={{ id: customer.id }}
                          className="inline-flex whitespace-nowrap rounded-full bg-[#0c1724] px-4 py-2 text-xs font-bold text-white transition hover:bg-gold hover:text-[#0c1724]"
                        >
                          View / Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-sm text-muted-foreground"
                    >
                      No registered customers match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <CrmPagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            label={data.total === 1 ? "customer" : "customers"}
            onPage={goToPage}
          />
        </section>
      </main>
    </AdminShell>
  );
}

function CustomersPending() {
  return (
    <AdminShell>
      <div className="p-8">
        <div className="h-10 w-72 animate-pulse rounded-xl bg-black/10" />
        <div className="mt-8 h-96 animate-pulse rounded-2xl bg-white" />
      </div>
    </AdminShell>
  );
}

function CustomersError() {
  return (
    <AdminShell>
      <div className="p-5 sm:p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-7">
          <h1 className="text-xl font-semibold text-red-900">
            Customers could not be loaded
          </h1>
          <p className="mt-2 text-sm text-red-800">
            Please refresh the page or try again shortly.
          </p>
        </div>
      </div>
    </AdminShell>
  );
}
