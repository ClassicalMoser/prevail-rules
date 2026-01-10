/**
 * ESLint boundary configuration for the boundary-alias-vs-relative rule.
 * This file defines all architectural boundaries and their import rules.
 *
 * @typedef {object} BoundaryConfig
 * @property {string} dir - Relative directory path from rootDir
 * @property {string} alias - Import alias (e.g., '@entities')
 * @property {string[]} [allowImportsFrom] - Boundaries that can be imported from (value imports)
 * @property {string[]} [denyImportsFrom] - Boundaries that cannot be imported from
 * @property {string[]} [allowTypeImportsFrom] - Boundaries that can be imported as types (type-only imports)
 * @property {'alias'|'relative'|'inherit'} [nestedPathFormat] - Path format for nested boundaries
 * @property {'error'|'warn'} [severity] - Severity for violations in this boundary
 */

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
export const boundaries = [
  {
    identifier: '@utils',
    dir: 'domain/utils',
    alias: '@utils',
    // Pure utility types and functions
    // No dependencies on other layers
    // No structures or schemas
  },
  {
    identifier: '@ruleValues',
    dir: 'domain/ruleValues',
    alias: '@ruleValues',
    allowTypeImportsFrom: ['@entities', '@events', '@utils'],
    // Type imports ONLY, strictly for core rule definitions
  },
  {
    identifier: '@entities',
    dir: 'domain/entities',
    alias: '@entities',
    allowImportsFrom: ['@events', '@ruleValues'],
    allowTypeImportsFrom: ['@utils'],
    // Mutual dependency layer with events and rule values
    // No functions, no tests, pure declarative structures.
  },
  {
    identifier: '@events',
    dir: 'domain/events',
    alias: '@events',
    allowImportsFrom: ['@entities', '@ruleValues'],
    allowTypeImportsFrom: ['@utils'],
    // Mutual dependency layer with entities and rule values
    // No functions, no tests, pure declarative structures.
  },
  {
    identifier: '@queries',
    dir: 'domain/queries',
    alias: '@queries',
    allowImportsFrom: ['@entities', '@ruleValues', '@validation', '@events'],
    allowTypeImportsFrom: ['@utils'],
    // Mutual dependency layer with validation
    // Inwardly dependent on entities, events, and rule values
    // Queries are pure functions, no runtime.
  },
  {
    identifier: '@validation',
    dir: 'domain/validation',
    alias: '@validation',
    allowImportsFrom: [
      '@entities',
      '@queries',
      '@ruleValues',
      '@events',
      '@transforms',
    ],
    allowTypeImportsFrom: ['@utils'],
    // Mutual dependency layer with queries
    // Inwardly dependent on entities, events, and rule values
    // Validation is pure functions, no runtime.
    // ALWAYS returns boolean, never throws errors.
  },
  {
    identifier: '@sampleValues',
    dir: 'domain/sampleValues',
    alias: '@sampleValues',
    allowTypeImportsFrom: ['@entities'],
    // Database surrogate for development and testing.
    // Placeholder values for cards and units.
    // Pure declarative structures.
  },
  {
    identifier: '@transforms',
    dir: 'domain/transforms',
    alias: '@transforms',
    allowImportsFrom: [
      '@ruleValues',
      '@entities',
      '@events',
      '@queries',
      '@validation',
    ],
    allowTypeImportsFrom: ['@utils'],
    // State transition functions for applying events to game state.
    // Depends on structures and functions from other layers.
    // No runtime, pure functions.
  },
  {
    identifier: '@testing',
    dir: 'domain/testing',
    alias: '@testing',
    allowImportsFrom: [
      '@entities',
      '@queries',
      '@ruleValues',
      '@events',
      '@utils',
      '@validation',
      '@sampleValues',
      '@transforms',
    ],
    // May depend on all layers, no restrictions.
    // May only be used in tests.
  },
  {
    identifier: '@contracts',
    dir: 'contracts',
    alias: '@contracts',
    // Placeholder for future DTOs, currently empty.
  },
];
