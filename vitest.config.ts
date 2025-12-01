import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    watch: false,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{js,ts}"],
      exclude: [
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
