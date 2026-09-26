import type { OxlintConfig } from 'oxlint';
import { createOxlintConfig } from 'classicalmoser-oxlint-config';
import { boundaries } from './boundaries.ts';
import legacyDebt from './oxlint/legacyDebt.config.ts';

const base = createOxlintConfig({
  boundaries,
  filenameCase: 'camelCase',
});

const config: OxlintConfig = {
  ...base,
  rules: {
    ...base.rules,
    ...legacyDebt.rules,
  },
};

export default config;
