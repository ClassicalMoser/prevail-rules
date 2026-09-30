# Testing Checklist

Systematic unit test coverage following round order. Focus on procedures and expected events.

**Coverage targets (suite):** **80%+** statements, **70%+** branches — met on recent full runs; remaining work is **depth** on thin modules (see [Remaining coverage depth](#remaining-coverage-depth)).

**How we track (this doc):**

- **[x]** = colocated `*.test.ts` exists for that module (deliverable done).
- **Coverage %** = run **`pnpm test:coverage`** and use the report for **what to deepen next**; percentages in this file are not auto-synced.

**Last reconciled:** 2026-08-07 — checkbox inventory still useful as a module map; after the board-size / visibility refactor, prefer the coverage report over this file for “what’s missing.” Paths below may lag renames.

**Strategy:** Unit tests, then integration tests. Depth work targets routers and branch-thin modules. How to write a test is [`STYLE.md`](../../STYLE.md). This file is the coverage inventory.

---

## Testing Philosophy

See [`STYLE.md`](../../STYLE.md). Titles, commentary, shared fixtures, and writing state through transforms are defined there. Do not add a second set of rules here.

### Commentary rollout (all tests)

A pass added a block comment on the first `describe` where it was missing. When touching a file, follow `STYLE.md` for the title and for setup notes.

- [x] `src/domain/procedures/`
- [x] `src/domain/transforms/stateTransitions/`
- [x] `src/domain/queries/expectedEvent/`
- [x] `src/domain/queries/` (remainder)
- [x] `src/domain/transforms/pureTransforms/`
- [x] `src/domain/validation/`
- [x] `src/domain/testing/`

**Last batch completed:** 2026-03-24 — baseline `describe` headers via [`scripts/inject-test-describe-comments.mjs`](../../scripts/inject-test-describe-comments.mjs) (path-aware wording) plus manual procedure commentary.

---

## Phase 0: Foundation (Quick Wins)

### Test Helpers to Extract

- [x] Extract `createRoutState()` helper from `applyResolveRoutEvent.test.ts` → `phaseStateHelpers.ts` ✅
- [x] Extract `createReverseState()` helper → `phaseStateHelpers.ts` ✅
- [x] Extract `createRallyResolutionState()` helper → `phaseStateHelpers.ts` ✅
- [x] Export helpers from `@testing/index.ts` ✅

**Note:** These are test helpers (convenience wrappers), NOT initializers (production code).

### Complete Partial Coverage

- [x] `getExpectedRetreatEvent` ✅ (`composable/getExpectedRetreatEvent.test.ts`) — deepen branches if coverage regresses
- [x] `getExpectedReverseEvent` ✅ (`composable/getExpectedReverseEvent.test.ts`)
- [x] `getExpectedRoutEvent` ✅ (`composable/getExpectedRoutEvent.test.ts`)

---

## Phase 1: Play Cards

### Procedures

- [x] `generateCompletePlayCardsPhaseEvent` ✅
- [x] `generateResolveInitiativeEvent` ✅
- [x] `generateRevealCardsEvent` ✅ (`cards/generateRevealCardsEvent.test.ts`)

### Expected Events

- [x] `getExpectedPlayCardsPhaseEvent` ✅
- [x] `getExpectedEvent` router ✅ (`expectedEvent/getExpectedEvent.test.ts`)

**Status:** Complete ✅

---

## Phase 2: Move Commanders

### Procedures

- [x] `generateCompleteMoveCommandersPhaseEvent` ✅

### Expected Events

- [x] `getExpectedMoveCommandersPhaseEvent` ✅

**Status:** Complete ✅

---

## Phase 3: Issue Commands

### Procedures

- [x] `generateCompleteIssueCommandsPhaseEvent` ✅
- [x] `generateCompleteUnitMovementEvent` ✅ (`movement/generateCompleteUnitMovementEvent.test.ts`)
- [x] `generateCompleteRangedAttackCommandEvent` ✅ (`resolveAttack/generateCompleteRangedAttackCommandEvent.test.ts`)
- [x] `generateStartEngagementEvent` ✅ (`movement/generateStartEngagementEvent.test.ts`)

### Expected Events

- [x] `getExpectedIssueCommandsPhaseEvent` ✅ (`byPhase/getExpectedIssueCommandsPhaseEvent.test.ts`)
- [x] `getExpectedStartCommandResolutionEvent` ✅ (`composable/getExpectedStartCommandResolutionEvent.test.ts`)

**Status:** Complete ✅ (still room for branch coverage on engagement-related generators — see [Remaining coverage depth](#remaining-coverage-depth))

---

## Phase 4: Resolve Melee

### Procedures

- [x] `generateResolveMeleeEvent` ✅ (`resolveAttack/generateResolveMeleeEvent.test.ts`)
- [x] `generateResolveFlankEngagementEvent` ✅ (`movement/generateResolveFlankEngagementEvent.test.ts`)
- [x] `generateResolveEngageRetreatOptionEvent` ✅ (`movement/generateResolveEngageRetreatOptionEvent.test.ts`)
- [x] `generateCompleteMeleeResolutionEvent` ✅ (`resolveAttack/generateCompleteMeleeResolutionEvent.test.ts`)
- [x] `generateCompleteResolveMeleePhaseEvent` ✅ (`completePhase/generateCompleteResolveMeleePhaseEvent.test.ts`)

### Expected Events

- [x] `getExpectedResolveMeleePhaseEvent` ✅ (`byPhase/getExpectedResolveMeleePhaseEvent.test.ts`)
- [x] `getExpectedEngagementEvent` ✅ (`composable/getExpectedEngagementEvent.test.ts`)
- [x] `getExpectedAttackApplyEvent` ✅ (`composable/getExpectedAttackApplyEvent.test.ts`)
- [x] `getExpectedRetreatEvent` ✅ (see Phase 0)
- [x] `getExpectedReverseEvent` ✅ (see Phase 0)
- [x] `getExpectedRoutEvent` ✅ (see Phase 0)

**Status:** Colocated tests complete ✅ — prioritize branch/edge coverage where coverage report is thin (melee/ranged resolve, engagements)

---

## Phase 5: Cleanup

### Procedures

- [x] `generateDiscardPlayedCardsEvent` ✅ (`cards/generateDiscardPlayedCardsEvent.test.ts`)
- [x] `generateResolveRallyEvent` ✅ (`cards/generateResolveRallyEvent.test.ts`)
- [x] `generateCompleteCleanupPhaseEvent` ✅ (`completePhase/generateCompleteCleanupPhaseEvent.test.ts`)

### Expected Events

- [x] `getExpectedCleanupPhaseEvent` ✅ (`byPhase/getExpectedCleanupPhaseEvent.test.ts`)
- [x] `getExpectedRallyResolutionEvent` ✅ (`composable/getExpectedRallyResolutionEvent.test.ts`)

**Status:** Colocated tests complete ✅ — rally still has room for branch coverage

---

## Cross-Phase: Attack Resolution

### Procedures

- [x] `generateResolveRangedAttackEvent` ✅ (`resolveAttack/generateResolveRangedAttackEvent.test.ts`)
- [x] `generateResolveRetreatEvent` ✅ (`defenseResult/generateResolveRetreatEvent.test.ts`)
- [x] `generateResolveReverseEvent` ✅ (`defenseResult/generateResolveReverseEvent.test.ts`)
- [x] `generateResolveRoutEvent` ✅ (`defenseResult/generateResolveRoutEvent.test.ts`)
- [x] `generateCompleteAttackApplyEvent` ✅ (`resolveAttack/generateCompleteAttackApplyEvent.test.ts`)
- [x] `generateTriggerRoutFromRetreatEvent` ✅ (`defenseResult/generateTriggerRoutFromRetreatEvent.test.ts`)

**Status:** Colocated tests complete ✅ — **defense result** procedures (especially rout) still need scenario coverage for high statement/branch %

---

## Critical Integration Points

### Routers (High Priority)

- [x] `procedureRegistry.ts` — `procedureRegistry.test.ts` exercises **every `gameEffects` entry** with a valid state plus the `default` throw path — **still deepen** if new effect types are added (factory map is `satisfies Record<GameEffectType, …>` so TS enforces updates)
- [x] `getExpectedEvent.ts` — `expectedEvent/getExpectedEvent.test.ts`
- [x] `validatePlayerChoice.ts` — `playerChoice/validatePlayerChoice.test.ts`

**Note:** These are integration points but can be unit tested with mocks/stubs.

---

## Testing Patterns

### For Procedures

```typescript
describe('generateXEvent', () => {
  // ✅ GOOD: Use existing helpers from @testing
  function createTestState(): GameState {
    const state = createEmptyGameState('standard');
    const phaseState = createXPhaseState(state);
    return updatePhaseState(state, phaseState);
  }

  // ❌ BAD: Don't inline helpers - extract to @testing if reused
  // function createTestState() {
  //   return {
  //     ...createEmptyGameState('standard'),
  //     currentRoundState: {
  //       ...createEmptyGameState('standard').currentRoundState,
  //       currentPhaseState: { /* verbose manual construction */ }
  //     }
  //   };
  // }

  it('emits a completeXPhase game effect', () => {
    const state = createTestState();
    const event = generateXEvent(state);
    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('x');
  });

  it('emits the same event for independently built equivalent states', () => {
    // Test determinism if applicable
  });
});
```

### For Expected Events

```typescript
describe('getExpectedXEvent', () => {
  // ✅ GOOD: Use existing helpers + pure transforms
  function createTestState(): GameState {
    const state = createEmptyGameState('standard');
    const unit = createTestUnit('white', { attack: 2 });
    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, {
        unit,
        placement: { coordinate: 'E-5', facing: 'north' },
      }),
    };
    return updatePhaseState(stateWithUnit, createXPhaseState(stateWithUnit));
  }

  it('expects effect x when the phase is waiting on that resolution', () => {
    const state = createTestState();
    const result = getExpectedXEvent(state);
    const parsed = expectedGameEffectSchema.safeParse(result);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.effectType).toBe('x');
  });
});
```

---

## Progress Tracking

**Historical baseline (when this doc was written):** ~58% statements, ~49% branches.

**Targets:** 80%+ statements, 70%+ branches — **met** on recent full-domain runs; use coverage HTML/lcov for file-level gaps.

**Phases (checkboxes):** Phases 0–5 + cross-phase procedure list are **complete** for “has colocated unit tests.”

**Next focus (by impact):**

1. **Application layer coverage** — `processEvent`, `handleNewRound`, `updateGameState`, `gameRunner` have little/no colocated coverage; ordering bugs (persist-vs-apply, subscribers, round transitions) live here.
2. **Wire `startNewGame` to `createInitialGameState`** — init already seeds reserved units and deals army `commandCards` into hands; `startNewGame` still uses empty `placeholderArmy()` + `createEmptyGameState`.
3. **`defenseResult` / sequencing / engagement generators** — raise branch % where the coverage report is thin.
4. **`procedureRegistry.ts`** — when adding a `gameEffects` entry, add a factory in `testing/procedureRegistryStateFactories.ts` (exported from `@testing`).

**Known incomplete (not test gaps):** terrain entities are modelled (`terrainType` / `elevation` / `waterCover`) but unused by combat/movement; front-engagement retreat with zero legal destinations still lacks a movement-context `triggerRoutFromRetreat` path (speed/`canRetreat` usually prevents that branch).

---

## Remaining coverage depth

_Use the latest **`pnpm test:coverage`** report as source of truth for numbers; the table below is guidance from a recent run and will drift._

| Module                                                                                       | Notes                                                                 |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `procedures/procedureRegistry.ts`                                                            | Switch + `default` covered; add a factory when new effect types ship. |
| `procedures/defenseResult/generateResolveRoutEvent.ts`                                       | Low statement %; many branches.                                       |
| `procedures/defenseResult/generateResolveRetreatEvent.ts` / `generateResolveReverseEvent.ts` | Mid statement %; extend throw/edge paths.                             |
| `procedures/movement/generateStartEngagementEvent.ts`                                        | Several uncovered lines; branch % often ~50%.                         |
| `queries/sequencing/getCommandResolutionState.ts`                                            | e.g. line ~103 uncovered in one report.                               |

---

## Notes

How to write a test is [`STYLE.md`](../../STYLE.md). This checklist is ordered by the round, because that is how the missing coverage is grouped. Unit tests come before integration tests: they are faster to debug.
