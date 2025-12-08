import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    // Run test files in domain folder and eslint-rules
    include: ['eslint-rules/**/*.test.{js,ts}'],
    // Exclude build output and node_modules
    exclude: ['dist/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['eslint-rules/boundaryAliasVsRelative/**/*.ts'],
      exclude: [
        'eslint-rules/**/*.test.ts',
        'eslint-rules/**/*.js', // Compiled output
        'eslint-rules/**/types.ts', // Type definitions only
        'eslint-rules/**/defaults.ts', // Helper functions (optional)
        'eslint-rules/tsdown.config.ts',
        'eslint-rules/vitest.config.ts',
      ],
    },
  },
});
