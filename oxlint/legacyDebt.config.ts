import type { OxlintConfig } from 'oxlint';

/**
 * Rules this repo isn't compliant with yet, layered locally on top of the
 * shared strict standard rather than baked into it. Re-enable one by one as
 * the code is brought into compliance; do not add new entries here without
 * a specific reason.
 */
const config: OxlintConfig = {
  rules: {
    // Priority: HIGH
    'init-declarations': 'off',
    'max-params': 'off',
    'max-depth': 'off',
    'unicorn/no-null': 'off',
    'no-shadow': 'off',
    'vitest/valid-title': 'off',
    // Priority: MEDIUM
    'consistent-function-scoping': 'off',
    'func-style': 'off',
    'no-continue': 'off',
    'import/exports-last': 'off',
    'import/group-exports': 'off',
    'typescript/explicit-function-return-type': 'off',
    'unicorn/prefer-native-coercion-functions': 'off',
    // Priority: LOW
    'vitest/require-mock-type-parameters': 'off',
    'vitest/require-test-timeout': 'off',
    'vitest/no-conditional-expect': 'off',
    'vitest/no-conditional-in-test': 'off',
    'vitest/prefer-expect-assertions': 'off',
    'vitest/max-expects': 'off',
  },
};

export default config;
