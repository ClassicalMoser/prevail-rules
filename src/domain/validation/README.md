# Validation Functions

This directory contains validation functions that check whether game actions, states, or conditions are valid according to the game rules.

## Core Principle

**Validation functions must always return a boolean and never throw errors.**

## Pattern

All validation functions in this directory follow this pattern:

1. **Return Type**: Always return `boolean` (`true` or `false`)
2. **Error Handling**: Wrap the entire function body in a try-catch that returns `false` on any error
3. **Naming**: Use `is*`, `can*`, or `matches*` prefixes (e.g., `isAtPlacement`, `canMoveInto`, `matchesUnitRequirements`)

## Why This Pattern?

- **Validation functions are predicates**: They answer "yes" or "no" questions about game state
- **Fail-safe behavior**: Invalid inputs or errors should result in `false`, not crash the game
- **Consistent API**: Callers can always expect a boolean return value without needing try-catch blocks

## Examples

### ✅ Correct Pattern

```typescript
export function isAtPlacement<TBoard extends Board>(
  board: TBoard,
  unitWithPlacement: UnitWithPlacement<TBoard>,
): boolean {
  try {
    // All validation logic here
    const friendlyUnit = getPlayerUnitWithPosition(
      board,
      coordinate,
      playerSide,
    );
    // ... validation checks ...
    return true;
  } catch {
    // Any error means validation fails - return false
    return false;
  }
}
```

### ❌ Incorrect Pattern

```typescript
// DON'T: Throwing errors in validation functions
// Missing try-catch - will throw if coordinate doesn't exist
const friendlyUnit = getPlayerUnitWithPosition(board, coordinate, playerSide);
// This will crash instead of returning false!
```

## Contrast with Getter Functions

**Getter functions** (in `src/functions/`) can and should throw errors for invalid inputs:

- `getBoardSpace()` - throws if coordinate doesn't exist
- `getPlayerUnitWithPosition()` - throws if coordinate doesn't exist

**Validation functions** (in `src/validation/`) must catch these errors and return `false`:

- `isAtPlacement()` - catches errors from getters, returns `false`
- `canMoveInto()` - catches errors from getters, returns `false`

## When to Use This Pattern

Use this pattern for any function that:

- Validates game rules or constraints
- Checks if an action is legal
- Verifies game state conditions
- Answers "can this happen?" or "is this valid?" questions

## Testing

When testing validation functions:

- Test that invalid inputs return `false` (not throw)
- Test that errors from getter functions are caught and return `false`
- Test both `true` and `false` cases explicitly
