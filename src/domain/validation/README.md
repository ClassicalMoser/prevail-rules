# Validation Functions

This directory contains validation functions that check whether game actions, states, or conditions are valid according to the game rules.

## Core Principle

**Validation functions return a `ValidationResult` and never throw.**

```typescript
type ValidationResult =
  | { result: true }
  | { result: false; errorReason: string };
```

Callers branch on `result` and surface `errorReason` when rejecting an event. See `@utils` (`ValidationResult`).

## Pattern

1. **Return type**: Always `ValidationResult` (never a bare `boolean`, never `throws` for rule failure).
2. **Failure shape**: Every `result: false` includes a specific `errorReason` string.
3. **Error handling**: Wrap bodies that call throwing getters / legality enumerators in try/catch; map caught errors to `{ result: false, errorReason }`.
4. **Naming**: Prefer `is*`, `can*`, `matches*`, or `validate*` for the public surface (e.g. `isValidChooseCardEvent`, `validateEvent`).

## Player choices: enumerate then membership

Legal player-choice payloads are owned by `@legality` (`getLegal*`). Validators that have an enumerator check **membership** against that list (same idea as `isLegalMove` → `getLegalUnitMoves`):

```typescript
export function isValidChooseCardEvent(
  event: ChooseCardEvent,
  state: GameState,
): ValidationResult {
  try {
    const legalOptions = getLegalChooseCardOptions(state);
    const isLegal = legalOptions.some(
      (option) =>
        option.player === event.player && option.card.id === event.card.id,
    );
    if (!isLegal) {
      return {
        result: false,
        errorReason: `Command card ${event.card.id} is not a legal choice for ${event.player}`,
      };
    }
    return { result: true };
  } catch (error) {
    return {
      result: false,
      errorReason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

`validatePlayerChoice` still layers **expected** (sequencing) before **legal** (membership). Do not re-encode phase/hand rules in `isValid*` when a `getLegal*` already enumerates them.

## Why This Pattern?

- **Actionable failures**: Orchestrators and clients need _why_ an event was rejected, not just `false`.
- **Fail-safe**: Invalid inputs or getter errors become `FailValidationResult`, not crashes.
- **Single source of truth**: Legality enumerators define the option set; validators only ask “is this event among them?”

## Contrast with Queries

**Queries** (`queries/`) extract information. Failure modes differ by function — document each one; do not assume a single convention:

| Function          | Missing / out of bounds                           | Malformed input                                                               |
| ----------------- | ------------------------------------------------- | ----------------------------------------------------------------------------- |
| `getBoardSpace`   | **throws** (coordinate absent from `board.board`) | n/a (key lookup)                                                              |
| `getForwardSpace` | returns **`undefined`** (step leaves the board)   | **throws** (bad coordinate string, row/column outside layout, invalid facing) |

**Validators** catch throws from getters and turn them into `FailValidationResult`. They treat `undefined` from directional queries as a normal negative case (not an exception).

Do not write “queries throw, validation catches” as a blanket rule — only some getters throw.

## Authoritative game state

Player-choice legality validators that use `getLegal*` take authoritative `GameState` (both hands readable). Card visibility is still a type parameter elsewhere when a function must constrain readable card fields. Board size is not a type parameter — size is asserted at Zod boundaries and via `board.boardType` at runtime. See [`../entities/README.md`](../entities/README.md).

## Testing

- Assert `result: false` **and** a meaningful `errorReason` for illegal cases.
- Assert that getter / enumerator throws become `result: false`, not uncaught exceptions.
- Cover membership pass/fail; leave enumeration depth to colocated `getLegal*.test.ts`.
