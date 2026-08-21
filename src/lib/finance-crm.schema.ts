import { z } from "zod";
import { isCountryCode } from "@/lib/countries";

const page = z.coerce.number().int().min(1).max(100000).default(1);
const percentage = z.coerce.number().min(0).max(100);

export const bookingCrmQuerySchema = z.object({
  tab: z.enum(["confirmed", "cancelled"]).default("confirmed"),
  page,
  q: z.string().trim().max(120).default(""),
});
export const paymentCrmQuerySchema = z.object({
  page,
  q: z.string().trim().max(120).default(""),
  status: z.enum(["", "pending", "processing", "paid", "failed", "refunded"]).default(""),
  purpose: z.enum(["", "deposit", "full", "balance", "additional", "refund"]).default(""),
  provider: z.string().trim().max(64).default(""),
});
export const bookingReferenceSchema = z.object({ reference: z.string().trim().max(64) });
export const paymentIdSchema = z.object({ id: z.string().uuid() });
export const paymentReviewSchema = paymentIdSchema.extend({
  reviewStatus: z.enum(["unreviewed", "reviewed", "needs_attention"]),
  note: z.string().trim().max(2000).default(""),
});
export const financialDefaultsSchema = z.object({
  defaultVat: percentage,
  cancellationFee: percentage,
});
export const vatRuleSchema = z.object({
  id: z.string().uuid().nullable().default(null),
  name: z.string().trim().min(1).max(120),
  percentage,
  countries: z.array(z.string().length(2).refine(isCountryCode)).min(1),
});
export const vatRuleIdSchema = z.object({ id: z.string().uuid() });

export type BookingCrmQuery = z.infer<typeof bookingCrmQuerySchema>;
export type PaymentCrmQuery = z.infer<typeof paymentCrmQuerySchema>;
