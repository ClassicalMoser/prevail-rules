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
    // Suite-local helpers wrap expect(); name them so the rule can see them.
    'vitest/expect-expect': [
      'error',
      {
        assertFunctionNames: [
          'expect',
          'expectDelegation',
          'expectGameEffect',
          'expectPlayerChoice',
        ],
      },
    ],
  },
};

export default config;
