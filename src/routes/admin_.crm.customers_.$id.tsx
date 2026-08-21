import { useEffect, useState, type ReactNode } from "react";
import {
  createFileRoute,
  Link,
  notFound,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { ArrowLeft, Download, ShieldAlert, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminSessionFn } from "@/lib/auth.functions";
import { countryName } from "@/lib/countries";
import {
  deleteCrmCustomerFn,
  getCrmCustomerFn,
  setCrmCustomerBlockedFn,
} from "@/lib/crm.functions";
import { downloadBookingInvoiceFn } from "@/lib/finance-crm.functions";
import {
  downloadIdentityDocumentFn,
  downloadMyVerifiedBookingIdentityDocumentFn,
} from "@/lib/identity-documents.functions";

export const Route = createFileRoute("/admin_/crm/customers_/$id")({
  loader: async ({ params }) => {
    if (!(await getAdminSessionFn()))
      throw redirect({
        to: "/admin",
        search: { redirect: `/admin/crm/customers/${params.id}` },
      });
    const result = await getCrmCustomerFn({ data: { id: params.id } });
    if (!result.ok) throw notFound();
    return result;
  },
  component: CustomerDetailPage,
});

const adminDate = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kathmandu",
});
const dateOnly = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

function formatDate(value: string | null, withTime = false) {
  if (!value) return "—";
  const parsed = new Date(withTime ? value : `${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return "—";
  return withTime ? adminDate.format(parsed) : dateOnly.format(parsed);
}

function CustomerDetailPage() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const customer = data.customer;
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<"block" | "delete" | null>(null);

  async function toggleBlocked() {
    setBusy(true);
    setError(null);
    try {
      const result = await setCrmCustomerBlockedFn({
        data: { id: customer.id, blocked: !customer.blockedAt },
      });
      if (!result.ok) setError(result.message);
      else {
        setDialog(null);
        setNotice(
          customer.blockedAt ? "Customer unblocked." : "Customer blocked.",
        );
        await router.invalidate();
      }
    } catch {
      setError("Account status could not be changed.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteCustomer() {
    setBusy(true);
    setError(null);
    try {
      const result = await deleteCrmCustomerFn({ data: { id: customer.id } });
      if (!result.ok) {
        setError(result.message);
        setDialog(null);
      } else {
        window.location.assign("/admin/crm/customers");
      }
    } catch {
      setError("Customer account could not be deleted safely.");
      setDialog(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminShell>
      <main className="min-w-0 max-w-full p-5 sm:p-7 lg:p-8">
        <Link
          to="/admin/crm/customers"
          search={{ page: 1, q: "", country: "" }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-[#0c1724]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Customers
        </Link>
        <header className="mt-5 flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-center gap-5">
            <ProfilePhoto name={customer.name} src={customer.avatarUrl} />
            <div className="min-w-0">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-gold">
              {customer.customerId}
            </p>
            <h1 className="mt-2 break-words font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0c1724]">
              {customer.name}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone={customer.blockedAt ? "danger" : "success"}>
                {customer.blockedAt ? "Blocked" : "Active"}
              </Badge>
              <Badge tone={customer.emailVerifiedAt ? "success" : "neutral"}>
                {customer.emailVerifiedAt
                  ? "Email verified"
                  : "Email unverified"}
              </Badge>
            </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDialog("block")}
              className="rounded-full border border-[#0c1724] px-5 py-2.5 text-sm font-bold text-[#0c1724] hover:bg-[#0c1724] hover:text-white"
            >
              {customer.blockedAt ? "Unblock Customer" : "Block Customer"}
            </button>
            <button
              type="button"
              onClick={() => setDialog("delete")}
              className="inline-flex items-center gap-2 rounded-full border border-red-300 px-5 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" /> Delete Customer
            </button>
          </div>
        </header>

        {notice ? <Notice tone="success">{notice}</Notice> : null}
        {error ? <Notice tone="danger">{error}</Notice> : null}

        <section className="mt-7 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
          <Card
            title="Overview"
            description="Registered customer information is read-only in CRM."
          >
            <div className="grid min-w-0 gap-x-8 sm:grid-cols-2">
              <Definition label="Name" value={customer.name} />
              <Definition label="Email" value={customer.email} />
              <Definition label="Phone" value={customer.phone || "—"} />
              <Definition label="Country" value={customer.country || countryName(customer.nationality) || "—"} />
              <Definition label="Date of Birth" value={formatDate(customer.dateOfBirth)} />
              <Definition label="Registration Date" value={formatDate(customer.createdAt, true)} />
            </div>
          </Card>
          <Card title="Account" description="Registration and security state.">
            <Definition label="Customer ID" value={customer.customerId} />
            <Definition
              label="Country"
              value={
                customer.country || countryName(customer.nationality) || "—"
              }
            />
            <Definition
              label="Date of Birth"
              value={formatDate(customer.dateOfBirth)}
            />
            <Definition
              label="Registered"
              value={formatDate(customer.createdAt, true)}
            />
            <Definition
              label="Email Verified"
              value={formatDate(customer.emailVerifiedAt, true)}
            />
            <Definition
              label="Last Updated"
              value={formatDate(customer.updatedAt, true)}
            />
            <Definition
              label="Account Status"
              value={
                customer.blockedAt
                  ? `Blocked ${formatDate(customer.blockedAt, true)}`
                  : "Active"
              }
            />
          </Card>
        </section>

        <BookingSection
          title="Confirmed Bookings"
          rows={data.confirmedBookings}
          empty="No confirmed bookings for this customer."
        />
        <BookingSection
          title="Cancelled Bookings"
          rows={data.cancelledBookings}
          empty="No cancelled bookings for this customer."
          cancelled
        />

        <section className="mt-6 grid min-w-0 gap-6 xl:grid-cols-2">
          <Card
            title="Saved Trips"
            description="Saved journeys and favourites."
          >
            <EmptyState>
              No saved trips recorded for this customer. Saved trips currently
              exist only in the customer's browser and are not persisted.
            </EmptyState>
          </Card>
          <Card
            title="Passports"
            description="Structured passport profile records."
          >
            <EmptyState>
              No structured passport records exist. Uploaded passport files
              appear in Documents below.
            </EmptyState>
          </Card>
        </section>

        <section className="mt-6">
          <Card
            title="Documents"
            description="Private customer and booking identity documents. Downloads remain admin-authorized."
          >
            {data.documents.length ? (
              <div className="max-w-full overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="py-3 pr-4">Type</th>
                      <th className="px-4 py-3">Filename</th>
                      <th className="px-4 py-3">Booking</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Uploaded</th>
                      <th className="pl-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.documents.map((document) => (
                      <tr
                        key={`${document.scope}-${document.id}`}
                        className="border-b last:border-0"
                      >
                        <td className="py-4 pr-4 font-semibold capitalize">
                          {document.documentType.replace("_", " ")}
                        </td>
                        <td className="px-4 py-4 break-all">
                          {document.originalFilename}
                        </td>
                        <td className="px-4 py-4">
                          {document.bookingReference || "—"}
                        </td>
                        <td className="px-4 py-4 capitalize">
                          {document.verificationStatus}
                        </td>
                        <td className="px-4 py-4">
                          {formatDate(document.createdAt, true)}
                        </td>
                        <td className="pl-4 py-4">
                          <button
                            type="button"
                            onClick={() => void downloadDocument(document)}
                            className="inline-flex items-center gap-2 font-bold text-[#0c1724] hover:text-gold"
                          >
                            <Download className="h-4 w-4" /> Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState>
                No customer or booking documents have been uploaded.
              </EmptyState>
            )}
          </Card>
        </section>
        <section className="mt-6 grid min-w-0 gap-6 xl:grid-cols-2">
          <FinancialDocuments title="Booking Invoices" rows={data.bookingInvoices} />
          <FinancialDocuments title="Refund Invoices" rows={data.refundInvoices} />
        </section>
      </main>

      {dialog === "block" ? (
        <ConfirmDialog
          title={customer.blockedAt ? "Unblock customer?" : "Block customer?"}
          description={
            customer.blockedAt
              ? `${customer.name} will be able to sign in again according to normal verification rules.`
              : `${customer.name} will no longer be able to sign in. Bookings, payments, leads, and historical records remain unchanged.`
          }
          confirmLabel={
            customer.blockedAt ? "Unblock Customer" : "Block Customer"
          }
          busy={busy}
          danger={!customer.blockedAt}
          onCancel={() => setDialog(null)}
          onConfirm={() => void toggleBlocked()}
        />
      ) : null}
      {dialog === "delete" ? (
        <ConfirmDialog
          title="Delete customer account?"
          description="This may delete the authentication/profile account and safe customer-only data. It will not delete bookings, payments, invoices, lead history, packages, destinations, experiences, or Media Library content. If retained records reference this customer, deletion will be refused and blocking will be recommended."
          confirmLabel="Delete Customer"
          busy={busy}
          danger
          onCancel={() => setDialog(null)}
          onConfirm={() => void deleteCustomer()}
        />
      ) : null}
    </AdminShell>
  );
}

type FinancialDocument = ReturnType<typeof Route.useLoaderData>["bookingInvoices"][number] | ReturnType<typeof Route.useLoaderData>["refundInvoices"][number];

function ProfilePhoto({name,src}:{name:string;src:string|null}) {
  const [failed,setFailed]=useState(false);
  if (!src || failed) return <div className="grid h-24 w-24 shrink-0 place-items-center rounded-3xl bg-[#0c1724] text-3xl font-bold text-white shadow-md" aria-label="No customer photo">{name.split(/\s+/).slice(0,2).map(part=>part.charAt(0).toUpperCase()).join("")||"?"}</div>;
  return <img src={src} alt={`${name} profile`} onError={()=>setFailed(true)} className="h-24 w-24 shrink-0 rounded-3xl border-4 border-white object-cover shadow-md"/>;
}

function FinancialDocuments({ title, rows }: { title: string; rows: FinancialDocument[] }) {
  return (
    <Card title={title} description="Immutable financial documents linked to this customer.">
      {rows.length ? <div className="space-y-3">{rows.map((row) => (
        <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-black/[0.015] p-4">
          <div><p className="font-mono text-xs font-bold text-gold">{row.documentNumber}</p><p className="mt-1 font-semibold">{row.bookingReference}</p><p className="text-xs text-muted-foreground">{formatDate(row.issuedAt, true)} · {row.currency} {row.amount.toFixed(2)}</p></div>
          <button type="button" onClick={() => void downloadInvoice(row.bookingReference)} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold hover:border-gold"><Download className="h-4 w-4" /> View / Download</button>
        </div>
      ))}</div> : <EmptyState>No {title.toLowerCase()} recorded for this customer.</EmptyState>}
    </Card>
  );
}

async function downloadInvoice(reference: string) {
  const result = await downloadBookingInvoiceFn({ data: { reference } });
  if (!result.ok) return;
  const bytes = Uint8Array.from(atob(result.document.base64), (value) => value.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: result.document.mimeType }));
  const anchor = window.document.createElement("a"); anchor.href = url; anchor.download = result.document.filename; anchor.click(); URL.revokeObjectURL(url);
}

type CustomerDocument = ReturnType<
  typeof Route.useLoaderData
>["documents"][number];

async function downloadDocument(document: CustomerDocument) {
  const result =
    document.scope === "customer"
      ? await downloadIdentityDocumentFn({ data: { documentId: document.id } })
      : await downloadMyVerifiedBookingIdentityDocumentFn({
          data: { documentId: document.id },
        });
  if (!result.ok) return;
  const bytes = Uint8Array.from(atob(result.document.base64), (value) =>
    value.charCodeAt(0),
  );
  const url = URL.createObjectURL(
    new Blob([bytes], { type: result.document.mimeType }),
  );
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = result.document.filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

type CustomerBooking = {
  id: string;
  reference: string;
  packageTitle: string;
  departureDate: string | null;
  travellers: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  total: number;
  currency: string;
  cancellationFee: string | null;
  refundAmount: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  amountPaid: number;
  paymentStatus: string;
};

function BookingSection({
  title,
  rows,
  empty,
  cancelled = false,
}: {
  title: string;
  rows: CustomerBooking[];
  empty: string;
  cancelled?: boolean;
}) {
  return (
    <section className="mt-6">
      <Card
        title={title}
        description="Read-only booking history. Booking management remains in the booking record."
      >
        {rows.length ? (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-3 pr-4">Reference</th>
                  <th className="px-4 py-3">Trip</th>
                  <th className="px-4 py-3">Travel Date</th>
                  <th className="px-4 py-3">Travellers</th>
                  <th className="px-4 py-3">Booking Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment</th>
                  {cancelled ? (
                    <th className="px-4 py-3">Cancellation</th>
                  ) : null}
                  <th className="pl-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((booking) => (
                  <tr key={booking.id} className="border-b last:border-0">
                    <td className="py-4 pr-4 font-mono text-xs font-bold">
                      {booking.reference}
                    </td>
                    <td className="px-4 py-4 font-semibold">
                      {booking.packageTitle}
                    </td>
                    <td className="px-4 py-4">
                      {formatDate(booking.departureDate)}
                    </td>
                    <td className="px-4 py-4">{booking.travellers}</td>
                    <td className="px-4 py-4">
                      {formatDate(booking.createdAt, true)}
                    </td>
                    <td className="px-4 py-4">
                      {booking.currency} {booking.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 capitalize">
                      {String(booking.paymentStatus).replaceAll("_", " ")}
                    </td>
                    {cancelled ? (
                      <td className="max-w-xs px-4 py-4">
                        <span className="block">
                          {formatDate(booking.cancelledAt, true)}
                        </span>
                        <span className="mt-1 line-clamp-2 text-muted-foreground">
                          {booking.cancellationReason || "—"}
                        </span>
                      </td>
                    ) : null}
                    <td className="pl-4 py-4">
                      <Link
                        to="/admin/crm/bookings/$reference"
                        params={{ reference: booking.reference }}
                        className="whitespace-nowrap font-bold text-[#0c1724] hover:text-gold"
                      >
                        View Booking
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>{empty}</EmptyState>
        )}
      </Card>
    </section>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-semibold text-[#0c1724]">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      <div className="mt-5 min-w-0">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="min-w-0">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Definition({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 justify-between gap-4 border-b py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="break-words text-right text-sm font-semibold text-[#0c1724]">
        {value}
      </span>
    </div>
  );
}

function Badge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "success" | "danger" | "neutral";
}) {
  const colors =
    tone === "success"
      ? "bg-emerald-100 text-emerald-800"
      : tone === "danger"
        ? "bg-red-100 text-red-800"
        : "bg-black/5 text-muted-foreground";
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${colors}`}>
      {children}
    </span>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed bg-[#faf9f6] px-5 py-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function Notice({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "success" | "danger";
}) {
  return (
    <div
      className={`mt-5 rounded-xl border px-4 py-3 text-sm font-medium ${tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}
    >
      {children}
    </div>
  );
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  busy,
  danger,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  busy: boolean;
  danger: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [busy, onCancel]);
  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div
          className={`grid h-11 w-11 place-items-center rounded-full ${danger ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
        >
          <ShieldAlert className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-[#0c1724]">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-full border px-5 py-2.5 text-sm font-bold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`rounded-full px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 ${danger ? "bg-red-700" : "bg-[#0c1724]"}`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
