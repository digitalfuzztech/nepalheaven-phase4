import { useEffect, useState, type ReactNode } from "react";
import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { Eye, EyeOff, Inbox, Trash2, X } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrmPagination } from "@/components/admin/CrmPagination";
import { getAdminSessionFn } from "@/lib/auth.functions";
import {
  deleteCrmLeadFn,
  getCrmLeadsFn,
  setCrmLeadHiddenFn,
} from "@/lib/crm.functions";
import {
  crmLeadTypeSchema,
  crmNewsletterStatusSchema,
  crmLeadVisibilitySchema,
  type CrmLeadType,
  type CrmLeadVisibility,
  type CrmNewsletterStatus,
} from "@/lib/crm.schema";
import { cn } from "@/lib/utils";

type LeadsSearch = {
  type: CrmLeadType;
  newsletterStatus: CrmNewsletterStatus;
  page: number;
  visibility: CrmLeadVisibility;
};

type NewsletterData = {
  kind: "newsletter";
  newsletterStatus: CrmNewsletterStatus;
  rows: Array<{
    id: string;
    email: string;
    subscriptionDate: string;
    originalSubscriptionDate: string;
    unsubscribedAt: string | null;
  }>;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type LeadRow = {
  id: string;
  leadType: string;
  name: string;
  email: string | null;
  phone: string | null;
  travelDate: string | null;
  travellers: number | null;
  interestedIn: string | null;
  message: string | null;
  source: string | null;
  destinationName: string | null;
  experienceName: string | null;
  packageName: string | null;
  metadata: Record<string, string | number | boolean | null>;
  subject: string | null;
  toAddress: string | null;
  acquisitionSource: string | null;
  contextType: string | null;
  contextSlug: string | null;
  hiddenAt: string | null;
  createdAt: string;
};

type LeadData = {
  kind: Exclude<CrmLeadType, "newsletter">;
  rows: LeadRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const tabs: Array<{ value: CrmLeadType; label: string }> = [
  { value: "newsletter", label: "Newsletter" },
  { value: "destination", label: "Destination" },
  { value: "experience", label: "Experience" },
  { value: "contact", label: "Contact" },
  { value: "whatsapp", label: "WhatsApp" },
];

function pageNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export const Route = createFileRoute("/admin_/crm/leads")({
  validateSearch: (search: Record<string, unknown>): LeadsSearch => ({
    type: crmLeadTypeSchema.catch("newsletter").parse(search["type"]),
    newsletterStatus: crmNewsletterStatusSchema
      .catch("subscribed")
      .parse(search["newsletterStatus"]),
    page: pageNumber(search["page"]),
    visibility: crmLeadVisibilitySchema
      .catch("visible")
      .parse(search["visibility"]),
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    if (!(await getAdminSessionFn()))
      throw redirect({
        to: "/admin",
        search: { redirect: "/admin/crm/leads" },
      });
    return getCrmLeadsFn({ data: deps });
  },
  pendingComponent: LeadsPending,
  errorComponent: LeadsError,
  component: LeadsPage,
});

const adminDate = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kathmandu",
});
const travelDate = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

function formatTimestamp(value: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : adminDate.format(parsed);
}

function formatTravelDate(value: string | null) {
  if (!value) return "—";
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? "—" : travelDate.format(parsed);
}

function LeadsPage() {
  const data = Route.useLoaderData() as NewsletterData | LeadData;
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  function selectTab(type: CrmLeadType) {
    void navigate({
      search: { ...search, type, page: 1 },
      resetScroll: false,
    });
  }

  function selectNewsletterStatus(newsletterStatus: CrmNewsletterStatus) {
    void navigate({
      search: { ...search, newsletterStatus, page: 1 },
      resetScroll: false,
    });
  }

  function goToPage(page: number) {
    void navigate({ search: { ...search, page }, resetScroll: false });
  }

  function selectVisibility(visibility: CrmLeadVisibility) {
    void navigate({
      search: { ...search, visibility, page: 1 },
      resetScroll: false,
    });
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
              Leads CRM
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0c1724]">
              Acquired leads
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Read-only visibility into enquiries and subscriptions captured by
              the existing Nepal Heaven website forms.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-2xl border bg-white px-5 py-4 shadow-sm">
            <Inbox className="h-5 w-5 text-gold" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Matching records
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#0c1724]">
                {data.total.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <nav
          aria-label="Lead categories"
          className="mt-8 flex max-w-full gap-2 overflow-x-auto rounded-2xl border border-black/10 bg-white p-2 shadow-sm"
        >
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-current={search.type === tab.value ? "page" : undefined}
              onClick={() => selectTab(tab.value)}
              className={cn(
                "shrink-0 rounded-xl px-5 py-3 text-sm font-semibold transition",
                search.type === tab.value
                  ? "bg-[#0c1724] text-white"
                  : "text-muted-foreground hover:bg-black/5 hover:text-[#0c1724]",
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {data.kind === "newsletter" ? (
          <NewsletterTable
            data={data}
            status={search.newsletterStatus}
            onStatus={selectNewsletterStatus}
          />
        ) : (
          <LeadTable
            data={data}
            visibility={search.visibility}
            onVisibility={selectVisibility}
          />
        )}

        <div className="mt-0 overflow-hidden rounded-b-2xl border-x border-b border-black/10 bg-white shadow-sm">
          <CrmPagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            label={data.total === 1 ? "record" : "records"}
            onPage={goToPage}
          />
        </div>
      </main>
    </AdminShell>
  );
}

function NewsletterTable({
  data,
  status,
  onStatus,
}: {
  data: NewsletterData;
  status: CrmNewsletterStatus;
  onStatus: (status: CrmNewsletterStatus) => void;
}) {
  return (
    <section className="mt-6 min-w-0 max-w-full overflow-hidden rounded-t-2xl border border-black/10 bg-white shadow-sm">
      <div className="flex flex-wrap gap-2 border-b bg-[#faf9f6] p-3">
        {(["subscribed", "unsubscribed"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onStatus(value)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold capitalize transition",
              status === value
                ? "bg-gold text-[#0c1724]"
                : "bg-white text-muted-foreground hover:text-[#0c1724]",
            )}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead className="border-b bg-[#faf9f6] text-xs uppercase tracking-[0.1em] text-muted-foreground">
            <tr>
              <th className="px-5 py-4">SN</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">
                {status === "subscribed"
                  ? "Subscription Date"
                  : "Original Subscription Date"}
              </th>
              {status === "unsubscribed" ? (
                <th className="px-5 py-4">Unsubscribed Date</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {data.rows.length ? (
              data.rows.map((row, index) => (
                <tr
                  key={row.id}
                  className="border-b last:border-0 hover:bg-black/[0.015]"
                >
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {(data.page - 1) * data.pageSize + index + 1}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-[#0c1724]">
                    <a href={`mailto:${row.email}`} className="hover:text-gold">
                      {row.email}
                    </a>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {formatTimestamp(
                      status === "subscribed"
                        ? row.subscriptionDate
                        : row.originalSubscriptionDate,
                    )}
                  </td>
                  {status === "unsubscribed" ? (
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {formatTimestamp(row.unsubscribedAt)}
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={status === "unsubscribed" ? 4 : 3}
                  className="px-6 py-16 text-center text-sm text-muted-foreground"
                >
                  No {status} newsletter records were found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LeadTable({
  data,
  visibility,
  onVisibility,
}: {
  data: LeadData;
  visibility: CrmLeadVisibility;
  onVisibility: (visibility: CrmLeadVisibility) => void;
}) {
  const [selected, setSelected] = useState<LeadRow | null>(null);
  const colSpan =
    data.kind === "destination" || data.kind === "experience"
      ? 10
      : data.kind === "contact"
        ? 11
        : 6;
  return (
    <>
      <section className="mt-6 min-w-0 max-w-full overflow-hidden rounded-t-2xl border border-black/10 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-[#faf9f6] p-3">
          <p className="px-2 text-sm font-semibold text-muted-foreground">
            {visibility === "visible" ? "Visible leads" : "Hidden leads"}
          </p>
          <div className="flex gap-2">
            {(["visible", "hidden"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onVisibility(value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold capitalize",
                  visibility === value
                    ? "bg-[#0c1724] text-white"
                    : "bg-white text-muted-foreground",
                )}
              >
                {value === "visible" ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                {value}
              </button>
            ))}
          </div>
        </div>
        <div className="max-w-full overflow-x-auto">
          <table
            className={cn(
              "w-full text-left",
              data.kind === "whatsapp" ? "min-w-[880px]" : "min-w-[1400px]",
            )}
          >
            <LeadTableHead type={data.kind} />
            <tbody>
              {data.rows.length ? (
                data.rows.map((row, index) => (
                  <LeadTableRow
                    key={row.id}
                    row={row}
                    type={data.kind}
                    serial={(data.page - 1) * data.pageSize + index + 1}
                    onOpen={() => setSelected(row)}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={colSpan}
                    className="px-6 py-16 text-center text-sm text-muted-foreground"
                  >
                    No {visibility} {data.kind} leads were found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      {selected ? (
        <LeadDetailModal
          row={selected}
          kind={data.kind}
          pageAfterRemoval={
            data.rows.length === 1 && data.page > 1 ? data.page - 1 : data.page
          }
          onClose={() => setSelected(null)}
        />
      ) : null}
    </>
  );
}

function ActionCell({ onOpen }: { onOpen: () => void }) {
  return (
    <td className="px-5 py-4 align-top">
      <button
        type="button"
        onClick={onOpen}
        className="whitespace-nowrap rounded-full bg-[#0c1724] px-4 py-2 text-xs font-bold text-white hover:bg-gold hover:text-[#0c1724]"
      >
        View / Edit
      </button>
    </td>
  );
}

function LeadDetailModal({
  row,
  kind,
  pageAfterRemoval,
  onClose,
}: {
  row: LeadRow;
  kind: LeadData["kind"];
  pageAfterRemoval: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy && !confirmDelete) onClose();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [busy, confirmDelete, onClose]);

  async function toggleHidden() {
    setBusy(true);
    setError(null);
    try {
      const result = await setCrmLeadHiddenFn({
        data: { id: row.id, kind, hidden: !row.hiddenAt },
      });
      if (!result.ok) setError(result.message);
      else {
        onClose();
        if (pageAfterRemoval !== search.page)
          await navigate({
            search: { ...search, page: pageAfterRemoval },
            resetScroll: false,
          });
        else await router.invalidate();
      }
    } catch {
      setError("Lead visibility could not be changed.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteLead() {
    setBusy(true);
    setError(null);
    try {
      const result = await deleteCrmLeadFn({ data: { id: row.id, kind } });
      if (!result.ok) {
        setError(result.message);
        setConfirmDelete(false);
      } else {
        onClose();
        if (pageAfterRemoval !== search.page)
          await navigate({
            search: { ...search, page: pageAfterRemoval },
            resetScroll: false,
          });
        else await router.invalidate();
      }
    } catch {
      setError("Lead could not be deleted safely.");
      setConfirmDelete(false);
    } finally {
      setBusy(false);
    }
  }

  const details: Array<[string, ReactNode]> = [
    ["Lead Type", row.leadType],
    [
      kind === "whatsapp" ? "Person Name" : "Name",
      kind === "whatsapp" && row.name === "WhatsApp contact"
        ? "—"
        : row.name || "—",
    ],
    ["Email", row.email || "—"],
    [kind === "whatsapp" ? "WhatsApp Number" : "Phone", row.phone || "—"],
    ["Travel Date", formatTravelDate(row.travelDate)],
    ["Travellers", row.travellers ?? "—"],
    ["Interested In", row.interestedIn || "—"],
    ["Destination", row.destinationName || "—"],
    ["Experience", row.experienceName || "—"],
    ["Package", row.packageName || "—"],
    [
      "Message",
      row.message ? (
        <span className="whitespace-pre-wrap break-words">{row.message}</span>
      ) : (
        "—"
      ),
    ],
    ["Source", row.acquisitionSource || row.source || "—"],
    [
      "Context",
      [row.contextType, row.contextSlug].filter(Boolean).join(" · ") || "—",
    ],
    ["Subject", row.subject || "—"],
    ["Lead Acquired Date", formatTimestamp(row.createdAt)],
    [
      "CRM Visibility",
      row.hiddenAt ? `Hidden ${formatTimestamp(row.hiddenAt)}` : "Visible",
    ],
  ];
  const metadata = Object.entries(row.metadata).filter(([, value]) =>
    ["string", "number", "boolean"].includes(typeof value),
  );

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy && !confirmDelete)
          onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Lead details"
        className="flex max-h-[90vh] w-full max-w-3xl min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-gold">
              {row.leadType}
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[#0c1724]">
              Lead details
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            disabled={busy}
            onClick={onClose}
            className="rounded-full p-2 hover:bg-black/5 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="min-w-0 overflow-y-auto p-5 sm:p-6">
          {error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          ) : null}
          <dl className="grid min-w-0 gap-x-6 sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div
                key={label}
                className={cn(
                  "min-w-0 border-b py-3",
                  label === "Message" && "sm:col-span-2",
                )}
              >
                <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-1 min-w-0 break-words text-sm font-medium text-[#0c1724]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          {metadata.length ? (
            <div className="mt-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Captured metadata
              </h3>
              <dl className="mt-2 grid gap-x-6 sm:grid-cols-2">
                {metadata.map(([key, value]) => (
                  <div key={key} className="min-w-0 border-b py-3">
                    <dt className="break-words text-xs text-muted-foreground">
                      {humanize(key)}
                    </dt>
                    <dd className="mt-1 break-words text-sm font-medium">
                      {String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>
        <footer className="flex flex-wrap justify-between gap-3 border-t bg-[#faf9f6] px-5 py-4 sm:px-6">
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-2 rounded-full border border-red-300 px-5 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" /> Delete Lead
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              className="rounded-full border px-5 py-2.5 text-sm font-bold disabled:opacity-50"
            >
              Close
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void toggleHidden()}
              className="inline-flex items-center gap-2 rounded-full bg-[#0c1724] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {row.hiddenAt ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              {busy ? "Working…" : row.hiddenAt ? "Unhide Lead" : "Hide Lead"}
            </button>
          </div>
        </footer>
      </div>
      {confirmDelete ? (
        <div
          className="fixed inset-0 z-[110] grid place-items-center bg-black/65 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy)
              setConfirmDelete(false);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 className="text-2xl font-semibold text-[#0c1724]">
              Delete lead permanently?
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This permanently removes this captured lead/acquisition from CRM
              history. Other enquiries from the same person remain.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmDelete(false)}
                className="rounded-full border px-5 py-2.5 text-sm font-bold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void deleteLead()}
                className="rounded-full bg-red-700 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                {busy ? "Deleting…" : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LeadTableHead({ type }: { type: LeadData["kind"] }) {
  return (
    <thead className="border-b bg-[#faf9f6] text-xs uppercase tracking-[0.1em] text-muted-foreground">
      <tr>
        <th className="px-5 py-4">SN</th>
        <th className="px-5 py-4">Lead Type</th>
        {type === "whatsapp" ? (
          <>
            <th className="px-5 py-4">WhatsApp Number</th>
            <th className="px-5 py-4">Person Name</th>
            <th className="px-5 py-4">Lead Acquired Date</th>
          </>
        ) : (
          <>
            <th className="px-5 py-4">Name</th>
            <th className="px-5 py-4">Email</th>
            <th className="px-5 py-4">Phone</th>
            <th className="px-5 py-4">Travel Date</th>
            {type === "destination" ? (
              <>
                <th className="px-5 py-4">Message</th>
                <th className="px-5 py-4">Destination</th>
              </>
            ) : type === "experience" ? (
              <>
                <th className="px-5 py-4">Experience</th>
                <th className="px-5 py-4">Message</th>
              </>
            ) : (
              <>
                <th className="px-5 py-4">Interested In</th>
                <th className="px-5 py-4">No. of Travellers</th>
                <th className="px-5 py-4">Message</th>
              </>
            )}
            <th className="px-5 py-4">Lead Acquired Date</th>
          </>
        )}
        <th className="px-5 py-4">Actions</th>
      </tr>
    </thead>
  );
}

function LeadTableRow({
  row,
  type,
  serial,
  onOpen,
}: {
  row: LeadRow;
  type: LeadData["kind"];
  serial: number;
  onOpen: () => void;
}) {
  if (type === "whatsapp")
    return (
      <tr className="border-b last:border-0 hover:bg-black/[0.015]">
        <Cell muted>{serial}</Cell>
        <Cell>{row.leadType}</Cell>
        <Cell>{row.phone || "—"}</Cell>
        <Cell>{row.name === "WhatsApp contact" ? "—" : row.name || "—"}</Cell>
        <Cell muted>{formatTimestamp(row.createdAt)}</Cell>
        <ActionCell onOpen={onOpen} />
      </tr>
    );

  return (
    <tr className="border-b last:border-0 hover:bg-black/[0.015]">
      <Cell muted>{serial}</Cell>
      <Cell>{row.leadType}</Cell>
      <Cell>{row.name || "—"}</Cell>
      <Cell>
        {row.email ? (
          <a href={`mailto:${row.email}`} className="break-all hover:text-gold">
            {row.email}
          </a>
        ) : (
          "—"
        )}
      </Cell>
      <Cell muted>{row.phone || "—"}</Cell>
      <Cell muted>{formatTravelDate(row.travelDate)}</Cell>
      {type === "destination" ? (
        <>
          <MessageCell value={row.message} />
          <Cell>{row.destinationName || "—"}</Cell>
        </>
      ) : type === "experience" ? (
        <>
          <Cell>{row.experienceName || "—"}</Cell>
          <MessageCell value={row.message} />
        </>
      ) : (
        <>
          <Cell>{row.interestedIn || row.packageName || "—"}</Cell>
          <Cell muted>{row.travellers ?? "—"}</Cell>
          <MessageCell value={row.message} />
        </>
      )}
      <Cell muted>{formatTimestamp(row.createdAt)}</Cell>
      <ActionCell onOpen={onOpen} />
    </tr>
  );
}

function Cell({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <td
      className={cn(
        "px-5 py-4 align-top text-sm",
        muted ? "text-muted-foreground" : "font-medium text-[#0c1724]",
      )}
    >
      {children}
    </td>
  );
}

function MessageCell({ value }: { value: string | null }) {
  return (
    <td className="max-w-sm px-5 py-4 align-top text-sm text-muted-foreground">
      <span
        className="line-clamp-3 whitespace-pre-wrap break-words"
        title={value ?? undefined}
      >
        {value || "—"}
      </span>
    </td>
  );
}

function humanize(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (character) => character.toUpperCase());
}

function LeadsPending() {
  return (
    <AdminShell>
      <div className="p-8">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-black/10" />
        <div className="mt-8 h-96 animate-pulse rounded-2xl bg-white" />
      </div>
    </AdminShell>
  );
}

function LeadsError() {
  return (
    <AdminShell>
      <div className="p-5 sm:p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-7">
          <h1 className="text-xl font-semibold text-red-900">
            Leads could not be loaded
          </h1>
          <p className="mt-2 text-sm text-red-800">
            Please refresh the page or try again shortly.
          </p>
        </div>
      </div>
    </AdminShell>
  );
}
