# Testing Checklist

**Refactor order (before chasing coverage % on procedures):** see [`.cursor/rules/domain-refactor-order.mdc`](../../.cursor/rules/domain-refactor-order.mdc) — dedupe → trust-first → delegate to `@queries` → then deepen coverage.

Systematic unit test coverage following round order. Focus on procedures and expected events.

**Coverage targets (suite):** **80%+** statements, **70%+** branches — met on recent full runs; remaining work is **depth** on thin modules (see [Remaining coverage depth](#remaining-coverage-depth)).

**How we track (this doc):**

- **[x]** = colocated `*.test.ts` exists for that module (deliverable done).
- **Coverage %** = run **`npm run test:coverage`** and use the report for **what to deepen next**; percentages in this file are not auto-synced.

**Last reconciled:** 2026-03-17 — checkboxes matched to `src/domain` test files.

**Strategy:** Unit tests > Integration tests. Use test helpers + pure transforms. Follow round order.

---

## Testing Philosophy

**When writing new tests:**

1. **Extract helpers, don't inline:** If you find yourself writing verbose or repetitive code, or creating inline helper functions, extract them into reusable test helpers in `@testing`.

2. **Improve the system, don't bypass it:** Adding test helpers improves the testing infrastructure for everyone. Inlining helpers or writing verbose code bypasses the system and makes future tests harder.

3. **Pattern to follow:**
   - First test: Write inline helper if needed
   - Second test: Extract to shared helper
   - Use existing helpers: Check `@testing` first before creating new ones

4. **Test helpers vs initializers:**
   - **Test helpers** (`@testing`): Convenience wrappers using `@sampleValues`, sensible defaults, test-specific shortcuts
   - **Initializers** (`@transforms/initializations`): Production domain functions, no test dependencies, explicit parameters

5. **Readable tests (commentary):**
   - Restate the **domain contract** the file proves (what is invariant vs what varies across cases).
   - For spatial or facing logic, add a **minimal geometry or state legend** when coordinates or defaults matter; tie expected values to named defaults when factories hide them.
   - Prefer **precise `it` descriptions** (starting state → action → outcome) over vague names; use short comments where the code alone does not carry the “why.”

   Reference example: [`src/domain/procedures/movement/generateResolveFlankEngagementEvent.test.ts`](procedures/movement/generateResolveFlankEngagementEvent.test.ts).

**Remember:** If you're copying code between tests or writing a helper function inside a test file, that's a signal to extract it to `@testing`.

### Commentary rollout (all tests)

Per [§5](#testing-philosophy): proportionate **describe** / **it** commentary and setup notes across colocated `*.test.ts`. Check when every file in the folder has been audited.

- [ ] `src/domain/procedures/`
- [ ] `src/domain/transforms/stateTransitions/`
- [ ] `src/domain/queries/expectedEvent/`
- [ ] `src/domain/queries/` (excluding `expectedEvent/`, covered above)
- [ ] `src/domain/transforms/pureTransforms/`
- [ ] `src/domain/validation/`
- [ ] `src/domain/testing/`

**Last batch completed:** (update when merging rollout PRs)

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
- [x] `generateResolveUnitsBrokenEvent` ✅ (`cards/generateResolveUnitsBrokenEvent.test.ts`)
- [x] `generateCompleteCleanupPhaseEvent` ✅ (`completePhase/generateCompleteCleanupPhaseEvent.test.ts`)

### Expected Events

- [x] `getExpectedCleanupPhaseEvent` ✅ (`byPhase/getExpectedCleanupPhaseEvent.test.ts`)
- [x] `getExpectedRallyResolutionEvent` ✅ (`composable/getExpectedRallyResolutionEvent.test.ts`)

**Status:** Colocated tests complete ✅ — `generateResolveUnitsBrokenEvent` / rally still have room for branch coverage

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
- [ ] `validateEvent.ts` — **no colocated test** yet (`validation/validateEvent.ts`)

**Note:** These are integration points but can be unit tested with mocks/stubs.

---

## Testing Patterns

### For Procedures

```typescript
describe('generateXEvent', () => {
  // ✅ GOOD: Use existing helpers from @testing
  function createTestState(): GameState<StandardBoard> {
    const state = createEmptyGameState();
    const phaseState = createXPhaseState(state);
    return updatePhaseState(state, phaseState);
  }

  // ❌ BAD: Don't inline helpers - extract to @testing if reused
  // function createTestState() {
  //   return {
  //     ...createEmptyGameState(),
  //     currentRoundState: {
  //       ...createEmptyGameState().currentRoundState,
  //       currentPhaseState: { /* verbose manual construction */ }
  //     }
  //   };
  // }

  it('should return correct event type', () => {
    const state = createTestState();
    const event = generateXEvent(state);
    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('x');
  });

  it('should be deterministic', () => {
    // Test determinism if applicable
  });
});
```

### For Expected Events

```typescript
describe('getExpectedXEvent', () => {
  // ✅ GOOD: Use existing helpers + pure transforms
  function createTestState(): GameState<StandardBoard> {
    const state = createEmptyGameState();
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

  it('should return expected event info', () => {
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

1. **`validation/validateEvent.ts`** — add router / representative validation tests.
2. **`defenseResult/generateResolveRoutEvent.ts`** (and siblings) — more scenarios for branches.
3. **Sequencing queries** — e.g. `getCommandResolutionState.ts` uncovered lines/branches.
4. **Engagement / units-broken / rally** generators — raise branch % where report shows 50%.
5. **`procedureRegistry.ts`** — when adding a `gameEffects` entry, add a factory in `testing/procedureRegistryStateFactories.ts` (exported from `@testing`).

---

## Remaining coverage depth

_Use the latest **`npm run test:coverage`** report as source of truth for numbers; the table below is guidance from a recent run and will drift._

| Module                                                                                       | Notes                                                                 |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `procedures/procedureRegistry.ts`                                                            | Switch + `default` covered; add a factory when new effect types ship. |
| `validation/validateEvent.ts`                                                                | No dedicated test file yet.                                           |
| `procedures/defenseResult/generateResolveRoutEvent.ts`                                       | Low statement %; many branches.                                       |
| `procedures/defenseResult/generateResolveRetreatEvent.ts` / `generateResolveReverseEvent.ts` | Mid statement %; extend throw/edge paths.                             |
| `procedures/movement/generateStartEngagementEvent.ts`                                        | Several uncovered lines; branch % often ~50%.                         |
| `procedures/cards/generateResolveUnitsBrokenEvent.ts`                                        | Statements/branches below neighbors.                                  |
| `queries/sequencing/getCommandResolutionState.ts`                                            | e.g. line ~103 uncovered in one report.                               |

---

## Notes

- **Extract Helpers, Don't Inline:** When writing tests, if you find yourself writing verbose/repetitive code or creating inline helper functions, extract them to `@testing`. This improves the system rather than bypassing it.
- **Test Helpers vs Initializers:** Test helpers use `@sampleValues` and convenience defaults. Initializers are production code in `@transforms/initializations`.
- **Use Pure Transforms:** Build state using `addUnitToBoard`, `updatePhaseState`, etc. Don't manually construct state.
- **Round Order:** Follow game flow - easier to reason about and catch integration issues.
- **Unit Tests First:** Integration tests can come later. Unit tests are faster and easier to debug.
