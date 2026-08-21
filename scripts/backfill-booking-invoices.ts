import { inArray } from "drizzle-orm";
import { db } from "../src/db";
import { bookings } from "../src/db/schema/bookings";
import { ensureBookingInvoice } from "../src/lib/financial-documents.server";

if (!db) throw new Error("DATABASE_URL is required.");
const rows = await db
  .select({ reference: bookings.bookingReference })
  .from(bookings)
  .where(inArray(bookings.status, ["confirmed", "cancelled", "completed"]));
const completed: string[] = [];
const skipped: Array<{ reference: string; reason: string }> = [];
for (const row of rows) {
  try {
    await ensureBookingInvoice(row.reference);
    completed.push(row.reference);
  } catch (error) {
    skipped.push({
      reference: row.reference,
      reason: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
console.log(JSON.stringify({ completed, skipped }, null, 2));
process.exit(skipped.length ? 1 : 0);
