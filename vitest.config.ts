import { defineConfig } from "vitest/config";
import { cpus } from "node:os";

const maxThreads = Math.max(1, cpus().length - 1);

export default defineConfig({
  test: {
    pool: "threads",
    poolOptions: {
      threads: {
        maxThreads,
        minThreads: 1,
        isolate: true,
      },
    },

    setupFiles: ["./src/test/setup.ts"],
    globalSetup: "./src/test/global-setup.ts",

    // Add the types file to be loaded automatically
    typecheck: {
      include: ["**/*.{test,spec}.{js,ts,jsx,tsx}"],
    },

    testTimeout: 15000,
    hookTimeout: 10000,

    include: ["**/*.{test,spec}.{js,ts,jsx,tsx}"],
    exclude: ["node_modules", "dist", "build"],

    environment: "node",
  },
});
