import {
  and,
  count,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  like,
  ne,
  or,
  type SQL,
} from "drizzle-orm";
import { db } from "@/db";
import {
  leadInteractions,
  newsletterSubscribers,
} from "@/db/schema/communications";
import { blogComments } from "@/db/schema/blog-engagement";
import { bookingIntents, bookings, payments } from "@/db/schema/bookings";
import { financialDocuments } from "@/db/schema/finance";
import {
  bookingIdentityDocuments,
  userIdentityDocuments,
} from "@/db/schema/identity-documents";
import { destinations } from "@/db/schema/destinations";
import { experienceCategories } from "@/db/schema/experiences";
import { leadActivities, leads } from "@/db/schema/leads";
import { packages } from "@/db/schema/packages";
import { users } from "@/db/schema/users";
import { requireAdmin, revokeUserSessions } from "@/lib/auth.server";
import { countryName, isCountryCode } from "@/lib/countries";
import { readProfilePhoto } from "@/lib/profile-photo-storage.server";
import {
  crmCustomerQuerySchema,
  crmLeadQuerySchema,
  type CrmCustomerQuery,
  type CrmLeadQuery,
  type CrmLeadType,
} from "@/lib/crm.schema";

const CUSTOMER_PAGE_SIZE = 50;
const LEAD_PAGE_SIZE = 30;

function database() {
  if (!db) throw new Error("CRM data is temporarily unavailable.");
  return db;
}

function iso(value: Date) {
  return value.toISOString();
}

function totalFrom(rows: Array<{ value: number }>) {
  return Number(rows[0]?.value ?? 0);
}

function totalPages(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}

function customerReference(id: string) {
  return `CUS-${id.replace(/-/g, "").slice(0, 10).toUpperCase()}`;
}

export async function getCrmCustomers(input: CrmCustomerQuery) {
  await requireAdmin();
  const query = crmCustomerQuerySchema.parse(input);
  const database = db!;
  const conditions: SQL[] = [eq(users.role, "customer")];

  if (query.q) {
    const needle = `%${query.q}%`;
    conditions.push(or(like(users.name, needle), like(users.email, needle))!);
  }
  if (query.country) conditions.push(eq(users.country, query.country));

  const where = and(...conditions)!;
  const [countRows, countryRows] = await Promise.all([
    database.select({ value: count() }).from(users).where(where),
    database
      .selectDistinct({ country: users.country })
      .from(users)
      .where(
        and(
          eq(users.role, "customer"),
          isNotNull(users.country),
          ne(users.country, ""),
        ),
      )
      .orderBy(users.country),
  ]);
  const total = totalFrom(countRows);
  const pages = totalPages(total, CUSTOMER_PAGE_SIZE);
  const page = Math.min(query.page, pages);
  const rows = await database
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      country: users.country,
      nationality: users.nationality,
      dateOfBirth: users.dateOfBirth,
      blockedAt: users.blockedAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt), desc(users.id))
    .limit(CUSTOMER_PAGE_SIZE)
    .offset((page - 1) * CUSTOMER_PAGE_SIZE);

  return {
    kind: "customers" as const,
    rows: rows.map((row) => ({
      id: row.id,
      customerId: customerReference(row.id),
      name: row.name,
      email: row.email,
      phone: row.phone,
      country: row.country,
      nationality: row.nationality,
      dateOfBirth: row.dateOfBirth,
      blockedAt: row.blockedAt ? iso(row.blockedAt) : null,
      createdAt: iso(row.createdAt),
    })),
    countries: countryRows.flatMap((row) => (row.country ? [row.country] : [])),
    page,
    pageSize: CUSTOMER_PAGE_SIZE,
    total,
    totalPages: pages,
    query: { q: query.q, country: query.country },
  };
}

export async function getCrmCustomer(id: string) {
  await requireAdmin();
  const db = database();
  const [customer] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      country: users.country,
      nationality: users.nationality,
      dateOfBirth: users.dateOfBirth,
      avatarUrl: users.avatarUrl,
      emailVerifiedAt: users.emailVerifiedAt,
      blockedAt: users.blockedAt,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(and(eq(users.id, id), eq(users.role, "customer")))
    .limit(1);
  if (!customer) return { ok: false as const, code: "NOT_FOUND" as const };

  const bookingRows = await db
    .select({
      id: bookings.id,
      reference: bookings.bookingReference,
      packageTitle: packages.title,
      departureDate: bookings.departureDate,
      travellers: bookings.travellers,
      status: bookings.status,
      total: bookings.total,
      currency: bookings.currency,
      cancellationFee: bookings.cancellationFeeAmount,
      refundAmount: bookings.refundAmount,
      cancelledAt: bookings.cancelledAt,
      cancellationReason: bookings.cancellationReason,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .innerJoin(packages, eq(bookings.packageId, packages.id))
    .where(eq(bookings.userId, customer.id))
    .orderBy(desc(bookings.createdAt), desc(bookings.id));
  const bookingIds = bookingRows.map((row) => row.id);
  const paymentRows = bookingIds.length
    ? await db
        .select({
          bookingId: payments.bookingId,
          amount: payments.amount,
          purpose: payments.purpose,
          status: payments.status,
          createdAt: payments.createdAt,
        })
        .from(payments)
        .where(inArray(payments.bookingId, bookingIds))
        .orderBy(desc(payments.createdAt))
    : [];
  const paymentByBooking = new Map<
    string,
    Array<(typeof paymentRows)[number]>
  >();
  for (const payment of paymentRows) {
    const rows = paymentByBooking.get(payment.bookingId) ?? [];
    rows.push(payment);
    paymentByBooking.set(payment.bookingId, rows);
  }
  const bookingData = bookingRows.map((row) => {
    const bookingPayments = paymentByBooking.get(row.id) ?? [];
    const paid = bookingPayments.reduce((sum, payment) => {
      const amount = Number(payment.amount);
      if (payment.status === "paid" && payment.purpose !== "refund")
        return sum + amount;
      if (
        payment.status === "refunded" ||
        (payment.status === "paid" && payment.purpose === "refund")
      )
        return sum - amount;
      return sum;
    }, 0);
    return {
      ...row,
      total: Number(row.total ?? 0),
      amountPaid: Math.max(paid, 0),
      paymentStatus: bookingPayments[0]?.status ?? "No payment",
      createdAt: iso(row.createdAt),
      cancelledAt: row.cancelledAt ? iso(row.cancelledAt) : null,
    };
  });

  const [personalDocuments, bookingDocuments, financialRows] = await Promise.all([
    db
      .select({
        id: userIdentityDocuments.id,
        documentType: userIdentityDocuments.documentType,
        originalFilename: userIdentityDocuments.originalFilename,
        mimeType: userIdentityDocuments.mimeType,
        fileSize: userIdentityDocuments.fileSize,
        verificationStatus: userIdentityDocuments.verificationStatus,
        createdAt: userIdentityDocuments.createdAt,
      })
      .from(userIdentityDocuments)
      .where(eq(userIdentityDocuments.userId, customer.id))
      .orderBy(desc(userIdentityDocuments.createdAt)),
    db
      .select({
        id: bookingIdentityDocuments.id,
        bookingReference: bookings.bookingReference,
        documentType: bookingIdentityDocuments.documentType,
        originalFilename: bookingIdentityDocuments.originalFilename,
        mimeType: bookingIdentityDocuments.mimeType,
        fileSize: bookingIdentityDocuments.fileSize,
        verificationStatus: bookingIdentityDocuments.verificationStatus,
        createdAt: bookingIdentityDocuments.createdAt,
      })
      .from(bookingIdentityDocuments)
      .innerJoin(bookings, eq(bookingIdentityDocuments.bookingId, bookings.id))
      .where(eq(bookingIdentityDocuments.userId, customer.id))
      .orderBy(desc(bookingIdentityDocuments.createdAt)),
    db.select({id:financialDocuments.id,type:financialDocuments.type,documentNumber:financialDocuments.documentNumber,bookingId:financialDocuments.bookingId,filename:financialDocuments.filename,amount:financialDocuments.amount,currency:financialDocuments.currency,issuedAt:financialDocuments.issuedAt}).from(financialDocuments).where(eq(financialDocuments.userId,customer.id)).orderBy(desc(financialDocuments.issuedAt)),
  ]);

  let avatarUrl: string | null = null;
  if (customer.avatarUrl?.startsWith("private-avatar:")) {
    try {
      const key = customer.avatarUrl.slice("private-avatar:".length);
      const bytes = await readProfilePhoto(key);
      const mime = key.endsWith(".png") ? "image/png" : key.endsWith(".webp") ? "image/webp" : "image/jpeg";
      avatarUrl = `data:${mime};base64,${bytes.toString("base64")}`;
    } catch { avatarUrl = null; }
  } else if (customer.avatarUrl && /^https:\/\//i.test(customer.avatarUrl)) avatarUrl = customer.avatarUrl;

  const persistedByBooking = new Map(financialRows.filter((row)=>row.type==="booking_invoice").map((row)=>[row.bookingId,row]));
  const bookingInvoices = bookingRows.filter((row)=>row.status!=="pending").map((booking)=>{
    const stored=persistedByBooking.get(booking.id);
    return {id:stored?.id??booking.id,type:"booking_invoice" as const,documentNumber:stored?.documentNumber??`INV-${booking.reference}`,bookingReference:booking.reference,filename:stored?.filename??`Nepal-Heaven-Invoice-${booking.reference}.pdf`,amount:Number(stored?.amount??booking.total??0),currency:stored?.currency??booking.currency,issuedAt:iso(stored?.issuedAt??booking.createdAt),persisted:Boolean(stored)};
  });
  const refundInvoices = financialRows.filter((row)=>row.type==="refund_invoice").map((row)=>({id:row.id,type:row.type,documentNumber:row.documentNumber,bookingReference:bookingRows.find((booking)=>booking.id===row.bookingId)?.reference??"—",filename:row.filename,amount:Number(row.amount),currency:row.currency,issuedAt:iso(row.issuedAt),persisted:true}));

  return {
    ok: true as const,
    customer: {
      ...customer,
      avatarUrl,
      customerId: customerReference(customer.id),
      emailVerifiedAt: customer.emailVerifiedAt
        ? iso(customer.emailVerifiedAt)
        : null,
      blockedAt: customer.blockedAt ? iso(customer.blockedAt) : null,
      createdAt: iso(customer.createdAt),
      updatedAt: iso(customer.updatedAt),
    },
    confirmedBookings: bookingData.filter(
      (booking) => booking.status === "confirmed",
    ),
    cancelledBookings: bookingData.filter(
      (booking) => booking.status === "cancelled",
    ),
    savedTrips: [] as never[],
    savedTripsPersisted: false as const,
    documents: [
      ...personalDocuments.map((document) => ({
        ...document,
        scope: "customer" as const,
        bookingReference: null,
        createdAt: iso(document.createdAt),
      })),
      ...bookingDocuments.map((document) => ({
        ...document,
        scope: "booking" as const,
        createdAt: iso(document.createdAt),
      })),
    ],
    bookingInvoices,
    refundInvoices,
    structuredPassportsAvailable: false as const,
  };
}

export async function updateCrmCustomer(input: {
  id: string;
  name: string;
  phone: string;
  countryCode: string;
  dateOfBirth: string;
}) {
  await requireAdmin();
  const code = input.countryCode.toUpperCase();
  if (code && !isCountryCode(code))
    return { ok: false as const, message: "Select a valid country." };
  await database()
    .update(users)
    .set({
      name: input.name.trim(),
      phone: input.phone.trim() || null,
      nationality: code || null,
      country: code ? countryName(code) : null,
      dateOfBirth: input.dateOfBirth || null,
      updatedAt: new Date(),
    })
    .where(and(eq(users.id, input.id), eq(users.role, "customer")));
  return { ok: true as const };
}

export async function setCrmCustomerBlocked(input: {
  id: string;
  blocked: boolean;
}) {
  await requireAdmin();
  const db = database();
  const [customer] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, input.id), eq(users.role, "customer")))
    .limit(1);
  if (!customer)
    return { ok: false as const, message: "Customer account was not found." };
  await db
    .update(users)
    .set({
      blockedAt: input.blocked ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, customer.id));
  if (input.blocked) await revokeUserSessions(customer.id);
  return { ok: true as const };
}

export async function deleteCrmCustomer(id: string) {
  await requireAdmin();
  const db = database();
  return db.transaction(async (transaction) => {
    const [customer] = await transaction
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, id), eq(users.role, "customer")))
      .limit(1);
    if (!customer)
      return { ok: false as const, message: "Customer account was not found." };
    const [
      bookingCount,
      intentCount,
      personalDocumentCount,
      bookingDocumentCount,
      commentCount,
    ] = await Promise.all([
      transaction
        .select({ value: count() })
        .from(bookings)
        .where(eq(bookings.userId, id)),
      transaction
        .select({ value: count() })
        .from(bookingIntents)
        .where(eq(bookingIntents.userId, id)),
      transaction
        .select({ value: count() })
        .from(userIdentityDocuments)
        .where(eq(userIdentityDocuments.userId, id)),
      transaction
        .select({ value: count() })
        .from(bookingIdentityDocuments)
        .where(eq(bookingIdentityDocuments.userId, id)),
      transaction
        .select({ value: count() })
        .from(blogComments)
        .where(eq(blogComments.userId, id)),
    ]);
    const retained =
      totalFrom(bookingCount) +
      totalFrom(intentCount) +
      totalFrom(personalDocumentCount) +
      totalFrom(bookingDocumentCount) +
      totalFrom(commentCount);
    if (retained > 0)
      return {
        ok: false as const,
        message:
          "This customer has booking, document, or historical records that must be retained. Block the account instead.",
      };
    await transaction.delete(users).where(eq(users.id, id));
    return { ok: true as const };
  });
}

const interactionTypesByTab: Record<
  Exclude<CrmLeadType, "newsletter" | "whatsapp">,
  string[]
> = {
  destination: ["destination_inquiry", "itinerary_request"],
  experience: ["experience_inquiry"],
  contact: ["contact", "package_inquiry", "brochure_request", "expert_request"],
};

const leadTypeLabels: Record<typeof leads.$inferSelect.type, string> = {
  itinerary_request: "Itinerary Request",
  brochure_request: "Brochure Request",
  expert_request: "Expert Request",
  package_inquiry: "Package Inquiry",
  contact: "Contact",
  newsletter_subscriber: "Newsletter",
  destination_inquiry: "Destination",
  experience_inquiry: "Experience",
  whatsapp_inquiry: "WhatsApp",
};

export async function getCrmLeads(input: CrmLeadQuery) {
  await requireAdmin();
  const query = crmLeadQuerySchema.parse(input);
  if (query.type === "newsletter") return getNewsletterRows(query);
  return getLeadRows({ ...query, type: query.type });
}

async function getNewsletterRows(query: CrmLeadQuery) {
  const status =
    query.newsletterStatus === "subscribed" ? "active" : "unsubscribed";
  const where = eq(newsletterSubscribers.status, status);
  const [countRows] = await database()
    .select({ value: count() })
    .from(newsletterSubscribers)
    .where(where);
  const total = Number(countRows?.value ?? 0);
  const pages = totalPages(total, LEAD_PAGE_SIZE);
  const page = Math.min(query.page, pages);
  const rows = await database()
    .select({
      id: newsletterSubscribers.id,
      email: newsletterSubscribers.email,
      status: newsletterSubscribers.status,
      consentedAt: newsletterSubscribers.consentedAt,
      createdAt: newsletterSubscribers.createdAt,
      unsubscribedAt: newsletterSubscribers.unsubscribedAt,
    })
    .from(newsletterSubscribers)
    .where(where)
    .orderBy(
      status === "unsubscribed"
        ? desc(newsletterSubscribers.unsubscribedAt)
        : desc(newsletterSubscribers.consentedAt),
      desc(newsletterSubscribers.id),
    )
    .limit(LEAD_PAGE_SIZE)
    .offset((page - 1) * LEAD_PAGE_SIZE);

  return {
    kind: "newsletter" as const,
    newsletterStatus: query.newsletterStatus,
    rows: rows.map((row) => ({
      id: row.id,
      email: row.email,
      subscriptionDate: iso(row.consentedAt),
      originalSubscriptionDate: iso(row.createdAt),
      unsubscribedAt: row.unsubscribedAt ? iso(row.unsubscribedAt) : null,
    })),
    page,
    pageSize: LEAD_PAGE_SIZE,
    total,
    totalPages: pages,
  };
}

async function getLeadRows(
  query: CrmLeadQuery & { type: Exclude<CrmLeadType, "newsletter"> },
) {
  if (query.type === "whatsapp") return getWhatsAppLeadRows(query);
  const types = interactionTypesByTab[query.type];
  const where = and(
    inArray(leadInteractions.interactionType, types),
    eq(leadInteractions.channel, "web"),
    eq(leadInteractions.direction, "inbound"),
    query.visibility === "hidden"
      ? isNotNull(leadInteractions.hiddenAt)
      : isNull(leadInteractions.hiddenAt),
  )!;
  const [countRows] = await database()
    .select({ value: count() })
    .from(leadInteractions)
    .where(where);
  const total = Number(countRows?.value ?? 0);
  const pages = totalPages(total, LEAD_PAGE_SIZE);
  const page = Math.min(query.page, pages);
  const rows = await database()
    .select({
      id: leadInteractions.id,
      interactionType: leadInteractions.interactionType,
      interactionBody: leadInteractions.body,
      interactionEmail: leadInteractions.fromAddress,
      interactionMetadata: leadInteractions.metadata,
      interactionSubject: leadInteractions.subject,
      interactionToAddress: leadInteractions.toAddress,
      acquisitionSource: leadInteractions.acquisitionSource,
      contextType: leadInteractions.contextType,
      contextSlug: leadInteractions.contextSlug,
      hiddenAt: leadInteractions.hiddenAt,
      name: leads.name,
      email: leads.email,
      phone: leads.phone,
      travelDate: leads.travelDate,
      preferredStartDate: leads.preferredStartDate,
      travellers: leads.travellers,
      interestedIn: leads.interestedIn,
      message: leads.message,
      source: leads.source,
      createdAt: leadInteractions.createdAt,
      destinationName: destinations.name,
      experienceName: experienceCategories.name,
      packageName: packages.title,
    })
    .from(leadInteractions)
    .innerJoin(leads, eq(leadInteractions.leadId, leads.id))
    .leftJoin(destinations, eq(leads.destinationId, destinations.id))
    .leftJoin(
      experienceCategories,
      eq(leads.experienceId, experienceCategories.id),
    )
    .leftJoin(packages, eq(leads.packageId, packages.id))
    .where(where)
    .orderBy(desc(leadInteractions.createdAt), desc(leadInteractions.id))
    .limit(LEAD_PAGE_SIZE)
    .offset((page - 1) * LEAD_PAGE_SIZE);

  return {
    kind: query.type,
    rows: rows.map((row) => {
      const metadata = parseMetadata(row.interactionMetadata);
      const interactionType = row.interactionType as
        keyof typeof leadTypeLabels | undefined;
      return {
        id: row.id,
        leadType: interactionType
          ? (leadTypeLabels[interactionType] ?? "Lead")
          : "Lead",
        name: row.name,
        email: row.interactionEmail ?? row.email,
        phone: row.phone,
        travelDate:
          metadataString(metadata, "travelDate") ??
          row.travelDate ??
          row.preferredStartDate,
        travellers: metadataNumber(metadata, "travellers") ?? row.travellers,
        interestedIn:
          metadataString(metadata, "interestedIn") ?? row.interestedIn,
        message: row.interactionBody || row.message,
        source: metadataString(metadata, "source") ?? row.source,
        destinationName:
          metadataString(metadata, "destinationName") ??
          row.destinationName ??
          row.interestedIn,
        experienceName:
          metadataString(metadata, "experienceName") ??
          row.experienceName ??
          row.interestedIn,
        packageName:
          metadataString(metadata, "packageTitle") ??
          row.packageName ??
          row.interestedIn,
        metadata: serializableMetadata(metadata),
        subject: row.interactionSubject,
        toAddress: row.interactionToAddress,
        acquisitionSource: row.acquisitionSource,
        contextType: row.contextType,
        contextSlug: row.contextSlug,
        hiddenAt: row.hiddenAt ? iso(row.hiddenAt) : null,
        createdAt: iso(row.createdAt),
      };
    }),
    page,
    pageSize: LEAD_PAGE_SIZE,
    total,
    totalPages: pages,
  };
}

async function getWhatsAppLeadRows(query: CrmLeadQuery) {
  const where = and(
    eq(leads.type, "whatsapp_inquiry"),
    query.visibility === "hidden"
      ? isNotNull(leads.hiddenAt)
      : isNull(leads.hiddenAt),
  )!;
  const [countRows] = await database()
    .select({ value: count() })
    .from(leads)
    .where(where);
  const total = Number(countRows?.value ?? 0);
  const pages = totalPages(total, LEAD_PAGE_SIZE);
  const page = Math.min(query.page, pages);
  const rows = await database()
    .select({
      id: leads.id,
      name: leads.name,
      email: leads.email,
      phone: leads.phone,
      travelDate: leads.travelDate,
      travellers: leads.travellers,
      interestedIn: leads.interestedIn,
      message: leads.message,
      source: leads.source,
      status: leads.status,
      hiddenAt: leads.hiddenAt,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .where(where)
    .orderBy(desc(leads.createdAt), desc(leads.id))
    .limit(LEAD_PAGE_SIZE)
    .offset((page - 1) * LEAD_PAGE_SIZE);

  return {
    kind: "whatsapp" as const,
    rows: rows.map((row) => ({
      ...row,
      leadType: "WhatsApp",
      destinationName: null,
      experienceName: null,
      packageName: null,
      metadata: {},
      subject: null,
      toAddress: null,
      acquisitionSource: row.source,
      contextType: null,
      contextSlug: null,
      hiddenAt: row.hiddenAt ? iso(row.hiddenAt) : null,
      createdAt: iso(row.createdAt),
    })),
    page,
    pageSize: LEAD_PAGE_SIZE,
    total,
    totalPages: pages,
  };
}

type MutableLeadKind = "destination" | "experience" | "contact" | "whatsapp";

async function interactionForMutation(
  kind: Exclude<MutableLeadKind, "whatsapp">,
  id: string,
) {
  const [row] = await database()
    .select({ id: leadInteractions.id })
    .from(leadInteractions)
    .where(
      and(
        eq(leadInteractions.id, id),
        inArray(leadInteractions.interactionType, interactionTypesByTab[kind]),
        eq(leadInteractions.channel, "web"),
        eq(leadInteractions.direction, "inbound"),
      ),
    )
    .limit(1);
  return row;
}

export async function setCrmLeadHidden(input: {
  kind: MutableLeadKind;
  id: string;
  hidden: boolean;
}) {
  await requireAdmin();
  const db = database();
  if (input.kind === "whatsapp") {
    const [row] = await db
      .select({ id: leads.id })
      .from(leads)
      .where(and(eq(leads.id, input.id), eq(leads.type, "whatsapp_inquiry")))
      .limit(1);
    if (!row)
      return { ok: false as const, message: "WhatsApp lead was not found." };
    await db
      .update(leads)
      .set({
        hiddenAt: input.hidden ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, row.id));
    return { ok: true as const };
  }
  const row = await interactionForMutation(input.kind, input.id);
  if (!row)
    return { ok: false as const, message: "Lead acquisition was not found." };
  await db
    .update(leadInteractions)
    .set({ hiddenAt: input.hidden ? new Date() : null, updatedAt: new Date() })
    .where(eq(leadInteractions.id, row.id));
  return { ok: true as const };
}

export async function deleteCrmLead(input: {
  kind: MutableLeadKind;
  id: string;
}) {
  await requireAdmin();
  const db = database();
  if (input.kind !== "whatsapp") {
    const row = await interactionForMutation(input.kind, input.id);
    if (!row)
      return { ok: false as const, message: "Lead acquisition was not found." };
    await db.delete(leadInteractions).where(eq(leadInteractions.id, row.id));
    return { ok: true as const };
  }

  const [lead] = await db
    .select({ id: leads.id })
    .from(leads)
    .where(and(eq(leads.id, input.id), eq(leads.type, "whatsapp_inquiry")))
    .limit(1);
  if (!lead)
    return { ok: false as const, message: "WhatsApp lead was not found." };
  const interactions = await db
    .select({
      channel: leadInteractions.channel,
      interactionType: leadInteractions.interactionType,
    })
    .from(leadInteractions)
    .where(eq(leadInteractions.leadId, lead.id));
  const [activityCount] = await db
    .select({ value: count() })
    .from(leadActivities)
    .where(eq(leadActivities.leadId, lead.id));
  const hasOtherAcquisition = interactions.some(
    (interaction) =>
      interaction.channel !== "whatsapp" &&
      !interaction.interactionType.toLowerCase().includes("whatsapp"),
  );
  if (hasOtherAcquisition || Number(activityCount?.value ?? 0) > 0)
    return {
      ok: false as const,
      message:
        "This WhatsApp profile also owns other enquiry or activity history and cannot be deleted safely. Hide it instead.",
    };
  await db.delete(leads).where(eq(leads.id, lead.id));
  return { ok: true as const };
}

function parseMetadata(value: string | null) {
  if (!value) return {} as Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {} as Record<string, unknown>;
  }
}

function serializableMetadata(metadata: Record<string, unknown>) {
  const result: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (
      value === null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    )
      result[key] = value;
  }
  return result;
}

function metadataString(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function metadataNumber(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
