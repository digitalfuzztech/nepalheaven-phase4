import { randomUUID } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookingTravellers, bookings, payments } from "@/db/schema/bookings";
import { financialDocuments } from "@/db/schema/finance";
import { destinations } from "@/db/schema/destinations";
import { packages, packageTiers } from "@/db/schema/packages";
import { users } from "@/db/schema/users";
import { requireAdmin } from "@/lib/auth.server";
import { createBookingInvoicePdf, type BookingInvoiceInput } from "@/lib/booking-invoice.server";
import { readFinancialPdf, storeFinancialPdf } from "@/lib/financial-document-storage.server";

function database(){if(!db)throw new Error("Financial documents are unavailable.");return db;}
const formatDate=(value:Date|string|null)=>value?new Intl.DateTimeFormat("en-US",{dateStyle:"medium",timeZone:"Asia/Kathmandu"}).format(new Date(value)):"Not specified";
const formatMoney=(value:string|null)=>Number(value??0).toFixed(2);
const method=(provider:string|null)=>provider==="dev_mock"?"Card":provider||"Not provided";

export async function persistBookingInvoice(input:{bookingId:string;userId:string;paymentId:string;bookingReference:string;amount:string;currency:string;invoice:{filename:string;content:Buffer;contentType:string};snapshot:BookingInvoiceInput;issuedAt:Date}){
  const db=database(),documentNumber=`INV-${input.bookingReference}`;
  const [existing]=await db.select({id:financialDocuments.id}).from(financialDocuments).where(eq(financialDocuments.documentNumber,documentNumber)).limit(1);
  if(existing)return existing;
  const storageKey=`${randomUUID()}.pdf`;
  await storeFinancialPdf(storageKey,input.invoice.content);
  const id=randomUUID();
  await db.insert(financialDocuments).values({id,type:"booking_invoice",documentNumber,bookingId:input.bookingId,userId:input.userId,paymentId:input.paymentId,storageKey,filename:input.invoice.filename,mimeType:input.invoice.contentType,fileSize:input.invoice.content.length,amount:input.amount,currency:input.currency,snapshot:JSON.stringify(input.snapshot),issuedAt:input.issuedAt});
  return {id};
}

export async function ensureBookingInvoice(reference:string){
  const db=database();
  const [existing]=await db.select().from(financialDocuments).innerJoin(bookings,eq(bookings.id,financialDocuments.bookingId)).where(and(eq(bookings.bookingReference,reference),eq(financialDocuments.type,"booking_invoice"))).limit(1);
  if(existing)return existing.financial_documents;
  const [row]=await db.select({bookingId:bookings.id,userId:bookings.userId,reference:bookings.bookingReference,departureDate:bookings.departureDate,travellers:bookings.travellers,total:bookings.total,amountPaid:bookings.amountInitiallyPaid,remaining:bookings.remainingBalanceSnapshot,currency:bookings.currency,createdAt:bookings.createdAt,customerName:users.name,customerEmail:users.email,customerPhone:users.phone,customerCountry:users.country,customerNationality:users.nationality,packageName:packages.title,tierName:packageTiers.name,destinationName:destinations.name}).from(bookings).innerJoin(users,eq(users.id,bookings.userId)).innerJoin(packages,eq(packages.id,bookings.packageId)).leftJoin(packageTiers,eq(packageTiers.id,bookings.packageTierId)).leftJoin(destinations,eq(destinations.id,packages.destinationId)).where(eq(bookings.bookingReference,reference)).limit(1);
  if(!row)throw new Error("Booking invoice was not found.");
  const [[traveller],[payment]]=await Promise.all([db.select().from(bookingTravellers).where(eq(bookingTravellers.bookingId,row.bookingId)).limit(1),db.select().from(payments).where(and(eq(payments.bookingId,row.bookingId),eq(payments.status,"paid"))).orderBy(asc(payments.createdAt)).limit(1)]);
  if(!payment)throw new Error("A paid booking transaction is required before an invoice can be issued.");
  const snapshot:BookingInvoiceInput={bookingReference:row.reference,paymentReference:payment.providerTransactionId||"Not provided",invoiceDate:formatDate(payment.paidAt||row.createdAt),customerName:traveller?`${traveller.firstName} ${traveller.lastName}`.trim():row.customerName,customerEmail:traveller?.email||row.customerEmail,customerPhone:traveller?.phone||row.customerPhone||"Not provided",customerCountry:traveller?.nationality||row.customerNationality||row.customerCountry||"Not provided",packageName:row.packageName,tierName:row.tierName||"Not specified",destinationName:row.destinationName||"Not specified",startDate:formatDate(row.departureDate),endDate:"Not specified",travellers:row.travellers,currency:row.currency,grandTotal:formatMoney(row.total),paymentType:payment.purpose==="full"?"Full Payment":payment.purpose==="balance"?"Balance Payment":"Advance Payment",amountPaid:formatMoney(row.amountPaid||payment.amount),remainingBalance:formatMoney(row.remaining),paymentStatus:Number(row.remaining??0)<=0?"Paid in Full":"Advance Paid",paymentMethod:method(payment.provider)};
  const invoice=await createBookingInvoicePdf(snapshot);
  await persistBookingInvoice({bookingId:row.bookingId,userId:row.userId,paymentId:payment.id,bookingReference:row.reference,amount:row.total??payment.amount,currency:row.currency,invoice,snapshot,issuedAt:payment.paidAt||row.createdAt});
  const [created]=await db.select().from(financialDocuments).where(eq(financialDocuments.documentNumber,`INV-${reference}`)).limit(1);
  if(!created)throw new Error("Invoice persistence failed.");return created;
}

export async function downloadBookingInvoice(reference:string){await requireAdmin();const doc=await ensureBookingInvoice(reference);const content=await readFinancialPdf(doc.storageKey);return{ok:true as const,document:{filename:doc.filename,mimeType:doc.mimeType,base64:content.toString("base64")}};}
