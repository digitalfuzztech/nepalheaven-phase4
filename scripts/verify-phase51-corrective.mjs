import mysql from "mysql2/promise";
import { scryptSync, timingSafeEqual } from "node:crypto";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
const connection = await mysql.createConnection(process.env.DATABASE_URL);
try {
  const [columns] = await connection.query(`
    SELECT table_name, column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND (
        (table_name = 'users' AND column_name IN ('date_of_birth', 'blocked_at'))
        OR (table_name IN ('leads', 'lead_interactions') AND column_name = 'hidden_at')
      )
    ORDER BY table_name, column_name
  `);
  const [customers] = await connection.query(`
    SELECT
      u.id, u.name, u.email, u.date_of_birth AS dateOfBirth,
      u.blocked_at AS blockedAt,
      (SELECT COUNT(*) FROM bookings b WHERE b.user_id = u.id) AS bookings,
      (SELECT COUNT(*) FROM booking_intents bi WHERE bi.user_id = u.id) AS bookingIntents,
      (SELECT COUNT(*) FROM user_identity_documents d WHERE d.user_id = u.id) AS customerDocuments,
      (SELECT COUNT(*) FROM booking_identity_documents d WHERE d.user_id = u.id) AS bookingDocuments,
      (SELECT COUNT(*) FROM blog_comments c WHERE c.user_id = u.id) AS blogComments
    FROM users u
    WHERE u.role = 'customer'
    ORDER BY u.created_at DESC
  `);
  const [leadCounts] = await connection.query(`
    SELECT 'destination' AS type,
      SUM(hidden_at IS NULL) AS visible,
      SUM(hidden_at IS NOT NULL) AS hidden
    FROM lead_interactions
    WHERE channel = 'web' AND direction = 'inbound'
      AND interaction_type IN ('destination_inquiry', 'itinerary_request')
    UNION ALL
    SELECT 'experience', SUM(hidden_at IS NULL), SUM(hidden_at IS NOT NULL)
    FROM lead_interactions
    WHERE channel = 'web' AND direction = 'inbound'
      AND interaction_type = 'experience_inquiry'
    UNION ALL
    SELECT 'contact', SUM(hidden_at IS NULL), SUM(hidden_at IS NOT NULL)
    FROM lead_interactions
    WHERE channel = 'web' AND direction = 'inbound'
      AND interaction_type IN ('contact', 'package_inquiry', 'brochure_request', 'expert_request')
    UNION ALL
    SELECT 'whatsapp', SUM(hidden_at IS NULL), SUM(hidden_at IS NOT NULL)
    FROM leads WHERE type = 'whatsapp_inquiry'
  `);
  const [adminRows] = await connection.query(
    "SELECT password_hash AS passwordHash FROM users WHERE role = 'admin' AND email = ? LIMIT 1",
    [process.env.ADMIN_EMAIL || ""],
  );
  const stored = adminRows[0]?.passwordHash || "";
  const [, salt, expectedHex] = stored.split("$");
  let adminCredentialMatches = false;
  if (salt && expectedHex && process.env.ADMIN_PASSWORD) {
    const expected = Buffer.from(expectedHex, "hex");
    const actual = scryptSync(
      process.env.ADMIN_PASSWORD,
      salt,
      expected.length,
      {
        N: 16384,
        r: 8,
        p: 1,
      },
    );
    adminCredentialMatches =
      expected.length === actual.length && timingSafeEqual(expected, actual);
  }
  console.log(
    JSON.stringify(
      { columns, customers, leadCounts, adminCredentialMatches },
      null,
      2,
    ),
  );
} finally {
  await connection.end();
}
