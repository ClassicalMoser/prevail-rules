import type { BoundaryConfig } from 'eslint-plugin-import-boundaries';

/**
 * Boundary definitions for the hexagonal architecture.
 * Each boundary defines:
 * - dir: Relative directory path from rootDir
 * - alias: Import alias (e.g., '@entities')
 * - allowImportsFrom: Boundaries that can be imported from (value imports)
 * - allowTypeImportsFrom: Boundaries that can be imported as types (type-only imports)
 *
 * Listed in dependency order, and each allow list in the same order: a
 * boundary imports only from those above it, so the list reads as the DAG.
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
    allowTypeImportsFrom: ['@utils'],
    dir: 'domain/ruleValues',
    identifier: '@ruleValues',
    // Rule constants. Nothing from the domain: @entities imports these values.
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
    alias: '@sampleValues',
    allowTypeImportsFrom: ['@entities'],
    dir: 'domain/sampleValues',
    identifier: '@sampleValues',
    // Stand-in catalogs. Type imports only from @entities — same posture as
    // @ruleValues. Production never imports this layer; @testing helpers and
    // specs may (test files do not enforce layer edges). It has no other
    // outgoing edge, so it cannot put a layer in a cycle.
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
    alias: '@expected',
    allowImportsFrom: [
      '@utils',
      '@ruleValues',
      '@entities',
      '@events',
      '@game',
      '@factories',
      '@queries',
      // Some sequence logic has to search for empty legality results to skip a step.
      '@legality',
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
      '@factories',
      '@queries',
      '@legality',
    ],
    dir: 'domain/procedures',
    identifier: '@procedures',
    // Game-effect event generators from game state; some draw at random.
  },
  {
    alias: '@validation',
    allowImportsFrom: [
      '@utils',
      '@ruleValues',
      '@entities',
      '@events',
      '@game',
      '@factories',
      '@queries',
      '@expected',
      '@legality',
    ],
    dir: 'domain/validation',
    identifier: '@validation',
    // Pure validation; answers with a ValidationResult and never throws.
  },
  {
    alias: '@transforms',
    allowImportsFrom: [
      '@utils',
      '@ruleValues',
      '@entities',
      '@events',
      '@game',
      '@factories',
      '@queries',
      // Apply may re-filter remaining actors after a command completes.
      '@legality',
    ],
    dir: 'domain/transforms',
    identifier: '@transforms',
    // State transition functions for applying events to game state.
  },
  {
    alias: '@testing',
    allowImportsFrom: [
      '@utils',
      '@ruleValues',
      '@entities',
      '@events',
      '@game',
      '@sampleValues',
      '@factories',
      '@queries',
      '@legality',
      '@expected',
      '@procedures',
      '@validation',
      '@transforms',
    ],
    dir: 'domain/testing',
    identifier: '@testing',
    // May depend on all layers. May only be used in tests.
  },
  {
    alias: '@application',
    allowImportsFrom: [
      '@utils',
      '@ruleValues',
      '@entities',
      '@events',
      '@game',
      '@factories',
      '@queries',
      '@expected',
      '@procedures',
      '@validation',
      '@transforms',
    ],
    dir: 'application',
    identifier: '@application',
    // Application orchestration; composes domain engines, no rule logic.
  },
  {
    alias: '@bot',
    allowImportsFrom: [
      '@utils',
      '@ruleValues',
      '@entities',
      '@events',
      '@game',
      '@factories',
      '@queries',
      '@legality',
      '@expected',
      // The harness that plays bots against each other runs the engines
      // itself: procedures for the game's effects, transforms to apply events
      // and to project each seat's view. The choosing algorithm uses
      // transforms only to imagine a board, never to change the game.
      '@procedures',
      '@validation',
      '@transforms',
    ],
    dir: 'bot',
    identifier: '@bot',
    // A player that chooses from what the rules offer, and a harness to watch
    // it play. Nothing imports it.
  },
];
