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
        tables,
    ] =
        await connection.query(
            `
            SELECT
                TABLE_NAME
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'destination_faqs'
            `,
        );

    console.log(
        "destination_faqs table:",
        tables.length === 1
            ? "EXISTS"
            : "MISSING",
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
              AND TABLE_NAME = 'destination_faqs'
            ORDER BY ORDINAL_POSITION
            `,
        );

    console.table(
        columns,
    );

    const [
        foreignKeys,
    ] =
        await connection.query(
            `
                SELECT
                    rc.CONSTRAINT_NAME AS CONSTRAINT_NAME,
                    kcu.COLUMN_NAME AS COLUMN_NAME,
                    kcu.REFERENCED_TABLE_NAME AS REFERENCED_TABLE_NAME,
                    kcu.REFERENCED_COLUMN_NAME AS REFERENCED_COLUMN_NAME,
                    rc.DELETE_RULE AS DELETE_RULE
                FROM information_schema.REFERENTIAL_CONSTRAINTS rc
                         JOIN information_schema.KEY_COLUMN_USAGE kcu
                              ON rc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
                                  AND rc.TABLE_NAME = kcu.TABLE_NAME
                                  AND rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
                WHERE rc.CONSTRAINT_SCHEMA = DATABASE()
                  AND rc.TABLE_NAME = 'destination_faqs'
                  AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
            `,
        );

    console.table(
        foreignKeys,
    );
} finally {
    await connection.end();
}