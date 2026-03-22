# applyEffects conventions

Handlers under `src/domain/transforms/stateTransitions/applyEffects/` apply **game effect events** to `GameState`. They are routed by [`applyGameEffectEvent`](../src/domain/transforms/stateTransitions/applyGameEffectEvent.ts).

**Event shapes** live under [`src/domain/events/gameEffects/`](../src/domain/events/gameEffects/): each file documents _why_ fields exist (procedure-derived snapshots, subtree tags, etc.). Start from [`gameEffect.ts`](../src/domain/events/gameEffects/gameEffect.ts) for the full discriminated union.

## Trust model

- **Procedure + log**: Legality and sequencing are enforced when generating events (`src/domain/procedures/`). Replayed events are trusted.
- **Apply** maps **event payload + current state** to the next state. Avoid duplicating rule checks that the procedure already enforced.

## Throws

- **Allowed**: Throws from **narrowing helpers** (`getPlayCardsPhaseState`, `getIssueCommandsPhaseState`, `getCurrentPhaseState`, `getAttackApplyStateFromRangedAttack`, etc.). These are type guards, not business validation.
- **Avoid**: Defensive throws that only restate rules (“wrong engagement type”, “already resolved”, “wrong phase”) unless they remain as narrowing until payloads replace phase branching.

## TypeScript

- **No** `as` or non-null `!` in apply handlers. If the type system leaves a value optional, fix via **event fields** or a **throwing query** that narrows.

## Structure

- Prefer **`updatePhaseState`**, **`updateRoundState`**, and other **pure transforms** over hand-rolled `currentRoundState` spreads.
- Prefer **`@queries`** shared with procedures over re-implementing lookups in apply.

## Events

- Non-trivial derivation (board scans, phase switches to pick subtrees) belongs in **`generate*`** and on the **event** (Zod + `AssertExact` next to the manual type), so apply stays mechanical and replay stays cheap.
- Examples: `StartEngagementEvent` / `ResolveFlankEngagementEvent.defenderWithPlacement`, legal-retreat `Set`s on resolve melee/ranged, `attackResolutionContext` on resolve reverse.

## Tests

- One `*.test.ts` per handler; use `as unknown as Event` **only in tests** for exhaustiveness branches.
