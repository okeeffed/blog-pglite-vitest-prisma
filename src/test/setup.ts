import { beforeAll, afterAll, beforeEach } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { PrismaPGlite } from "pglite-prisma-adapter";
import { PrismaClient } from "../../generated/prisma";
import { getSchemaSql } from "./db-setup";

let db: PGlite;
let prisma: PrismaClient;

beforeAll(async () => {
  console.log("🚀 Setting up database for test file...");

  db = new PGlite({
    dataDir: "memory://",
  });

  /** Setup the PGlite database. */
  await db.exec(
    /** To use this in the frontend, you could simply serve up the generated SQL file. */
    getSchemaSql(),
  );

  prisma = new PrismaClient({
    adapter: new PrismaPGlite(db),
  });

  // Make available globally
  global.testDb = db;
  global.testPrisma = prisma;

  console.log("✅ Database ready!");
});

afterAll(async () => {
  console.log("🧹 Cleaning up database...");

  try {
    await prisma.$disconnect();
    await db.close();
  } catch (error) {
    console.warn("Cleanup warning:", error);
  }

  console.log("✅ Database cleaned up!");
});

beforeEach(async () => {
  // Get all table names excluding Prisma migration tables
  const result = await db.query<{ tablename: string }>(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE '_prisma%'
      ORDER BY tablename;
    `);

  const tableNames = result.rows.map((row) => row.tablename);

  if (tableNames.length > 0) {
    // Disable foreign key checks, truncate all tables, re-enable
    await db.exec(`
        SET session_replication_role = replica;
        TRUNCATE TABLE ${tableNames.map((name) => `"${name}"`).join(", ")} RESTART IDENTITY CASCADE;
        SET session_replication_role = DEFAULT;
      `);
  }
});
