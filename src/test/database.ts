import Database from "better-sqlite3";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

async function migrationPaths(): Promise<string[]> {
  const migrationsDirectory = join(process.cwd(), "prisma", "migrations");
  const entries = await readdir(migrationsDirectory, { withFileTypes: true });
  return Promise.all(entries
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((entry) => join(migrationsDirectory, entry.name, "migration.sql")));
}

export async function createTestDatabase(): Promise<{
  prisma: PrismaClient;
  cleanup: () => Promise<void>;
}> {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), "couchsplitter-test-"));
  const databasePath = join(temporaryDirectory, "accounts.db");

  try {
    const sqliteDatabase = new Database(databasePath);
    sqliteDatabase.pragma("foreign_keys = ON");
    for (const path of await migrationPaths()) {
      sqliteDatabase.exec(await readFile(path, "utf8"));
    }
    sqliteDatabase.close();

    const testPrisma = new PrismaClient({
      adapter: new PrismaBetterSqlite3({ url: `file:${databasePath}` }),
    });

    return {
      prisma: testPrisma,
      async cleanup() {
        await testPrisma.$disconnect();
        await rm(temporaryDirectory, { recursive: true, force: true });
      },
    };
  } catch (error) {
    await rm(temporaryDirectory, { recursive: true, force: true });
    throw error;
  }
}
