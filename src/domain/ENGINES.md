# The Four Engines

This project delivers four core engines that work together to provide a complete, deterministic game rules system. These engines enable full event stream processing, deterministic playback, reversibility, and reconstructability.

## 1. Pure Transform Engine

**Location:** `transforms/applyEvent.ts`

**Purpose:** Takes gamestate and event, returns new gamestate (immutable).

**Function:** `applyEvent(event: Event, state: GameState): GameState`

**Characteristics:**

- Pure function with no side effects
- Immutable state transitions
- Routes events to appropriate state transition functions
- Enables deterministic replay of event streams

**Usage:**

```typescript
import { applyEvent } from '@transforms';

const newState = applyEvent(event, currentState);
// newState is a new immutable object, currentState is unchanged
```

**Implementation:**

- Routes based on event type (playerChoice vs gameEffect)
- Delegates to specific `apply*Event` functions in `stateTransitions/`
- All state transitions are pure functions that return new state objects

## 2. Validation Engine

**Location:** `validation/playerChoice/validatePlayerChoice.ts`

**Purpose:** Validates an incoming player choice against expected sequencing and legal membership, returns `ValidationResult`.

**Function:** `validatePlayerChoice(event: PlayerChoiceEvent, state: GameState): ValidationResult`

**Characteristics:**

- Layers **expected** (`getExpectedEvent`) before **legal** (`isValid*Event` membership against `@legality` `getLegal*`)
- Returns `ValidationResult` with `result: boolean` and optional `errorReason: string`
- Never throws errors - always returns a result
- Per-choice `isValid*` helpers stay internal to `@validation`; actors use `validatePlayerChoice` and `getLegalPlayerChoiceOptions`

**Usage:**

```typescript
import { validatePlayerChoice } from '@validation';

const validation = validatePlayerChoice(event, state);
if (!validation.result) {
  // Reject the event
  console.error(validation.errorReason);
  return;
}
// Proceed to apply the event
const newState = applyEvent(event, state);
```

**Implementation:**

- `validateExpectedChoice` checks the event matches what sequencing expects next
- `validateLegalPlayerChoice` dispatches to membership/integrity validators in `validation/playerChoice/`
- Legal option payloads for UI/bots come from `getLegalPlayerChoiceOptions` (same `@legality` enumerators)

## 3. Procedure Library

**Location:** `procedures/`

**Purpose:** Supply of functions to take a gameState and return a gameEffect event.

**Function:** `generate*Event(state: GameState, ...params): GameEffectEvent`

**Characteristics:**

- Generates deterministic game effect events based on game state
- Procedures are registered in `procedureRegistry.ts`
- Used when the game needs to produce an effect (not player input)
- May require external input (e.g., random seed) for deterministic results

**Usage:**

```typescript
import { procedureRegistry } from '@procedures';

// Generate a game effect event
const event = procedureRegistry.resolveRally(state, 'white', randomSeed);

// Apply the generated event
const newState = applyEvent(event, state);
```

**Current Procedures:**

- `generateResolveRallyEvent` - Generates a rally resolution event
- `generateResolveUnitsBrokenEvent` - Generates a units broken resolution event

**Registry:**

- `procedureRegistry` maps effect types to their generator functions
- `requiresProcedure()` helper checks if an effect type needs a procedure

## 4. Next Event Expected Engine

**Location:** `queries/expectedEvent/getExpectedEvent.ts`

**Purpose:** Takes gamestate only, determines the expected source of the next event (player, players, or game) and if game, specifies the procedure to produce the next gameEffect.

**Function:** `getExpectedEvent(state: GameState): ExpectedEventInfo`

**Characteristics:**

- Returns `ExpectedEventInfo` which is a discriminated union:
  - `ExpectedPlayerInput` - indicates which player(s) should provide input
  - `ExpectedGameEffect` - indicates which game effect should be generated
- Routes based on current phase and step
- Enables orchestrator to know what action to take next

**Usage:**

```typescript
import { getExpectedEvent } from '@expected/expectedEvent';

const expected = getExpectedEvent(state);

if (expected.actionType === 'playerChoice') {
  // Wait for player input
  console.log(`Waiting for ${expected.playerSource} to ${expected.choiceType}`);
} else if (expected.actionType === 'gameEffect') {
  // Generate game effect
  if (requiresProcedure(expected.effectType)) {
    const event = procedureRegistry[expected.effectType](state, ...params);
    const newState = applyEvent(event, state);
  } else {
    // Direct game effect (no procedure needed)
    const event = createGameEffectEvent(expected.effectType);
    const newState = applyEvent(event, state);
  }
}
```

**Implementation:**

- Routes based on current phase state
- Delegates to phase-specific `getExpected*PhaseEvent` functions
- Returns structured information about what's expected next

### Legal choice presentation (actors)

**Location:** `validation/playerChoice/getLegalPlayerChoiceOptions.ts`

**Purpose:** After `getExpectedEvent` says a player choice is next, package the legal option payload for UI and bots from the same `@legality` enumerators validators membership-check. Lives in `@validation` because it composes `@expected` + `@legality` (legality cannot import expected).

**Function:** `getLegalPlayerChoiceOptions(state: GameState): LegalPlayerChoiceOptions | null`

- Returns `null` when the next action is a game effect (or expected throws).
- Otherwise returns a discriminant by `choiceType` with `playerSource`, `expectedEventNumber`, and either full `events[]` (atomic choices) or named root atoms (compound choices).
- Selection-dependent follow-ups stay on existing helpers (`getLegalUnitMoves`, `getLegalRangedAttackTargets`, `getLegalLineEndsForIssueCommand`, …).

```typescript
import { getLegalPlayerChoiceOptions, validatePlayerChoice } from '@validation';
import { applyEvent } from '@transforms';

const options = getLegalPlayerChoiceOptions(state);
if (options === null) {
  // game-effect / procedure path via getExpectedEvent
} else {
  // UI highlights options; bot samples from options / follow-up getLegal*
  // Build PlayerChoiceEvent → validatePlayerChoice → applyEvent
  const validation = validatePlayerChoice(event, state);
  if (validation.result) {
    const newState = applyEvent(event, state);
  }
}
```

## Engine Integration

These four engines work together to process an event stream:

1. **Next Event Expected Engine** determines what should happen next
2. **Legal choice presentation** (`getLegalPlayerChoiceOptions`) fills in options when the next action is a player choice (shared by UI and bots)
3. **Validation Engine** validates incoming events (from players or procedures)
4. **Procedure Library** generates game effect events when needed
5. **Pure Transform Engine** applies validated events to produce new state

This architecture enables:

- **Deterministic playback**: Replay any game by applying the same event stream
- **Reversibility**: Track events to enable undo/redo
- **Reconstructability**: Rebuild game state from event log
- **Additional insights**: Analyze event streams for game analytics

## Example Flow

```typescript
// 1. Determine what's expected next
const expected = getExpectedEvent(state);

if (
  expected.actionType === 'gameEffect' &&
  expected.effectType === 'resolveRally'
) {
  // 2. Generate the event using procedure library
  const event = procedureRegistry.resolveRally(state, 'white', randomSeed);

  // 3. Apply the event using transform engine
  // (Player choices go through validatePlayerChoice before apply;
  //  procedure-generated game effects are trusted from the registry.)
  const newState = applyEvent(event, state);

  // 4. Repeat with new state
  const nextExpected = getExpectedEvent(newState);
  // ...
}
```
