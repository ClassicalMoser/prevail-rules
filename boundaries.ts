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
    allowImportsFrom: ['@utils', '@ruleValues'],
    dir: 'domain/entities',
    identifier: '@entities',
    // Schema-first declarative structures. No functions, no tests.
  },
  {
    alias: '@events',
    allowImportsFrom: ['@utils', '@ruleValues', '@entities'],
    dir: 'domain/events',
    identifier: '@events',
    // Schema-first event definitions. No functions, no tests.
  },
  {
    alias: '@game',
    allowImportsFrom: ['@utils', '@ruleValues', '@entities', '@events'],
    dir: 'domain/game',
    identifier: '@game',
    // Game state and phase schemas. Depends on entities and events only.
  },
  {
    alias: '@factories',
    allowImportsFrom: [
      '@utils',
      '@ruleValues',
      '@entities',
      '@events',
      '@game',
    ],
    dir: 'domain/factories',
    identifier: '@factories',
    // Pure constructors for domain values (e.g. unit instances).
  },
  {
    alias: '@queries',
    allowImportsFrom: [
      '@utils',
      '@ruleValues',
      '@entities',
      '@events',
      '@game',
      '@factories',
    ],
    dir: 'domain/queries',
    identifier: '@queries',
    // Pure reads: geometry, state walking, stats, sequencing getters.
  },
  {
    alias: '@expected',
    allowImportsFrom: [
      '@utils',
      '@ruleValues',
      '@entities',
      '@events',
      '@game',
      '@factories',
      '@queries',
    ],
    dir: 'domain/expected',
    identifier: '@expected',
    // Normative next-event dispatch (what choice or effect is expected).
  },
  {
    alias: '@procedures',
    allowImportsFrom: [
      '@utils',
      '@ruleValues',
      '@entities',
      '@events',
      '@game',
      '@queries',
      '@legality',
    ],
    dir: 'domain/procedures',
    identifier: '@procedures',
    // Deterministic game-effect event generators from game state.
  },
  {
    alias: '@legality',
    allowImportsFrom: [
      '@utils',
      '@ruleValues',
      '@entities',
      '@events',
      '@game',
      '@factories',
      '@queries',
    ],
    dir: 'domain/legality',
    identifier: '@legality',
    // Legal option enumeration and movement rule predicates.
  },
  {
    alias: '@validation',
    allowImportsFrom: [
      '@utils',
      '@ruleValues',
      '@entities',
      '@events',
      '@queries',
      '@game',
      '@factories',
      '@expected',
      '@legality',
    ],
    dir: 'domain/validation',
    identifier: '@validation',
    // Pure validation; always returns boolean, never throws.
  },
  {
    alias: '@transforms',
    allowImportsFrom: [
      '@utils',
      '@ruleValues',
      '@entities',
      '@events',
      '@game',
      '@queries',
      '@factories',
    ],
    dir: 'domain/transforms',
    identifier: '@transforms',
    // State transition functions for applying events to game state.
  },
  {
    alias: '@application',
    allowImportsFrom: [
      '@utils',
      '@ruleValues',
      '@entities',
      '@events',
      '@game',
      '@queries',
      '@factories',
      '@expected',
      '@procedures',
      '@transforms',
      '@validation',
    ],
    dir: 'application',
    identifier: '@application',
    // Application orchestration; composes domain engines, no rule logic.
  },
  {
    alias: '@sampleValues',
    allowTypeImportsFrom: ['@entities'],
    dir: 'domain/sampleValues',
    identifier: '@sampleValues',
    // Database surrogate for development and testing.
  },
  {
    alias: '@testing',
    allowImportsFrom: [
      '@entities',
      '@queries',
      '@expected',
      '@legality',
      '@ruleValues',
      '@events',
      '@utils',
      '@validation',
      '@game',
      '@sampleValues',
      '@transforms',
      '@factories',
      '@procedures',
    ],
    dir: 'domain/testing',
    identifier: '@testing',
    // May depend on all layers. May only be used in tests.
  },
];
