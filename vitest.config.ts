import path from 'node:path';
import { defineConfig } from 'vitest/config';

const __dirname = import.meta.dirname;

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
      // Procedures
      '@procedures': path.resolve(__dirname, './src/domain/procedures'),
      '@procedures/*': path.resolve(__dirname, './src/domain/procedures/*'),
      // Events
      '@events': path.resolve(__dirname, './src/domain/events'),
      '@events/*': path.resolve(__dirname, './src/domain/events/*'),
      // Game State (sequence types)
      '@game': path.resolve(__dirname, './src/domain/game'),
      '@game/*': path.resolve(__dirname, './src/domain/game/*'),
      '@commands': path.resolve(__dirname, './src/domain/events'),
      '@commands/*': path.resolve(__dirname, './src/domain/events/*'),
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
      // Application
      '@application': path.resolve(__dirname, './src/application'),
      '@application/*': path.resolve(__dirname, './src/application/*'),
    },
  },
  test: {
    coverage: {
      // Exclude build output and node_modules
      exclude: [
        // Exclude build output
        'dist/**/*.{js,ts}',
        // Exclude declaration-only entities
        'src/domain/entities/**/*.{js,ts}',
        // Exclude declaration-only game state types
        'src/domain/game/**/*.{js,ts}',
        // Exclude declaration-only events
        'src/domain/events/**/*.{js,ts}',
        // Exclude sample value files
        'src/domain/sampleValues/**/*.{js,ts}',
        // Exclude barrel files
        '**/index.{js,ts}',
      ],
      // Only run coverage on testable files in the domain folder
      include: ['src/domain/**/*.{js,ts}'],
      provider: 'v8',
    },
    exclude: ['dist/**', 'node_modules/**'],
    globals: true,
    include: [
      'src/domain/**/*.test.{js,ts}',
      'src/application/**/*.test.{js,ts}',
    ],
    watch: false,
  },
});
