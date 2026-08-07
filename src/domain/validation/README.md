# Validation Functions

This directory contains validation functions that check whether game actions, states, or conditions are valid according to the game rules.

## Core Principle

**Validation functions return a `ValidationResult` and never throw.**

```typescript
type ValidationResult =
  | { result: true }
  | { result: false; errorReason: string };
```

Callers branch on `result` and surface `errorReason` when rejecting an event. See `entities/validationResult.ts`.

## Pattern

1. **Return type**: Always `ValidationResult` (never a bare `boolean`, never `throws` for rule failure).
2. **Failure shape**: Every `result: false` includes a specific `errorReason` string.
3. **Error handling**: Wrap bodies that call throwing getters in try/catch; map caught errors to `{ result: false, errorReason }`.
4. **Naming**: Prefer `is*`, `can*`, `matches*`, or `validate*` for the public surface (e.g. `isLegalCommanderMove`, `validateEvent`).

## Why This Pattern?

- **Actionable failures**: Orchestrators and clients need *why* an event was rejected, not just `false`.
- **Fail-safe**: Invalid inputs or getter errors become `FailValidationResult`, not crashes.
- **Engine contract**: `validateEvent` and phase routers all speak `ValidationResult`; keep leaf validators aligned.

## Example

```typescript
export function isLegalCommanderMove(
  moveCommanderEvent: MoveCommanderEvent,
  boardState: Board,
): ValidationResult {
  try {
    const fromSpace = getBoardSpace(boardState, moveCommanderEvent.from);
    if (!fromSpace.commanders.includes(moveCommanderEvent.player)) {
      return {
        result: false,
        errorReason: 'Commander is not at the starting position',
      };
    }
    // ...
    return { result: true };
  } catch (error) {
    return {
      result: false,
      errorReason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

## Contrast with Queries

**Queries** (`queries/`) extract information. Failure modes differ by function — document each one; do not assume a single convention:

| Function | Missing / out of bounds | Malformed input |
|---|---|---|
| `getBoardSpace` | **throws** (coordinate absent from `board.board`) | n/a (key lookup) |
| `getForwardSpace` | returns **`undefined`** (step leaves the board) | **throws** (bad coordinate string, row/column outside layout, invalid facing) |

**Validators** catch throws from getters and turn them into `FailValidationResult`. They treat `undefined` from directional queries as a normal negative case (not an exception).

Do not write “queries throw, validation catches” as a blanket rule — only some getters throw.

## Visibility Constraints

Some validators require a visibility-narrowed game state so they can read owned card fields (e.g. `.id` on hand cards):

```typescript
export function isValidChooseCardEvent<T extends GameStateVisibility>(
  event: ChooseCardEvent,
  state: GameStateForVisibility<T>,
): ValidationResult
```

Visibility is a type parameter because it **constrains inputs**. Board size is not — size is asserted at Zod boundaries and via `board.boardType` at runtime. See [`../entities/README.md`](../entities/README.md).

## Testing

- Assert `result: false` **and** a meaningful `errorReason` for illegal cases.
- Assert that getter throws become `result: false`, not uncaught exceptions.
- Cover both pass and fail paths explicitly; prefer exact `errorReason` matches over substring hedges when the message is stable.
