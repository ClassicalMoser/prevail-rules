import antfu from '@antfu/eslint-config';
import prettierConfig from 'eslint-config-prettier';
import boundaryAliasVsRelative from './eslint-rules/boundaryAliasVsRelative.js';

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
      'import/no-duplicates': ['error', { 'prefer-inline': false }],
    },
  },
  {
    files: ['src/**/*.ts', 'src/**/*.js'],
    plugins: {
      boundary: {
        rules: {
          'boundary-alias-vs-relative': boundaryAliasVsRelative,
        },
      },
    },
    rules: {
      'boundary/boundary-alias-vs-relative': [
        'error',
        {
          rootDir: 'src',
          boundaries: [
            {
              dir: 'domain/entities',
              alias: '@entities',
            },
            {
              dir: 'domain/queries',
              alias: '@queries',
            },
            {
              dir: 'domain/utils',
              alias: '@utils',
            },
            {
              dir: 'domain/validation',
              alias: '@validation',
            },
            {
              dir: 'domain/sampleValues',
              alias: '@sampleValues',
            },
            {
              dir: 'domain/transforms',
              alias: '@transforms',
            },
            {
              dir: 'domain/events',
              alias: '@events',
            },
            {
              dir: 'domain/testing',
              alias: '@testing',
            },
            {
              dir: 'contracts',
              alias: '@contracts',
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
