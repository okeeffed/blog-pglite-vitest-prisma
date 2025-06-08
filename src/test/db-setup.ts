import { readFileSync } from "node:fs";

import type { PrismaClient } from "../../generated/prisma";
import type { PGlite } from "@electric-sql/pglite";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";
import { cwd } from "node:process";
const execAsync = promisify(exec);

declare global {
  var testPrisma: PrismaClient;
  var testDb: PGlite;
}

const migrationOutputPath = resolve(cwd(), "tmp/migration.sql");

/**
 * The Prisma CLI does not (yet) support initializing a PGLite database. Instead, we get Prisma to
 * dump a single migration file which can then be loaded by a PGLite instance to setup the
 * database.
 *
 * @see https://github.com/lucasthevenet/pglite-utils/issues/8#issuecomment-2147944548
 */
export async function generateDbInitSql() {
  const prismaSchemaPath = resolve(cwd(), "prisma/schema.prisma");
  await execAsync(
    `prisma migrate diff --from-empty --to-schema-datamodel ${prismaSchemaPath} --script > ${migrationOutputPath}`,
  );
}

export function getSchemaSql() {
  return readFileSync(migrationOutputPath, "utf-8");
}
