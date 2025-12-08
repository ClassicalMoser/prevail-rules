import antfu from '@antfu/eslint-config';
import prettierConfig from 'eslint-config-prettier';
import { boundaries } from './boundaries.js';
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
      'eslint-rules/**/*.js', // Ignore compiled ESLint rule files
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
          boundaries,
        },
      ],
    },
  },
  {
    files: [
      '**/*.test.{ts,js}',
      '**/*.spec.{ts,js}',
      '**/*.mock.{ts,js}',
      '**/__tests__/**',
      '**/__mocks__/**',
    ],
    languageOptions: {
      globals: {
        describe: true,
        it: true,
        expect: true,
        vi: true,
      },
    },
    rules: {
      'boundary/boundary-alias-vs-relative': [
        'error',
        {
          rootDir: 'src',
          skipBoundaryRulesForTestFiles: true, // Skip boundary allow/deny rules, but still enforce path format
          boundaries,
        },
      ],
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
      'eslint-rules/**/*.js', // Ignore compiled ESLint rule files
    ],
  },
  prettierConfig,
);
