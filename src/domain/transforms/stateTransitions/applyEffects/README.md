# applyEffects conventions

Handlers in this folder apply **game effect events** to `GameState`. They are routed by [`applyGameEffectEvent`](../applyGameEffectEvent.ts).

**Event shapes** live under [`events/gameEffects/`](../../../events/gameEffects/): each file documents _why_ fields exist (procedure-derived snapshots, subtree tags, etc.). Start from [`gameEffect.ts`](../../../events/gameEffects/gameEffect.ts) for the full discriminated union.

## Folder layout

Each subfolder has a small `index.ts` barrel; the **only** supported entry for the rest of the domain is the root [`index.ts`](./index.ts) (what `applyGameEffectEvent` imports). Avoid deep imports from outside this package.

| Folder                               | Responsibility                                                                                       |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| [`cards/`](./cards/)                 | Discard / reveal played cards, resolve initiative, rally, units broken                               |
| [`completePhase/`](./completePhase/) | Phase-completion effects (cleanup, issue commands, move commanders, play cards, resolve melee phase) |
| [`defenseResult/`](./defenseResult/) | Retreat, reverse, rout, trigger rout from retreat                                                    |
| [`movement/`](./movement/)           | Complete unit movement, start engagement, flank engagement, engage-retreat option                    |
| [`resolveAttack/`](./resolveAttack/) | Resolve melee / ranged attack, complete attack-apply and related command-resolution completes        |

Co-locate each handler with its `*.test.ts` in the same folder.

## Trust model

- **Procedure + log**: Legality and sequencing are enforced when generating events (`src/domain/procedures/`). Replayed events are trusted.
- **Apply** maps **event payload + current state** to the next state. Avoid duplicating rule checks that the procedure already enforced.

## Throws

- **Allowed**: Throws from **narrowing helpers** (`getPlayCardsPhaseState`, `getIssueCommandsPhaseState`, `getCurrentPhaseState`, `getAttackApplyStateFromRangedAttack`, `getAttackApplyStateFromMelee`, `getFrontEngagementStateFromMovement`, `getFlankEngagementStateFromMovement`, `getRallyResolutionStateAwaitingBurn`, `getRallyResolutionStateAwaitingUnitsBroken`, etc.). These are type guards, not business validation.
- **Avoid**: Defensive throws that only restate rules (“wrong engagement type”, “already resolved”, “wrong phase”) unless they remain as narrowing until payloads replace phase branching.

## TypeScript

- **No** `as` or non-null `!` in apply handlers. If the type system leaves a value optional, fix via **event fields** or a **throwing query** that narrows.

## Code structure (handlers)

- Prefer **`updatePhaseState`**, **`updateRoundState`**, **`updateBoardState`**, **`updateCardState`**, **`updateCommandResolutionState`** (when replacing the active command resolution subtree), **`updateCurrentInitiative`**, **`updateCurrentRoundNumber`**, and other **pure transforms** over hand-rolled top-level or nested spreads.
- Prefer **`@queries`** shared with procedures over re-implementing lookups in apply.

## Events

- Non-trivial derivation (board scans, phase switches to pick subtrees) belongs in **`generate*`** and on the **event** (Zod + `AssertExact` next to the manual type), so apply stays mechanical and replay stays cheap.
- Examples: `StartEngagementEvent` / `ResolveFlankEngagementEvent.defenderWithPlacement`, legal-retreat `Set`s on resolve melee/ranged, `attackResolutionContext` on resolve reverse.

## Tests

- One `*.test.ts` per handler; use `as unknown as Event` **only in tests** for exhaustiveness branches.
