# Procedures (game-effect generation)

Each `generate*` module turns **current `GameState` + rules** into a **concrete `GameEffectEvent`** (payload). Apply handlers then trust that payload ([`applyEffects/README.md`](../transforms/stateTransitions/applyEffects/README.md)).

Folder names mirror **`applyEffects/`** and **`events/gameEffects/`** so the same feature area is easy to find across event types → generate → apply.

- **Replay**: Nondeterminism (e.g. dice, card choice) must live **on the event**, not only in procedure locals.
- **Queries**: Prefer `@queries` / `getExpected*` (and shared helpers) over duplicating board scans or phase walks inline.

## Entry points

- **`procedureRegistry.ts`** — `generateEventFromProcedure(state, effectType)` dispatches to the right `generate*` function. This is the usual integration surface.
- **`index.ts`** — Re-exports every `generate*` from topic subfolders plus `generateEventFromProcedure` from the registry. Prefer this barrel or **`generateEventFromProcedure`** over deep imports from outside this package.

## Domain helpers (outside this folder)

- **`modifiersFromCompletedCommitment`** — in **`@queries`** (`queries/modifiersFromCompletedCommitment.ts`). Used by `resolveAttack` and `movement` generators when passing optional card modifiers into stat queries.

## Folder layout

| Folder                               | Generators                                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| [`cards/`](./cards/)                 | discard / reveal played cards, initiative, rally, units broken                                               |
| [`completePhase/`](./completePhase/) | phase-completion effects (cleanup, issue commands, move commanders, play cards, resolve melee **phase**)     |
| [`defenseResult/`](./defenseResult/) | retreat, reverse, rout, trigger rout from retreat                                                            |
| [`movement/`](./movement/)           | complete unit movement, engagements (start, flank, engage-retreat option)                                    |
| [`resolveAttack/`](./resolveAttack/) | resolve melee / ranged, complete attack-apply, complete melee **resolution**, complete ranged attack command |

Each subfolder has a small `index.ts` barrel. Co-locate each `generate*` with its `*.test.ts`.

## Tests and coverage

- **Plan / progress:** [`../TESTING_CHECKLIST.md`](../TESTING_CHECKLIST.md) — phase checkboxes + remaining coverage depth.
- Every **`generate*.ts`** has a colocated **`generate*.test.ts`** (happy paths + important throws where applicable).
- **`procedureRegistry.test.ts`** — smoke dispatch for state-independent effect types via `generateEventFromProcedure`.
- Same Vitest coverage rules as the rest of `src/domain` ([`vitest.config.ts`](../../../vitest.config.ts) `include` / `exclude`).

## Related queries

- **`getMeleeResolutionReadyForAttackCalculation`** ([`@queries` sequencing](../queries/sequencing/getCommandResolutionState.ts)) — narrowing helper used by `generateResolveMeleeEvent` (commitments resolved, no attack-apply yet), aligned with `getRangedAttackResolutionState` style.
