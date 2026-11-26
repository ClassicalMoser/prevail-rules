# Procedures (game-effect generation)

Each `generate*` module turns **current `GameState` + rules** into a **concrete `GameEffectEvent`** (payload). Apply handlers then trust that payload ([`applyEffects/README.md`](../transforms/stateTransitions/applyEffects/README.md)).

Folder names mirror **`applyEffects/`** and **`events/gameEffects/`** so the same feature area is easy to find across event types → generate → apply.

- **Replay**: Nondeterminism (e.g. dice, card choice) must live **on the event**, not only in procedure locals.
- **Queries**: Prefer `@queries` / `getExpected*` (and shared helpers) over duplicating board scans or phase walks inline.

## What a procedure reads

- A procedure reads the state only for what its event records: a measurement, a draw, the retreats a unit may make.
- An effect whose event carries nothing has a procedure that takes no state.
- A procedure does not validate the state. The expected engine decides which effect is owed, and the apply narrows the state through the queries it reads, which throw where the effect cannot land.
- A throw in a procedure is a narrowing (an empty played pile has no card to burn), not a check that the effect was owed.

## Entry points

- **`procedureRegistry.ts`** — `generateEventFromProcedure(state, effectType, random)` dispatches to the right `generate*` function. This is the usual integration surface. The `RandomSource` is passed through to the rally burn, the one procedure that draws.
- **`index.ts`** — Public package surface: `generateEventFromProcedure` and `generateStartEngagementEvent`. Topic subfolder barrels still re-export every `generate*` for the registry and colocated tests; prefer the package barrel or the registry over deep imports from outside this package. The only importer of `generateStartEngagementEvent` outside this package is a spec, `applyMoveUnitEvent.test.ts`; no production code crosses the boundary for it.

## Domain helpers (outside this folder)

- **`modifiersFromCompletedCommitment`** — in **`@queries`** (`queries/card/modifiersFromCompletedCommitment.ts`). Used by `resolveAttack` and `movement` generators when passing optional card modifiers into stat queries.

## Folder layout

| Folder                               | Generators                                                                                                                              |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| [`cards/`](./cards/)                 | discard / reveal played cards, initiative, rally, game over                                                                             |
| [`sequencing/`](./sequencing/)       | phase-completion effects (cleanup, issue commands, move commanders, play cards, resolve melee **phase**)                                |
| [`defenseResult/`](./defenseResult/) | retreat, reverse, rout, trigger rout from retreat                                                                                       |
| [`movement/`](./movement/)           | complete unit movement, engagements (start, flank, engage-retreat option)                                                               |
| [`resolveAttack/`](./resolveAttack/) | resolve melee / ranged, complete attack-apply, complete melee **resolution**, complete ranged attack and complete ranged attack command |

Each subfolder has a small `index.ts` barrel. Co-locate each `generate*` with its `*.test.ts`.

## Tests and coverage

- **How to write one:** [`STYLE.md`](../../../STYLE.md).
- Every **`generate*.ts`** has a colocated **`generate*.test.ts`** (happy paths + important throws where applicable).
- **`procedureRegistry.test.ts`** — dispatches every game effect type, each from a state built for it by `procedureRegistryStateFactories` in `@testing`, and checks the event is the effect asked for.
- Same Vitest coverage rules as the rest of `src/domain` ([`vitest.config.ts`](../../../vitest.config.ts) `include` / `exclude`).

## Related queries

- **`getMeleeResolutionReadyForAttackCalculation`** ([`@queries` sequencing](../queries/sequencing/meleeResolution/getMeleeResolutionReadyForAttackCalculation.ts)) — narrowing helper used by `generateResolveMeleeEvent` (commitments resolved, no attack-apply yet), aligned with `getRangedAttackResolutionState` style.
