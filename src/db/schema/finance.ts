import {
  boolean,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { bookings, payments } from "./bookings";
import { defaultMomentColumn, momentColumn, uuidColumn, uuidPrimaryColumn } from "./columns";
import { users } from "./users";

export const vatRules = mysqlTable("vat_rules", {
  id: uuidPrimaryColumn("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: defaultMomentColumn("created_at").notNull(),
  updatedAt: defaultMomentColumn("updated_at").notNull(),
});

export const vatRuleCountries = mysqlTable(
  "vat_rule_countries",
  {
    id: uuidPrimaryColumn("id").primaryKey(),
    ruleId: uuidColumn("rule_id")
      .notNull()
      .references(() => vatRules.id, { onDelete: "cascade" }),
    countryCode: varchar("country_code", { length: 2 }).notNull(),
  },
  (table) => [
    uniqueIndex("vat_rule_countries_country_unique").on(table.countryCode),
    index("vat_rule_countries_rule_idx").on(table.ruleId),
  ],
);

export const financialDocumentTypeValues = [
  "booking_invoice",
  "refund_invoice",
] as const;

export const financialDocuments = mysqlTable(
  "financial_documents",
  {
    id: uuidPrimaryColumn("id").primaryKey(),
    type: mysqlEnum("type", financialDocumentTypeValues).notNull(),
    documentNumber: varchar("document_number", { length: 120 }).notNull(),
    bookingId: uuidColumn("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "restrict" }),
    userId: uuidColumn("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    paymentId: uuidColumn("payment_id").references(() => payments.id, {
      onDelete: "set null",
    }),
    storageKey: varchar("storage_key", { length: 191 }).notNull().unique(),
    filename: text("filename").notNull(),
    mimeType: varchar("mime_type", { length: 120 }).notNull(),
    fileSize: int("file_size").notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 8 }).notNull(),
    snapshot: text("snapshot"),
    issuedAt: momentColumn("issued_at").notNull(),
    createdAt: defaultMomentColumn("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("financial_documents_number_unique").on(table.documentNumber),
    index("financial_documents_user_type_issued_idx").on(
      table.userId,
      table.type,
      table.issuedAt,
    ),
    index("financial_documents_booking_type_idx").on(table.bookingId, table.type),
  ],
);
