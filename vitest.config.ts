import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      // Entities
      '@entities': path.resolve(__dirname, './src/domain/entities'),
      '@entities/*': path.resolve(__dirname, './src/domain/entities/*'),
      // Queries
      '@queries': path.resolve(__dirname, './src/domain/queries'),
      '@queries/*': path.resolve(__dirname, './src/domain/queries/*'),
      // Transforms
      '@transforms': path.resolve(__dirname, './src/domain/transforms'),
      '@transforms/*': path.resolve(__dirname, './src/domain/transforms/*'),
      // Events
      '@events': path.resolve(__dirname, './src/domain/events'),
      '@events/*': path.resolve(__dirname, './src/domain/events/*'),
      '@commands': path.resolve(__dirname, './src/domain/events'),
      '@commands/*': path.resolve(__dirname, './src/domain/events/*'),
      // Contracts
      '@contracts': path.resolve(__dirname, './src/contracts'),
      '@contracts/*': path.resolve(__dirname, './src/contracts/*'),
      // Testing
      '@testing': path.resolve(__dirname, './src/domain/testing'),
      '@testing/*': path.resolve(__dirname, './src/domain/testing/*'),
      // Utils
      '@utils': path.resolve(__dirname, './src/domain/utils'),
      '@utils/*': path.resolve(__dirname, './src/domain/utils/*'),
      // Validation
      '@validation': path.resolve(__dirname, './src/domain/validation'),
      '@validation/*': path.resolve(__dirname, './src/domain/validation/*'),
      // Sample Values
      '@sampleValues': path.resolve(__dirname, './src/domain/sampleValues'),
      '@sampleValues/*': path.resolve(__dirname, './src/domain/sampleValues/*'),
      // Rule Values
      '@ruleValues': path.resolve(__dirname, './src/domain/ruleValues'),
      '@ruleValues/*': path.resolve(__dirname, './src/domain/ruleValues/*'),
    },
  },
  test: {
    watch: false,
    // Only run test files in the domain folder
    include: ['src/domain/**/*.test.{js,ts}'],
    // Exclude build output and node_modules
    exclude: ['dist/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      // Only run coverage on testable files in the domain folder
      include: ['src/domain/**/*.{js,ts}'],
      exclude: [
        // Exclude build output
        'dist/**/*.{js,ts}',
        // Exclude declaration-only entities
        'src/domain/entities/**/*.{js,ts}',
        // Exclude declaration-only events
        'src/domain/events/**/*.{js,ts}',
        // Exclude test helper files
        'src/domain/testing/**/*.{js,ts}',
        // Exclude sample value files
        'src/domain/sampleValues/**/*.{js,ts}',
        // Exclude barrel files
        '**/index.{js,ts}',
      ],
    },
  },
});
