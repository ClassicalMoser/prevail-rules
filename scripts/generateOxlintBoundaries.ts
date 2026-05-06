import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { boundaries } from "../boundaries.js";

/**
 * Generates `oxlint.boundaries.json` from the typed `boundaries.ts` source.
 *
 * The boundary list lives in one place (`boundaries.ts`) but oxlint requires
 * it inlined in two overrides — once for `src/**` (strict) and once for tests
 * (with `enforceBoundaries: false`). Per-override `extends` is not supported
 * by oxlint, so we duplicate the array in the generated file.
 *
 * `.oxlintrc.json` extends the generated file; do not edit the output by hand.
 */

const baseRuleConfig = {
  rootDir: "src",
  crossBoundaryStyle: "alias",
  boundaries,
} as const;

const config = {
  $schema: "./node_modules/oxlint/configuration_schema.json",
  overrides: [
    {
      files: ["src/**/*.ts", "src/**/*.js"],
      rules: {
        "import-boundaries/enforce": ["error", baseRuleConfig],
      },
      jsPlugins: ["eslint-plugin-import-boundaries"],
    },
    {
      files: [
        "**/*.test.{ts,js}",
        "**/*.spec.{ts,js}",
        "**/*.mock.{ts,js}",
        "**/__tests__/**",
        "**/__mocks__/**",
      ],
      rules: {
        "import-boundaries/enforce": ["error", { ...baseRuleConfig, enforceBoundaries: false }],
      },
      jsPlugins: ["eslint-plugin-import-boundaries"],
    },
  ],
};

const outputPath = resolve(import.meta.dirname, "..", "oxlint.boundaries.json");
writeFileSync(outputPath, `${JSON.stringify(config, null, 2)}\n`);

// eslint-disable-next-line no-console
console.log(`Generated ${outputPath}`);
