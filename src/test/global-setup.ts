// 1. test-utils/global-setup.ts - Global setup file
import { generateDbInitSql } from "./db-setup";

export async function setup() {
  console.log("🔧 Setting up test environment...");

  try {
    // Generate the schema SQL
    await generateDbInitSql();
    console.log("✅ Database schema generated and cached");
  } catch (error) {
    console.error("❌ Failed to generate database schema:", error);
    throw error;
  }
}

export async function teardown() {
  console.log("🧹 Global teardown complete");
}
