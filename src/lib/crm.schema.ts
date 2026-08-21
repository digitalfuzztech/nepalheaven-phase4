import { z } from "zod";
import { isCountryCode } from "@/lib/countries";

const pageSchema = z.coerce.number().int().min(1).max(100_000).default(1);

export const crmCustomerQuerySchema = z.object({
  page: pageSchema,
  q: z.string().trim().max(120).default(""),
  country: z.string().trim().max(120).default(""),
});

export const crmLeadTypeSchema = z.enum([
  "newsletter",
  "destination",
  "experience",
  "contact",
  "whatsapp",
]);

export const crmNewsletterStatusSchema = z.enum(["subscribed", "unsubscribed"]);
export const crmLeadVisibilitySchema = z.enum(["visible", "hidden"]);

export const crmLeadQuerySchema = z.object({
  type: crmLeadTypeSchema.default("newsletter"),
  newsletterStatus: crmNewsletterStatusSchema.default("subscribed"),
  visibility: crmLeadVisibilitySchema.default("visible"),
  page: pageSchema,
});

export const crmCustomerIdSchema = z.object({ id: z.string().uuid() });

export const crmCustomerUpdateSchema = crmCustomerIdSchema.extend({
  name: z.string().trim().min(1).max(160),
  phone: z.string().trim().max(60),
  countryCode: z
    .string()
    .trim()
    .max(2)
    .refine(
      (value) => !value || isCountryCode(value),
      "Select a valid country.",
    ),
  dateOfBirth: z
    .string()
    .trim()
    .refine((value) => {
      if (!value) return true;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      const parsed = new Date(`${value}T00:00:00Z`);
      return (
        !Number.isNaN(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === value &&
        parsed <= new Date()
      );
    }, "Use a valid date of birth."),
});

export const crmCustomerBlockSchema = crmCustomerIdSchema.extend({
  blocked: z.boolean(),
});

export const crmLeadMutationSchema = z.object({
  kind: z.enum(["destination", "experience", "contact", "whatsapp"]),
  id: z.string().uuid(),
});

export const crmLeadVisibilityMutationSchema = crmLeadMutationSchema.extend({
  hidden: z.boolean(),
});

export type CrmCustomerQuery = z.infer<typeof crmCustomerQuerySchema>;
export type CrmLeadQuery = z.infer<typeof crmLeadQuerySchema>;
export type CrmLeadType = z.infer<typeof crmLeadTypeSchema>;
export type CrmNewsletterStatus = z.infer<typeof crmNewsletterStatusSchema>;
export type CrmLeadVisibility = z.infer<typeof crmLeadVisibilitySchema>;
