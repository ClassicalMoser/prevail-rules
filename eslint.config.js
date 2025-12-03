import antfu from "@antfu/eslint-config";
import prettierConfig from "eslint-config-prettier";

export default antfu(
  {
    react: false,
    typescript: true,
    stylistic: false,
    languageOptions: {
      globals: {
        describe: true,
        it: true,
        expect: true,
        vi: true,
        beforeAll: true,
        beforeEach: true,
        afterEach: true,
        afterAll: true,
      },
    },
    rules: {
      "no-console": ["error", { allow: ["error"] }],
    },
    extends: ["eslint-config-prettier"],
  },
  {
    files: ["**/*.ts", "**/*.js"],
    ignores: ["**/index.ts"],
    rules: {
      // Ban all relative imports; require aliases (@entities/*, @functions/*, etc.)
      "no-restricted-imports": "off",
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["./**", "./*", "../**"],
              message:
                "Use aliased imports (e.g., @entities/*, @functions/*) instead of relative paths.",
            },
            {
              group: ["src/**"],
              message:
                "Use aliased imports (@entities/*, @functions/*, etc.) instead of src/* paths.",
            },
            {
              group: ["**/*.js"],
              message: "Omit file extensions from imports.",
            },
            {
              group: ["**/*.test.{ts,js}"],
              message: "No importing from test files.",
            },
            {
              group: [
                "@entities/**/*",
                "@functions/**/*",
                "@commands/**/*",
                "@contracts/**/*",
                "@validation/**/*",
                "@testing/**/*",
                "@sampleValues/**/*",
              ],
              message:
                "Omit directory separators from imports; import from the barrel file (e.g., use '@entities' instead of '@entities/board/board').",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.test.{ts,js}"],
    languageOptions: {
      globals: {
        describe: true,
        it: true,
        expect: true,
        vi: true,
      },
    },
  },
  {
    ignores: ["pnpm-lock.yaml", "node_modules/", "*.yml"],
  },
  prettierConfig
);
