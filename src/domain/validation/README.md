# Validation Functions

This directory contains validation functions that check whether game actions, states, or conditions are valid according to the game rules.

## Core Principle

**The validation entry points return a `ValidationResult` and never throw.** Each has exactly one boundary that turns a fault into a refusal; everything beneath a boundary throws at the site that found the fault, and does not catch it on the way up.

```typescript
type ValidationResult =
  | { result: true }
  | { result: false; errorReason: string };
```

Callers branch on `result` and surface `errorReason` when rejecting an event. See `@utils` (`ValidationResult`).

## Pattern

1. **Return type**: Always `ValidationResult` (never a bare `boolean`, never `throws` for rule failure).
2. **Failure shape**: Every `result: false` includes a specific `errorReason` string.
3. **Error handling**: Do not catch inside a per-choice validator. A getter or legality enumerator that throws is left to throw, with its own specific message. The entry point (`validatePlayerChoice`, `eachCardPresentOnce`, `eachUnitPresentOnce`) catches once and returns `failFromFault`, which keeps that message under what was being validated. Nothing between the throw and the boundary catches or rewords it.
4. **Naming**: Prefer `is*`, `can*`, `matches*`, or `validate*` (e.g. internal `isValidChooseCardEvent`, public `validatePlayerChoice`).

## Player choices: enumerate then membership

Legal player-choice payloads are owned by `@legality` (`getLegal*`). Validators that have an enumerator check **membership** against that list (for a move's path, `isValidMovePath` checks each step and turn against `findLegalMoveDeltas`):

```typescript
export function isValidChooseCardEvent(
  event: ChooseCardEvent,
  state: GameState,
): ValidationResult {
  const legalOptions = getLegalChooseCardOptions(state);
  const legalOption = legalOptions.find(
    (option) =>
      option.player === event.player && option.card.id === event.card.id,
  );
  if (legalOption === undefined) {
    return {
      result: false,
      errorReason: `Command card ${event.card.id} is not a legal choice for ${event.player}`,
    };
  }
  // The id names a card the player holds; the card the event shows must be
  // that card.
  const sameCard = isSameCardValue(legalOption.card, event.card);
  if (!sameCard.result) {
    return sameCard;
  }
  return { result: true };
}
```

When an event passes a whole card, an id match is not enough: the card the event shows is checked against the card the hand holds with `isSameCardValue`, so a copy that keeps a real id but claims stronger stats is refused with the part that differs. When an event passes only an id, the fold looks the card up and nothing more is checked.

`validatePlayerChoice` still layers **expected** (sequencing) before **legal** (membership). Do not re-encode phase/hand rules in `isValid*` when a `getLegal*` already enumerates them.

Movement legality (`getLegalUnitMoves`, `findLegalMoveDeltas`, commander moves) lives in `@legality`, not here; judging a submitted path against it (`isValidMovePath`) lives here.

## Game state invariants

`gameState/` checks that a state is internally consistent, including `eachCardPresentOnce` and `eachUnitPresentOnce`.

## Why this pattern

- **Actionable failures**: Orchestrators and clients need _why_ an event was rejected, not just `false`.
- **Fail-safe**: Invalid inputs or getter errors become `FailValidationResult`, not crashes.
- **Single source of truth**: Legality enumerators define the option set; validators only ask “is this event among them?”

## Contrast with Queries

**Queries** (`queries/`) extract information. Failure modes differ by function — document each one; do not assume a single convention:

| Function           | Missing / out of bounds                           | Malformed input                                                               |
| ------------------ | ------------------------------------------------- | ----------------------------------------------------------------------------- |
| `getBoardSpace`    | **throws** (coordinate absent from `board.board`) | n/a (key lookup)                                                              |
| `findForwardSpace` | returns **`undefined`** (step leaves the board)   | **throws** (bad coordinate string, row/column outside layout, invalid facing) |

**Validators** let throws from getters fall through to the entry point's boundary, which turns them into a `FailValidationResult`. They treat `undefined` from directional queries as a normal negative case (not an exception).

Do not write “queries throw, validation catches” as a blanket rule — only some getters throw.

## Authoritative game state

Player-choice legality validators that use `getLegal*` take authoritative `GameState` (both hands readable). Card visibility is a `visibility` tag on `GameState`, which a `switch` narrows when a function must constrain readable card fields. Board size is not a type parameter — size is asserted at Zod boundaries and via `board.boardType` at runtime. See [`../entities/README.md`](../entities/README.md).

## Testing

Titles, fixtures, and setup follow [`STYLE.md`](../../../STYLE.md). For this layer specifically:

- Assert `result: false` **and** a meaningful `errorReason` for illegal cases.
- Assert at a per-choice validator that a getter / enumerator throw is left to throw, naming its cause; assert at the entry point (`validatePlayerChoice`) that it becomes `result: false`, not an uncaught exception.
- Cover membership pass/fail; leave enumeration depth to colocated `getLegal*.test.ts`.
