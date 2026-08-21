import { createServerFn } from "@tanstack/react-start";
import { bookingCrmQuerySchema, bookingReferenceSchema, financialDefaultsSchema, paymentCrmQuerySchema, paymentIdSchema, paymentReviewSchema, vatRuleIdSchema, vatRuleSchema } from "@/lib/finance-crm.schema";

export const getCrmBookingsFn = createServerFn({ method: "GET" }).validator(bookingCrmQuerySchema).handler(async ({ data }) => (await import("@/lib/finance-crm.server")).getCrmBookings(data));
export const getFinancialRulesFn = createServerFn({ method: "GET" }).handler(async () => (await import("@/lib/finance-crm.server")).getFinancialRules());
export const getCrmBookingDetailFn = createServerFn({ method: "GET" }).validator(bookingReferenceSchema).handler(async ({ data }) => (await import("@/lib/finance-crm.server")).getCrmBookingDetail(data.reference));
export const getCrmPaymentsFn = createServerFn({ method: "GET" }).validator(paymentCrmQuerySchema).handler(async ({ data }) => (await import("@/lib/finance-crm.server")).getCrmPayments(data));
export const getCrmPaymentFn = createServerFn({ method: "GET" }).validator(paymentIdSchema).handler(async ({ data }) => (await import("@/lib/finance-crm.server")).getCrmPayment(data.id));
export const reviewCrmPaymentFn = createServerFn({ method: "POST" }).validator(paymentReviewSchema).handler(async ({ data }) => (await import("@/lib/finance-crm.server")).reviewCrmPayment(data));
export const updateFinancialDefaultsFn = createServerFn({ method: "POST" }).validator(financialDefaultsSchema).handler(async ({ data }) => (await import("@/lib/finance-crm.server")).updateFinancialDefaults(data));
export const saveVatRuleFn = createServerFn({ method: "POST" }).validator(vatRuleSchema).handler(async ({ data }) => (await import("@/lib/finance-crm.server")).saveVatRule(data));
export const deleteVatRuleFn = createServerFn({ method: "POST" }).validator(vatRuleIdSchema).handler(async ({ data }) => (await import("@/lib/finance-crm.server")).deleteVatRule(data.id));
export const downloadBookingInvoiceFn = createServerFn({ method: "GET" }).validator(bookingReferenceSchema).handler(async ({ data }) => (await import("@/lib/financial-documents.server")).downloadBookingInvoice(data.reference));
