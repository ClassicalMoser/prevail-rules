# Engine Architecture Audit: Single Responsibility Principle

**Date:** 2026-01-25  
**Purpose:** Identify SRP violations, misplaced responsibilities, and duplication across the four engines.

## Executive Summary

The four-engine architecture is sound, but several violations of Single Responsibility Principle exist:

1. **Apply transforms doing calculations** - Some apply functions perform query/calculation work that belongs in procedures
2. **Validation duplicating expected event logic** - Validation layer manually checks phase/step/player that `getExpectedEvent` already determines
3. **Expected event doing validation** - Some expected event functions contain defensive validation checks
4. **Procedures correctly isolated** - Procedures are well-designed and properly separated

## Worst Offenders

### 🔴 Critical: Procedures Not Specifying Complete Changes

**Location:** 
- `generateResolveMeleeEvent.ts` - Only includes attack result booleans
- `generateResolveRangedAttackEvent.ts` - Only includes attack result booleans
- `applyResolveMeleeEvent.ts` (line 100) - Calculates legal retreats
- `applyResolveRangedAttackEvent.ts` (line 71) - Calculates legal retreats

**Problem:**
```typescript
// Procedure generates event with minimal data
return {
  eventType: GAME_EFFECT_EVENT_TYPE,
  effectType: RESOLVE_MELEE_EFFECT_TYPE,
  location: meleeCoordinate,
  whiteUnitRouted: whiteUnitResult.unitRouted,
  blackUnitRouted: blackUnitResult.unitRouted,
  // ... just booleans, no details
};

// Apply function has to figure out the details
const legalRetreatOptions = getLegalRetreats(unit, state);
const finalPosition = legalRetreatOptions.size === 1 
  ? Array.from(legalRetreatOptions)[0] 
  : undefined;
// Then creates all the nested substep states
```

**SRP Violation:** Procedures are saying "make this change" but deferring the details to apply functions. Procedures should calculate ALL the details and include them in the event. Apply functions should only read from events and update state.

**What's Missing from Events:**
- Legal retreat options (calculation)
- Final position if auto-selectable (decision)
- Complete nested state structures (structure specification)

**Correct Approach:** 
- Procedures should calculate legal retreats, determine finalPosition, and specify complete state structures
- Events should include all necessary data: `legalRetreatOptions`, `finalPosition`, complete `AttackApplyState` structures
- Apply functions should simply read these values from the event and set them in state

**Good Examples (Procedures That Do It Right):**
- `generateResolveRetreatEvent` - Reads finalPosition from state, includes it in event
- `generateResolveReverseEvent` - Calculates new facing, includes complete `newUnitPlacement` in event
- `generateResolveRoutEvent` - Calculates penalty, includes it in event
- `generateStartEngagementEvent` - Determines engagement type, includes it in event

**Impact:** Critical - This violates the core principle that procedures specify complete changes and transforms are pure state updates.

**Comparison with Good Procedures:**

Good procedures like `generateResolveRetreatEvent`, `generateResolveReverseEvent`, and `generateResolveRoutEvent` correctly:
- Calculate all necessary values (penalty, new facing, final position)
- Include complete data in events (not just "make this change")
- Allow apply functions to be pure state updates

Bad procedures like `generateResolveMeleeEvent` and `generateResolveRangedAttackEvent`:
- Only specify "what happened" (routed/retreated/reversed booleans)
- Defer "how to represent it" to apply functions
- Force apply functions to calculate legal retreats, determine finalPosition, and create nested state structures

---

### 🔴 Critical: Validation Duplicating Expected Event Logic

**Location:**
- `isValidMoveCommanderEvent.ts` (lines 40-71)
- `isValidChooseCardEvent.ts` (lines 39-53)
- `isValidChooseRallyEvent.ts` (lines 40-71)
- All phase validation functions

**Problem:**
```typescript
// In isValidMoveCommanderEvent
if (currentPhaseState.phase !== 'moveCommanders') {
  return { result: false, errorReason: `Current phase is ${currentPhaseState.phase}, not moveCommanders` };
}
if (currentPhaseState.step === 'moveFirstCommander') {
  if (player !== firstPlayer) {
    return { result: false, errorReason: `Expected ${firstPlayer}...` };
  }
}
```

**SRP Violation:** Validation is manually checking phase/step/player that `getExpectedEvent` already determines. This creates two sources of truth for "what should happen next."

**Correct Approach:**
- Validation should primarily call `getExpectedEvent(state)` and check if the incoming event matches
- Additional validation can check event-specific constraints (e.g., "card is in hand", "move is legal")
- But phase/step/player matching should be delegated to expected event engine

**Impact:** High - Creates maintenance burden and potential inconsistencies. If sequencing logic changes, both places must be updated.

**Example of Better Pattern:**
```typescript
export function isValidMoveCommanderEvent(event, state) {
  const expected = getExpectedEvent(state);
  
  // Check if event type matches expected
  if (expected.actionType !== 'playerChoice' || 
      expected.choiceType !== 'moveCommander' ||
      expected.playerSource !== event.player) {
    return { result: false, errorReason: 'Event does not match expected event' };
  }
  
  // Additional validation: is the move legal?
  if (!isLegalCommanderMove(event.from, event.to, state)) {
    return { result: false, errorReason: 'Move is not legal' };
  }
  
  return { result: true };
}
```

---

### 🟡 Moderate: Expected Event Doing Validation

**Location:**
- `getExpectedEngagementEvent.ts` (lines 34-45)

**Problem:**
```typescript
// Defensive checks in getExpectedEngagementEvent
if (hasNoUnit(defendingUnitPresence)) {
  throw new Error('nothing to engage');
}
if (hasEngagedUnits(defendingUnitPresence)) {
  throw new Error('defending unit is already engaged');
}
if (isFriendlyUnit(defendingUnit, defendingPlayer)) {
  throw new Error('defending unit is friendly');
}
```

**SRP Violation:** Expected event engine should determine "what should happen next" based on current state, not validate that state is correct. These are validation concerns.

**Correct Approach:**
- Expected event should assume valid state and determine next step
- Validation layer should catch invalid states before calling expected event
- Or: Expected event can return a special "invalid state" result type instead of throwing

**Impact:** Moderate - Creates coupling between engines. Expected event shouldn't need to validate state correctness.

---

### 🟡 Moderate: Apply Functions Doing Complex Query Navigation

**Location:**
- `applyResolveRoutEvent.ts` (lines 50-53, 72-73)
- `applyResolveReverseEvent.ts` (lines 44-57)
- `applyCompleteAttackApplyEvent.ts` (lines 32, 44-54)

**Problem:**
```typescript
// In applyResolveRoutEvent
const attackApplyState = phaseState.phase === 'issueCommands'
  ? getAttackApplyStateFromRangedAttack(state)
  : getAttackApplyStateFromMelee(state, routedPlayer);
```

**SRP Violation:** Apply functions are navigating through complex state structures to find the right place to update. This is query logic, not transform logic.

**Assessment:** This is **borderline acceptable** because:
- The queries are simple navigation (finding nested state)
- The event doesn't contain enough context to avoid navigation
- But it does create coupling between apply functions and state structure

**Better Approach (if refactoring):**
- Events could include more context (e.g., `attackApplyStatePath` or `contextId`)
- Or: Pure transform helpers could encapsulate this navigation pattern

**Impact:** Low-Moderate - Not ideal but manageable. The queries are simple and the pattern is consistent.

---

## Sensible Overlaps

### ✅ Acceptable: Apply Functions Reading Event Data

**Pattern:** Apply functions read data from events and update state accordingly.

**Example:**
```typescript
// In applyResolveMeleeEvent
const whiteAttackResult: AttackResult = {
  unitRouted: event.whiteUnitRouted,
  unitRetreated: event.whiteUnitRetreated,
  unitReversed: event.whiteUnitReversed,
};
```

**Why Acceptable:** Events are the source of truth for what happened. Apply functions correctly read from events.

---

### ✅ Acceptable: Procedures Calculating Attack Values

**Pattern:** Procedures like `generateResolveMeleeEvent` calculate attack values, apply them, and return complete events.

**Example:**
```typescript
// In generateResolveMeleeEvent
const whiteAttackValue = getCurrentUnitStat(whiteUnit.unit, 'attack', state, whiteCommitmentModifiers);
const whiteSupportValue = getMeleeSupportValue(state.boardState, whiteUnit);
const totalWhiteAttackValue = whiteAttackValue + whiteSupportValue;
const blackUnitResult = applyAttackValue(state, totalWhiteAttackValue, blackUnit.unit);
```

**Why Acceptable:** Procedures are the correct place for deterministic calculations that produce events.

---

### ✅ Acceptable: Expected Event Determining Sequencing

**Pattern:** `getExpectedEvent` and its composable helpers determine what should happen next based on state.

**Why Acceptable:** This is the core responsibility of the expected event engine - it's the single source of truth for sequencing.

---

## Recommendations

### Priority 1: Make Procedures Specify Complete Changes

**Action:**
1. Modify `generateResolveMeleeEvent` to:
   - Calculate legal retreats for each unit that retreated
   - Determine finalPosition if only one option exists
   - Include complete `AttackApplyState` structures in the event (or at minimum, all the data needed to create them)
2. Modify `generateResolveRangedAttackEvent` similarly
3. Update event types to include all necessary data
4. Simplify apply functions to just read from events and update state

**Benefit:** Procedures become the single source of truth for what changes. Apply functions become pure state updates with no calculations or decisions.

**Example Pattern:**
```typescript
// Procedure should generate:
return {
  eventType: GAME_EFFECT_EVENT_TYPE,
  effectType: RESOLVE_MELEE_EFFECT_TYPE,
  location: meleeCoordinate,
  whiteAttackApply: whiteUnitRetreated ? {
    legalRetreatOptions: getLegalRetreats(whiteUnit, state),
    finalPosition: legalRetreatOptions.size === 1 
      ? Array.from(legalRetreatOptions)[0] 
      : undefined,
    // ... all other necessary data
  } : undefined,
  // ... similar for black
};

// Apply function should just:
const whiteAttackApplyState = event.whiteAttackApply 
  ? createAttackApplyStateFromEvent(event.whiteAttackApply)
  : undefined;
```

### Priority 2: Remove Validation of Procedure-Generated Events

**Action:**
1. Remove all validation checks for `gameEffect` events (they're procedure-generated)
2. Validation should only check `playerChoice` events
3. Update orchestrator pattern to trust procedure-generated events
4. Keep validation for player choices (sequencing + game rules)

**Benefit:** Clear separation - procedures are authoritative for game effects, validation only checks player input.

**Example:**
```typescript
// Current (wrong):
if (event.eventType === 'gameEffect' && event.effectType === 'resolveRally') {
  return { result: true }; // Why validate? Procedure generated it!
}

// Correct:
// Don't validate procedure-generated events at all
// Only validate player choices:
if (event.eventType === 'playerChoice') {
  const expected = getExpectedEvent(state);
  // Check matches expected + game rules
}
```

### Priority 3: Refactor Validation to Use Expected Event

**Action:**
1. Create helper: `validateEventMatchesExpected(event, state)`
2. Refactor phase validation to:
   - Call `getExpectedEvent(state)` first
   - Check if event matches expected type/player
   - Then do event-specific validation (legal moves, cards in hand, etc.)
3. Remove manual phase/step/player checks from individual validators

**Benefit:** Single source of truth for sequencing. Validation focuses on event-specific constraints.

**Example Pattern:**
```typescript
export function validateEventMatchesExpected<TBoard extends Board>(
  event: Event<TBoard>,
  state: GameState<TBoard>,
): ValidationResult {
  const expected = getExpectedEvent(state);
  
  if (expected.actionType === 'playerChoice') {
    if (event.eventType !== 'playerChoice') {
      return { result: false, errorReason: 'Expected player choice event' };
    }
    if (event.choiceType !== expected.choiceType) {
      return { result: false, errorReason: `Expected ${expected.choiceType}, got ${event.choiceType}` };
    }
    if (event.player !== expected.playerSource) {
      return { result: false, errorReason: `Expected ${expected.playerSource}, got ${event.player}` };
    }
  } else if (expected.actionType === 'gameEffect') {
    if (event.eventType !== 'gameEffect') {
      return { result: false, errorReason: 'Expected game effect event' };
    }
    if (event.effectType !== expected.effectType) {
      return { result: false, errorReason: `Expected ${expected.effectType}, got ${event.effectType}` };
    }
  }
  
  return { result: true };
}
```

---

### Priority 4: Remove Validation Checks from Expected Event

**Action:**
1. Remove defensive validation checks from `getExpectedEngagementEvent`
2. Move these checks to validation layer
3. Or: Return a discriminated union that includes "invalid state" cases

**Benefit:** Clear separation - expected event determines sequencing, validation checks correctness.

---

### Priority 5: Consider Event Context Enrichment

**Action:** (Lower priority, consider during broader refactoring)
- Evaluate if events should include more context to reduce navigation queries in apply functions
- Example: `ResolveRoutEvent` could include `attackApplyStatePath` or `contextId`

**Benefit:** Apply functions become even simpler, less coupled to state structure.

---

## Summary Table

| Issue | Severity | Engine(s) Affected | Fix Priority |
|-------|----------|-------------------|--------------|
| Procedures not specifying complete changes | 🔴 Critical | Procedure Library + Transform Engine | 1 |
| Legal retreats in apply functions | 🔴 Critical | Transform Engine | 1 (subset) |
| Validation checking procedure events | 🔴 Critical | Validation Engine | 2 |
| Expected event doing validation | 🟡 Moderate | Expected Event | 4 |
| Complex query navigation in apply | 🟡 Moderate | Transform Engine | 5 (optional) |

---

## Principles to Uphold

1. **Transform Engine:** Pure state updates only. Read from events, write to state. No calculations, no decisions, no figuring out details.

2. **Procedure Library:** All deterministic calculations happen here. Procedures produce **complete** events that specify **all details** of the change. Events should include everything needed for apply functions to update state without additional calculations or decisions. **Procedures are authoritative** - if a procedure generated an event, it's legal and doesn't need validation.

3. **Expected Event Engine:** Single source of truth for **sequencing/flow control**. Determines "what TYPE of event should happen next" (not the specific instance). **Can calculate which type is needed** based on state (sequencing logic). Returns event type, not event instance.

4. **Validation Engine:** **ONLY validates player choice events** (where players provide input). **DOES NOT validate procedure-generated events** - procedures are authoritative. For player choices, validates both sequencing (matches expected) and game rules (legal moves, cards in hand, etc.).

4. **Validation Engine:** **ONLY validates player choice events** (where players provide input). **DOES NOT validate procedure-generated events** - procedures are authoritative. For player choices, validates both sequencing (matches expected) and game rules (legal moves, cards in hand, etc.).

**Key Insights:**
- Procedures should say "change X to Y with details Z" not "make change X" and let apply functions figure out Y and Z.
- Expected event specifies TYPE (`resolveRally`), procedure generates SPECIFIC INSTANCE (`resolveRally` with card X).
- Validation is only for player choices - procedure-generated events are trusted.
- **Expected Event Engine can calculate which TYPE is needed** (sequencing logic), **procedures should NOT calculate types** - they're told the type and generate the instance.

---

---

## The Boundary Question: Expected Event vs. Procedure-Generated Event

### The Core Architectural Boundary

**Key Insight:** There's a fundamental boundary between:
1. **Expected Event Engine** - Determines "what TYPE of event should happen next" (sequencing)
2. **Procedure Library** - Determines "what SPECIFIC event instance should be generated" (calculation)
3. **Validation Engine** - Only validates **player choice events** (procedures are authoritative)

### The SOC Boundary: Type Calculation vs. Instance Generation

**Key Principle:** 
- **Expected Event Engine** can calculate **which TYPE** is needed (sequencing logic)
- **Procedure Library** generates **specific INSTANCE** of a given type (calculation logic)
- **Procedures should NOT calculate which type to generate** - they're told the type

**Correct Flow:**
```typescript
// 1. Expected Event Engine calculates TYPE (sequencing)
const expected = getExpectedRallyResolutionEvent(rallyState);
// Calculates: "We need resolveRally" or "We need resolveUnitsBroken" based on state
// expected = { actionType: 'gameEffect', effectType: 'resolveRally' }

// 2. Procedure generates SPECIFIC INSTANCE (calculation)
const event = generateResolveRallyEvent(state);
// Doesn't decide type - just generates specific resolveRally event with card X
// event = { effectType: 'resolveRally', player: 'white', card: Card(...) }
```

**Incorrect Pattern (if it existed):**
```typescript
// BAD: Procedure calculating which type to generate
function generateRallyEvent(state) {
  if (rallyState.rallyResolved) {
    return generateResolveUnitsBrokenEvent(state); // Wrong! Type decision in procedure
  }
  return generateResolveRallyEvent(state);
}
```

**Current Status:**
- ✅ Procedures are correctly told what type to generate (via `generateEventFromProcedure(state, effectType)`)
- ✅ Expected Event Engine calculates which type is needed (e.g., `getExpectedRallyResolutionEvent`)
- ⚠️ Some procedures may still have type calculation logic (e.g., `generateStartEngagementEvent` calculates engagementType field - but this is a field, not the event type itself)

**Boundary Clarification:**
- **Expected Event Engine**: "Based on state, we need TYPE X" (can do calculation to determine type)
- **Procedure Library**: "Given TYPE X and state, here's specific instance" (calculates instance details, not type)
- **Validation**: Only checks player choices (procedures are authoritative)

---

### The Boundary

**Expected Event Engine Responsibility:**
- Determines sequencing/flow control: "What category of event is next?"
- Returns event TYPE, not specific instance
- Example: `{ actionType: 'gameEffect', effectType: 'resolveRally' }`

**Procedure Library Responsibility:**
- Takes state and generates SPECIFIC event instance
- Is authoritative - if procedure generated it, it's legal
- Example: `generateResolveRallyEvent(state)` → specific `ResolveRallyEvent` with card X

**Validation Engine Responsibility:**
- **ONLY validates player choice events** (where players provide input)
- **DOES NOT validate procedure-generated events** (procedures are owned/authoritative)
- Checks: "Is this player choice valid for current state?"

### Implications

1. **Validation should skip procedure-generated events** - They're trusted because procedures are deterministic and authoritative
2. **Expected event specifies TYPE, not instance** - It says "resolveRally" not "resolveRally with card X"
3. **Procedures are the single source of truth** for what specific event should be generated
4. **Validation duplication problem is worse** - Validation shouldn't be checking if `resolveRally` matches expected `resolveRally` - it should only validate player choices

### Current Problem

Validation currently checks procedure-generated events:
```typescript
// In validateCleanupPhaseEvent
if (event.eventType === 'gameEffect' && event.effectType === 'resolveRally') {
  return { result: true }; // Why validate? Procedure generated it!
}
```

**This is unnecessary** - if a procedure generated the event, it's already authoritative. Validation should only check:
- Does the event type match expected? (for orchestrator flow control)
- For player choices: Is the specific choice valid? (card in hand, legal move, etc.)

### Correct Architecture

```typescript
// Orchestrator flow
const expected = getExpectedEvent(state);

if (expected.actionType === 'gameEffect') {
  // Generate event from procedure (authoritative, no validation needed)
  const event = generateEventFromProcedure(state, expected.effectType);
  const newState = applyEvent(event, state); // Trust procedure
} else if (expected.actionType === 'playerChoice') {
  // Wait for player input, then validate
  const playerEvent = awaitPlayerInput();
  const validation = validateEvent(playerEvent, state); // Validate player choice
  if (!validation.result) {
    reject(playerEvent);
  } else {
    const newState = applyEvent(playerEvent, state);
  }
}
```

---

## Notes

- Procedures are currently well-designed and follow SRP correctly
- **Procedure-generated events should NOT be validated** - they're authoritative
- Validation should ONLY check player choice events
- The core architecture is sound - these are refinements, not fundamental changes
- Most violations are in the "moderate" category and can be addressed incrementally
- The critical issues (legal retreats, validation duplication) should be prioritized
