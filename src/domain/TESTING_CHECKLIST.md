# Testing Checklist

Systematic unit test coverage following round order. Focus on procedures and expected events.

**Coverage Target:** Increase from 58% to 80%+ statement coverage

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

**Remember:** If you're copying code between tests or writing a helper function inside a test file, that's a signal to extract it to `@testing`.

---

## Phase 0: Foundation (Quick Wins)

### Test Helpers to Extract
- [x] Extract `createRoutState()` helper from `applyResolveRoutEvent.test.ts` → `phaseStateHelpers.ts` ✅
- [x] Extract `createReverseState()` helper → `phaseStateHelpers.ts` ✅
- [x] Extract `createRallyResolutionState()` helper → `phaseStateHelpers.ts` ✅
- [x] Export helpers from `@testing/index.ts` ✅

**Note:** These are test helpers (convenience wrappers), NOT initializers (production code).

### Complete Partial Coverage
- [ ] `getExpectedRetreatEvent` - Complete from 40% → 100%
- [ ] `getExpectedReverseEvent` - Complete from 60% → 100%
- [ ] `getExpectedRoutEvent` - Complete from 42.85% → 100%

---

## Phase 1: Play Cards

### Procedures
- [x] `generateCompletePlayCardsPhaseEvent` ✅
- [x] `generateResolveInitiativeEvent` ✅
- [ ] `generateRevealCardsEvent` - 0% coverage

### Expected Events
- [x] `getExpectedPlayCardsPhaseEvent` ✅
- [ ] `getExpectedEvent` router - 0% coverage (test main entry point)

**Status:** Mostly complete, add router test

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
- [ ] `generateCompleteUnitMovementEvent` - 0% coverage
- [ ] `generateCompleteRangedAttackCommandEvent` - 0% coverage
- [ ] `generateStartEngagementEvent` - 0% coverage

### Expected Events
- [ ] `getExpectedIssueCommandsPhaseEvent` - 0% coverage
- [ ] `getExpectedStartCommandResolutionEvent` - 0% coverage

**Status:** Needs work - focus here next

---

## Phase 4: Resolve Melee

### Procedures
- [ ] `generateResolveMeleeEvent` - 0% coverage
- [ ] `generateResolveFlankEngagementEvent` - 0% coverage
- [ ] `generateResolveEngageRetreatOptionEvent` - 0% coverage
- [ ] `generateCompleteMeleeResolutionEvent` - 0% coverage
- [ ] `generateCompleteResolveMeleePhaseEvent` - 0% coverage

### Expected Events
- [ ] `getExpectedResolveMeleePhaseEvent` - 0% coverage
- [ ] `getExpectedEngagementEvent` - 0% coverage
- [x] `getExpectedAttackApplyEvent` ✅ (100% coverage)
- [ ] `getExpectedRetreatEvent` - 40% coverage (complete in Phase 0)
- [ ] `getExpectedReverseEvent` - 60% coverage (complete in Phase 0)
- [ ] `getExpectedRoutEvent` - 42.85% coverage (complete in Phase 0)

**Status:** Major gaps - largest testing opportunity

---

## Phase 5: Cleanup

### Procedures
- [ ] `generateDiscardPlayedCardsEvent` - 0% coverage
- [ ] `generateResolveRallyEvent` - 0% coverage
- [ ] `generateResolveUnitsBrokenEvent` - 0% coverage
- [ ] `generateCompleteCleanupPhaseEvent` - 0% coverage

### Expected Events
- [ ] `getExpectedCleanupPhaseEvent` - 0% coverage
- [ ] `getExpectedRallyResolutionEvent` - 0% coverage

**Status:** Needs work

---

## Cross-Phase: Attack Resolution

### Procedures
- [ ] `generateResolveRangedAttackEvent` - 0% coverage
- [ ] `generateResolveRetreatEvent` - 0% coverage
- [ ] `generateResolveReverseEvent` - 0% coverage
- [ ] `generateResolveRoutEvent` - 0% coverage
- [ ] `generateCompleteAttackApplyEvent` - 0% coverage
- [ ] `generateTriggerRoutFromRetreatEvent` - 0% coverage

**Status:** Used across multiple phases - test when relevant

---

## Critical Integration Points

### Routers (High Priority)
- [ ] `procedureRegistry.ts` - 0% coverage (test registry routing)
- [ ] `getExpectedEvent.ts` - 0% coverage (test main router)
- [ ] `validateEvent.ts` - 0% coverage (test validation router)

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

**Current Coverage:** 58.15% statements, 48.67% branches

**Target Coverage:** 80%+ statements, 70%+ branches

**Focus Areas:**
1. ✅ Phase 0: Foundation helpers
2. ⏳ Phase 3: Issue Commands (next priority)
3. ⏳ Phase 4: Resolve Melee (largest gap)
4. ⏳ Phase 5: Cleanup
5. ⏳ Routers: Critical integration points

---

## Notes

- **Extract Helpers, Don't Inline:** When writing tests, if you find yourself writing verbose/repetitive code or creating inline helper functions, extract them to `@testing`. This improves the system rather than bypassing it.
- **Test Helpers vs Initializers:** Test helpers use `@sampleValues` and convenience defaults. Initializers are production code in `@transforms/initializations`.
- **Use Pure Transforms:** Build state using `addUnitToBoard`, `updatePhaseState`, etc. Don't manually construct state.
- **Round Order:** Follow game flow - easier to reason about and catch integration issues.
- **Unit Tests First:** Integration tests can come later. Unit tests are faster and easier to debug.
