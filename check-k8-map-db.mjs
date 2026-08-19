import mysql from "mysql2/promise";

const connection =
    await mysql.createConnection(
        process.env.DATABASE_URL,
    );

try {
    const [[database]] =
        await connection.query(
            "SELECT DATABASE() AS db",
        );

    console.log(
        "Database:",
        database.db,
    );

    const [
        columns,
    ] =
        await connection.query(
            `
            SELECT
                COLUMN_NAME,
                COLUMN_TYPE,
                IS_NULLABLE
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'destinations'
              AND COLUMN_NAME IN (
                  'latitude',
                  'longitude'
              )
            ORDER BY COLUMN_NAME
            `,
        );

    console.table(
        columns,
    );

    const [
        migrations,
    ] =
        await connection.query(
            `
            SELECT
                id,
                hash,
                created_at
            FROM __drizzle_migrations
            ORDER BY created_at ASC
            `,
        );

    console.log(
        "Migration rows:",
        migrations.length,
    );

    console.table(
        migrations.slice(
            -3,
        ),
    );
} finally {
    await connection.end();
}