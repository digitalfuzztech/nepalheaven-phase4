import { randomUUID } from "node:crypto";
import { and, asc, count, desc, eq, inArray, like, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { bookingTravellers, bookings, payments } from "@/db/schema/bookings";
import { siteSettings } from "@/db/schema/cms";
import { financialDocuments, vatRuleCountries, vatRules } from "@/db/schema/finance";
import { packages, packageTiers } from "@/db/schema/packages";
import { users } from "@/db/schema/users";
import { requireAdmin } from "@/lib/auth.server";
import { centsToMoney, moneyToCents } from "@/lib/booking-money";
import type { BookingCrmQuery, PaymentCrmQuery } from "@/lib/finance-crm.schema";

const PAGE_SIZE = 30;
const settingKeys = { vat: "booking.vat_percentage", vatEnabled: "booking.vat_enabled", cancellation: "booking.default_cancellation_fee_percentage" } as const;
const database = () => { if (!db) throw new Error("Financial CRM is temporarily unavailable."); return db; };
const iso = (value: Date | null) => value?.toISOString() ?? null;
const pages = (total: number) => Math.max(1, Math.ceil(total / PAGE_SIZE));
const label = (value: string | null) => value ? value.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ") : "—";

function summarize(rows: Array<typeof payments.$inferSelect>, total: string | null) {
  let paid = 0, refunded = 0;
  for (const row of rows) {
    const amount = moneyToCents(row.amount);
    if (row.status === "paid" && row.purpose !== "refund") paid += amount;
    if (row.status === "refunded" || (row.status === "paid" && row.purpose === "refund")) refunded += amount;
  }
  const net = paid - refunded;
  const totalCents = moneyToCents(total ?? "0");
  return { paid: Number(centsToMoney(paid)), refunded: Number(centsToMoney(refunded)), netPaid: Number(centsToMoney(net)), remaining: Number(centsToMoney(Math.max(totalCents - net, 0))), overpayment: Number(centsToMoney(Math.max(net - totalCents, 0))) };
}

export async function getCrmBookings(query: BookingCrmQuery) {
  await requireAdmin();
  const status = query.tab;
  const conditions: SQL[] = [eq(bookings.status, status)];
  if (query.q) {
    const needle = `%${query.q}%`;
    conditions.push(or(like(bookings.bookingReference, needle), like(users.name, needle), like(users.email, needle), like(packages.title, needle))!);
  }
  const where = and(...conditions)!;
  const db = database();
  const [countRow] = await db.select({ value: count() }).from(bookings).innerJoin(users, eq(users.id, bookings.userId)).innerJoin(packages, eq(packages.id, bookings.packageId)).where(where);
  const total = Number(countRow?.value ?? 0), totalPages = pages(total), page = Math.min(query.page, totalPages);
  const rows = await db.select({ id: bookings.id, reference: bookings.bookingReference, customerId: users.id, customerName: users.name, customerEmail: users.email, packageName: packages.title, travelDate: bookings.departureDate, travellers: bookings.travellers, subtotal: bookings.subtotal, vatPercentage: bookings.vatPercentageSnapshot, vatAmount: bookings.vatAmountSnapshot, total: bookings.total, currency: bookings.currency, status: bookings.status, createdAt: bookings.createdAt, cancelledAt: bookings.cancelledAt, cancellationPercentage: bookings.cancellationFeePercentageSnapshot, cancellationFee: bookings.cancellationFeeAmount, refundAmount: bookings.refundAmount, cancellationReason: bookings.cancellationReason }).from(bookings).innerJoin(users, eq(users.id, bookings.userId)).innerJoin(packages, eq(packages.id, bookings.packageId)).where(where).orderBy(status === "cancelled" ? desc(bookings.cancelledAt) : desc(bookings.createdAt), desc(bookings.id)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE);
  const paymentRows = rows.length ? await db.select().from(payments).where(inArray(payments.bookingId, rows.map((row) => row.id))) : [];
  return { rows: rows.map((row) => { const summary = summarize(paymentRows.filter((payment) => payment.bookingId === row.id), row.total); return { ...row, subtotal: Number(row.subtotal ?? 0), vatPercentage: row.vatPercentage === null ? null : Number(row.vatPercentage), vatAmount: Number(row.vatAmount ?? 0), total: Number(row.total ?? 0), cancellationPercentage: row.cancellationPercentage === null ? null : Number(row.cancellationPercentage), cancellationFee: row.cancellationFee === null ? null : Number(row.cancellationFee), refundAmount: row.refundAmount === null ? null : Number(row.refundAmount), createdAt: row.createdAt.toISOString(), cancelledAt: iso(row.cancelledAt), paymentStatus: summary.remaining === 0 ? "Paid" : summary.paid > 0 ? "Partially Paid" : "Unpaid", ...summary }; }), page, pageSize: PAGE_SIZE, total, totalPages, query };
}

export async function getFinancialRules() {
  await requireAdmin();
  const db = database();
  const [settings, rules, countries] = await Promise.all([
    db.select({ key: siteSettings.key, value: siteSettings.value }).from(siteSettings).where(inArray(siteSettings.key, Object.values(settingKeys))),
    db.select().from(vatRules).orderBy(asc(vatRules.name)),
    db.select().from(vatRuleCountries).orderBy(asc(vatRuleCountries.countryCode)),
  ]);
  const values = new Map(settings.map((row) => [row.key, row.value ? JSON.parse(row.value) : null]));
  return { defaultVat: values.get(settingKeys.vatEnabled) === false ? 0 : Number(values.get(settingKeys.vat) ?? 0), cancellationFee: Number(values.get(settingKeys.cancellation) ?? 0), rules: rules.map((rule) => ({ id: rule.id, name: rule.name, percentage: Number(rule.percentage), active: rule.active, countries: countries.filter((country) => country.ruleId === rule.id).map((country) => country.countryCode) })) };
}

export async function updateFinancialDefaults(input: { defaultVat: number; cancellationFee: number }) {
  await requireAdmin(); const now = new Date(); const db = database();
  await db.transaction(async (tx) => {
    for (const [key, value] of [[settingKeys.vat, input.defaultVat], [settingKeys.vatEnabled, input.defaultVat > 0], [settingKeys.cancellation, input.cancellationFee]] as const)
      await tx.insert(siteSettings).values({ id: randomUUID(), key, value: JSON.stringify(value), updatedAt: now }).onDuplicateKeyUpdate({ set: { value: JSON.stringify(value), updatedAt: now } });
  });
  return { ok: true as const };
}

export async function saveVatRule(input: { id: string | null; name: string; percentage: number; countries: string[] }) {
  await requireAdmin(); const db = database(); const id = input.id ?? randomUUID(); const uniqueCountries = [...new Set(input.countries)];
  const conflicts = await db.select({ code: vatRuleCountries.countryCode }).from(vatRuleCountries).where(inArray(vatRuleCountries.countryCode, uniqueCountries));
  if (conflicts.some((row) => !input.id || !uniqueCountries.includes(row.code) || true)) {
    const owned = input.id ? await db.select({ code: vatRuleCountries.countryCode }).from(vatRuleCountries).where(eq(vatRuleCountries.ruleId, input.id)) : [];
    const ownedSet = new Set(owned.map((row) => row.code));
    const foreign = conflicts.filter((row) => !ownedSet.has(row.code));
    if (foreign.length) return { ok: false as const, message: `${foreign.join(", ")} already belongs to another VAT rule.` };
  }
  await db.transaction(async (tx) => {
    if (input.id) await tx.update(vatRules).set({ name: input.name, percentage: input.percentage.toFixed(2), updatedAt: new Date() }).where(eq(vatRules.id, id));
    else await tx.insert(vatRules).values({ id, name: input.name, percentage: input.percentage.toFixed(2) });
    await tx.delete(vatRuleCountries).where(eq(vatRuleCountries.ruleId, id));
    if (uniqueCountries.length) await tx.insert(vatRuleCountries).values(uniqueCountries.map((countryCode) => ({ id: randomUUID(), ruleId: id, countryCode })));
  });
  return { ok: true as const };
}
export async function deleteVatRule(id: string) { await requireAdmin(); await database().delete(vatRules).where(eq(vatRules.id, id)); return { ok: true as const }; }

export async function resolveVatPercentageForCountry(countryCode: string | null, fallback: number) {
  if (!countryCode || !db) return fallback;
  const [row] = await db.select({ percentage: vatRules.percentage }).from(vatRuleCountries).innerJoin(vatRules, eq(vatRules.id, vatRuleCountries.ruleId)).where(and(eq(vatRuleCountries.countryCode, countryCode), eq(vatRules.active, true))).limit(1);
  return row ? Number(row.percentage) : fallback;
}

export async function getCrmPayments(query: PaymentCrmQuery) {
  await requireAdmin(); const conditions: SQL[] = [];
  if (query.status) conditions.push(eq(payments.status, query.status));
  if (query.purpose) conditions.push(eq(payments.purpose, query.purpose));
  if (query.provider) conditions.push(eq(payments.provider, query.provider));
  if (query.q) { const n=`%${query.q}%`; conditions.push(or(like(payments.providerTransactionId,n),like(bookings.bookingReference,n),like(users.name,n),like(users.email,n))!); }
  const where=conditions.length?and(...conditions):undefined, db=database();
  const [countRow]=await db.select({value:count()}).from(payments).innerJoin(bookings,eq(bookings.id,payments.bookingId)).innerJoin(users,eq(users.id,bookings.userId)).where(where);
  const total=Number(countRow?.value??0),totalPages=pages(total),page=Math.min(query.page,totalPages);
  const rows=await db.select({id:payments.id,reference:payments.providerTransactionId,bookingReference:bookings.bookingReference,customerName:users.name,customerEmail:users.email,packageName:packages.title,purpose:payments.purpose,amount:payments.amount,currency:payments.currency,provider:payments.provider,status:payments.status,reviewStatus:payments.reviewStatus,paidAt:payments.paidAt,createdAt:payments.createdAt}).from(payments).innerJoin(bookings,eq(bookings.id,payments.bookingId)).innerJoin(users,eq(users.id,bookings.userId)).innerJoin(packages,eq(packages.id,bookings.packageId)).where(where).orderBy(desc(payments.createdAt),desc(payments.id)).limit(PAGE_SIZE).offset((page-1)*PAGE_SIZE);
  const providers=(await db.selectDistinct({provider:payments.provider}).from(payments)).flatMap((row)=>row.provider?[row.provider]:[]);
  return {rows:rows.map((row)=>({...row,reference:row.reference||`PAY-${row.id.replaceAll("-","").slice(0,12).toUpperCase()}`,paymentType:label(row.purpose),method:row.provider==="dev_mock"?"Card":label(row.provider),amount:Number(row.amount),paidAt:iso(row.paidAt),createdAt:row.createdAt.toISOString()})),providers,page,pageSize:PAGE_SIZE,total,totalPages,query};
}

export async function getCrmPayment(id:string){await requireAdmin();const [row]=await database().select({id:payments.id,reference:payments.providerTransactionId,bookingReference:bookings.bookingReference,customerName:users.name,customerEmail:users.email,packageName:packages.title,purpose:payments.purpose,amount:payments.amount,currency:payments.currency,provider:payments.provider,status:payments.status,providerTransactionId:payments.providerTransactionId,failureReason:payments.failureReason,metadata:payments.metadata,reviewStatus:payments.reviewStatus,reviewNote:payments.reviewNote,reviewedAt:payments.reviewedAt,verifiedAt:payments.verifiedAt,paidAt:payments.paidAt,createdAt:payments.createdAt}).from(payments).innerJoin(bookings,eq(bookings.id,payments.bookingId)).innerJoin(users,eq(users.id,bookings.userId)).innerJoin(packages,eq(packages.id,bookings.packageId)).where(eq(payments.id,id)).limit(1);if(!row)return{ok:false as const};return{ok:true as const,payment:{...row,amount:Number(row.amount),paymentType:label(row.purpose),method:row.provider==="dev_mock"?"Card":label(row.provider),reviewedAt:iso(row.reviewedAt),verifiedAt:iso(row.verifiedAt),paidAt:iso(row.paidAt),createdAt:row.createdAt.toISOString()}};}
export async function reviewCrmPayment(input:{id:string;reviewStatus:"unreviewed"|"reviewed"|"needs_attention";note:string}){const admin=await requireAdmin();await database().update(payments).set({reviewStatus:input.reviewStatus,reviewNote:input.note||null,reviewedAt:input.reviewStatus==="unreviewed"?null:new Date(),reviewedBy:input.reviewStatus==="unreviewed"?null:admin.id,updatedAt:new Date()}).where(eq(payments.id,input.id));return{ok:true as const};}

export async function getCrmBookingDetail(reference:string){await requireAdmin();const db=database();const [row]=await db.select({id:bookings.id,reference:bookings.bookingReference,status:bookings.status,customerId:users.id,customerName:users.name,customerEmail:users.email,customerPhone:users.phone,customerCountry:users.country,packageName:packages.title,tierName:packageTiers.name,departureDate:bookings.departureDate,travellers:bookings.travellers,unitPrice:bookings.unitPriceSnapshot,subtotal:bookings.subtotal,vatPercentage:bookings.vatPercentageSnapshot,vatAmount:bookings.vatAmountSnapshot,total:bookings.total,currency:bookings.currency,initialPaymentOption:bookings.initialPaymentOption,minimumDeposit:bookings.minimumDepositAmountSnapshot,balanceDueDate:bookings.balanceDueDate,cancellationType:bookings.cancellationFeeTypeSnapshot,cancellationValue:bookings.cancellationFeeValueSnapshot,cancellationFee:bookings.cancellationFeeAmount,refundAmount:bookings.refundAmount,cancelledAt:bookings.cancelledAt,cancellationReason:bookings.cancellationReason,createdAt:bookings.createdAt,notes:bookings.notes}).from(bookings).innerJoin(users,eq(users.id,bookings.userId)).innerJoin(packages,eq(packages.id,bookings.packageId)).leftJoin(packageTiers,eq(packageTiers.id,bookings.packageTierId)).where(eq(bookings.bookingReference,reference)).limit(1);if(!row)return{ok:false as const};const [travellers,paymentRows,documents]=await Promise.all([db.select().from(bookingTravellers).where(eq(bookingTravellers.bookingId,row.id)).orderBy(asc(bookingTravellers.id)),db.select().from(payments).where(eq(payments.bookingId,row.id)).orderBy(asc(payments.createdAt)),db.select().from(financialDocuments).where(eq(financialDocuments.bookingId,row.id)).orderBy(desc(financialDocuments.issuedAt))]);const summary=summarize(paymentRows,row.total);return{ok:true as const,booking:{...row,unitPrice:Number(row.unitPrice??0),subtotal:Number(row.subtotal??0),vatPercentage:row.vatPercentage===null?null:Number(row.vatPercentage),vatAmount:Number(row.vatAmount??0),total:Number(row.total??0),minimumDeposit:Number(row.minimumDeposit??0),cancellationValue:Number(row.cancellationValue),cancellationFee:row.cancellationFee===null?null:Number(row.cancellationFee),refundAmount:row.refundAmount===null?null:Number(row.refundAmount),createdAt:row.createdAt.toISOString(),cancelledAt:iso(row.cancelledAt),...summary,travellers:travellers.map((item)=>({...item,dateOfBirth:item.dateOfBirth})),payments:paymentRows.map((payment)=>({...payment,amount:Number(payment.amount),createdAt:payment.createdAt.toISOString(),updatedAt:payment.updatedAt.toISOString(),paidAt:iso(payment.paidAt),verifiedAt:iso(payment.verifiedAt),reviewedAt:iso(payment.reviewedAt)})),documents:documents.map((doc)=>({...doc,amount:Number(doc.amount),issuedAt:doc.issuedAt.toISOString(),createdAt:doc.createdAt.toISOString()})),invoiceAvailable:row.status!=="pending"}};}
