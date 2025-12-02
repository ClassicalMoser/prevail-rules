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
  prettierConfig,
);
