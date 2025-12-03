import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@entities": path.resolve(__dirname, "./src/entities"),
      "@functions": path.resolve(__dirname, "./src/functions"),
      "@commands": path.resolve(__dirname, "./src/commands"),
      "@contracts": path.resolve(__dirname, "./src/contracts"),
      "@testing": path.resolve(__dirname, "./src/testing"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@validation": path.resolve(__dirname, "./src/validation"),
      "@sampleValues": path.resolve(__dirname, "./src/sampleValues"),
      // Keep src alias for backward compatibility
      src: path.resolve(__dirname, "./src"),
    },
  },
  test: {
    watch: false,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{js,ts}"],
      exclude: [
        "dist/**/*.{js,ts}",
        "src/entities/**/*.{js,ts}",
        "src/contracts/**/*.{js,ts}",
        "src/commands/**/*.{js,ts}",
        "src/testing/**/*.{js,ts}",
        "src/sampleValues/**/*.{js,ts}",
        "**/index.{js,ts}",
      ],
    },
  },
});
