import type { BoundaryConfig } from 'eslint-plugin-import-boundaries';

/**
 * Boundary definitions for the hexagonal architecture.
 * Each boundary defines:
 * - dir: Relative directory path from rootDir
 * - alias: Import alias (e.g., '@entities')
 * - allowImportsFrom: Boundaries that can be imported from (value imports)
 * - allowTypeImportsFrom: Boundaries that can be imported as types (type-only imports)
 *
 * @type {BoundaryConfig[]}
 */
export const boundaries: BoundaryConfig[] = [
  {
    alias: '@utils',
    dir: 'domain/utils',
    identifier: '@utils',
    // Pure utility types and functions
    // No dependencies on other layers
    // No structures or schemas
  },
  {
    alias: '@ruleValues',
    allowTypeImportsFrom: ['@entities', '@events', '@utils'],
    dir: 'domain/ruleValues',
    identifier: '@ruleValues',
    // Type imports ONLY, strictly for core rule definitions
  },
  {
    alias: '@entities',
    allowImportsFrom: ['@ruleValues', '@utils'],
    dir: 'domain/entities',
    identifier: '@entities',
    // Mutual dependency layer with events and rule values
    // No functions, no tests, pure declarative structures.
  },
  {
    alias: '@events',
    allowImportsFrom: ['@entities', '@ruleValues', '@utils'],
    dir: 'domain/events',
    identifier: '@events',

    // Mutual dependency layer with entities and rule values
    // No functions, no tests, pure declarative structures.
  },
  {
    alias: '@queries',
    allowImportsFrom: [
      '@entities',
      '@ruleValues',
      '@events',
      '@game',
      '@utils',
    ],
    dir: 'domain/queries',
    identifier: '@queries',
    // Mutual dependency layer with validation
    // Inwardly dependent on entities, events, and rule values
    // Queries are pure functions, no runtime.
  },
  {
    alias: '@validation',
    allowImportsFrom: [
      '@entities',
      '@queries',
      '@game',
      '@ruleValues',
      '@events',
      '@transforms',
      '@utils',
    ],
    dir: 'domain/validation',
    identifier: '@validation',
    // Mutual dependency layer with queries
    // Inwardly dependent on entities, events, and rule values
    // Validation is pure functions, no runtime.
    // ALWAYS returns boolean, never throws errors.
  },
  {
    alias: '@sampleValues',
    allowTypeImportsFrom: ['@entities'],
    dir: 'domain/sampleValues',
    identifier: '@sampleValues',
    // Database surrogate for development and testing.
    // Placeholder values for cards and units.
    // Pure declarative structures.
  },
  {
    alias: '@transforms',
    allowImportsFrom: [
      '@ruleValues',
      '@entities',
      '@game',
      '@events',
      '@queries',
      '@validation',
      '@utils',
    ],
    dir: 'domain/transforms',
    identifier: '@transforms',
    // State transition functions for applying events to game state.
    // Depends on structures and functions from other layers.
    // No runtime, pure functions.
  },
  {
    alias: '@game',
    allowImportsFrom: [
      '@entities',
      '@events',
      '@queries',
      '@validation',
      '@ruleValues',
      '@transforms',
      '@utils',
    ],
    dir: 'domain/game',
    identifier: '@game',
    // State transition functions for applying events to game state.
    // Depends on structures and functions from other layers.
    // No runtime, pure functions.
  },
  {
    alias: '@testing',
    allowImportsFrom: [
      '@entities',
      '@queries',
      '@ruleValues',
      '@events',
      '@utils',
      '@validation',
      '@game',
      '@sampleValues',
      '@transforms',
    ],
    dir: 'domain/testing',
    identifier: '@testing',
    // May depend on all layers, no restrictions.
    // May only be used in tests.
  },
];
