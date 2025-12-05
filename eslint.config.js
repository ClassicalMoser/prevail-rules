import antfu from '@antfu/eslint-config';
import prettierConfig from 'eslint-config-prettier';

export default antfu(
  {
    react: false,
    typescript: true,
    stylistic: false,
    markdown: false,
    ignores: [
      'reports/**',
      'dist/**',
      '.stryker-tmp/**',
      'coverage/**',
      'node_modules/**',
    ],
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
      'no-console': ['error', { allow: ['error'] }],
    },
    extends: ['eslint-config-prettier'],
  },
  {
    files: ['**/*.ts', '**/*.js'],
    ignores: ['**/index.ts'],
    rules: {
      // Ban all relative imports; require aliases (@entities/*, @queries/*, etc.)
      'no-restricted-imports': 'off',
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../**'],
              message:
                'Use aliased imports (e.g., @entities/*, @queries/*) instead of relative paths that go up directories.',
            },
            {
              group: ['src/**'],
              message:
                'Use aliased imports (@entities/*, @queries/*, etc.) instead of src/* paths.',
            },
            {
              group: ['**/*.js'],
              message: 'Omit file extensions from imports.',
            },
            {
              group: ['**/*.test.{ts,js}'],
              message: 'No importing from test files.',
            },
            {
              group: [
                '@entities/**/*',
                '@queries/**/*',
                '@commands/**/*',
                '@contracts/**/*',
                '@validation/**/*',
                '@testing/**/*',
                '@sampleValues/**/*',
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
    files: ['**/*.test.{ts,js}'],
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
    ignores: [
      'pnpm-lock.yaml',
      'node_modules/**',
      'reports/**',
      'dist/**',
      '.stryker-tmp/**',
      'coverage/**',
      '*.yml',
      '**/*.md',
      '**/*.mdx',
    ],
  },
  prettierConfig,
);
