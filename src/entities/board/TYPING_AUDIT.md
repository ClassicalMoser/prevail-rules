# Board Typing Patterns Audit

## Summary

This document audits all board-related functions for type safety and consistency. The goal is to ensure compile-time coordinate validation while maintaining code clarity.

## Pattern Categories

### Category 1: Functions Using Generics (Type-Safe) ✅

These functions use `<TBoard extends Board>` to maintain compile-time coordinate validation:

- `getBoardSpace<TBoard extends Board>` - Core accessor, used by all others
- `getPlayerUnitWithPosition<TBoard extends Board>` - Returns `UnitWithPlacement<TBoard>`
- `getLegalUnitMoves<TBoard extends Board>` - Returns `Set<UnitPlacement<TBoard>>`
- `isAtPlacement<TBoard extends Board>` - Takes `UnitWithPlacement<TBoard>`
- `canMoveInto<TBoard extends Board>` - Validates coordinate matches board type
- `canMoveThrough<TBoard extends Board>` - Validates coordinate matches board type
- `canEngageEnemy<TBoard extends Board>` - Validates coordinate matches board type

**Pattern**: These functions need to preserve the board type through their return values or need strict coordinate validation.

### Category 2: Functions NOT Using Generics (Potentially Unsafe) ⚠️

These functions take `Board` (union type) and return `BoardCoordinate<Board>` (union type):

- `getForwardSpace(board: Board, ...)` → `BoardCoordinate<Board> | undefined`
- `getAdjacentSpaces(board: Board, ...)` → `Set<BoardCoordinate<Board>>`
- `getSpacesWithinDistance(board: Board, ...)` → `Set<BoardCoordinate<Board>>`
- `getFrontSpaces(board: Board, ...)` → `Set<BoardCoordinate<Board>>`
- `getBackSpaces(board: Board, ...)` → `Set<BoardCoordinate<Board>>`
- `getFlankingSpaces(board: Board, ...)` → `Set<BoardCoordinate<Board>>`
- `getInlineSpaces(board: Board, ...)` → `Set<BoardCoordinate<Board>>`
- `getSpacesAhead(board: Board, ...)` → `Set<BoardCoordinate<Board>>`
- `getSpacesBehind(board: Board, ...)` → `Set<BoardCoordinate<Board>>`
- `getRightSpace(board: Board, ...)` → `BoardCoordinate<Board> | undefined`
- `getLeftSpace(board: Board, ...)` → `BoardCoordinate<Board> | undefined`
- `getRearwardSpace(board: Board, ...)` → `BoardCoordinate<Board> | undefined`
- `getSpacesInDirection(board: Board, ...)` → `Set<BoardCoordinate<Board>>` (internal)
- `getLinesFromUnit(board: Board, ...)` → `Set<Line>` (takes `UnitWithPlacement<Board>`)
- `isLegalMove(moveCommand, boardState: Board)` → `boolean`
- `isLegalCommanderMove(moveCommand, boardState: Board)` → `boolean`

**Issue**: These functions lose type information. When you pass a `StandardBoard`, you get back `BoardCoordinate<Board>` (a union) instead of `StandardBoardCoordinate`. This means:

- You can't pass the result to a function expecting `StandardBoardCoordinate` without a type assertion
- TypeScript can't validate that coordinates match the board type at compile time

**Why they exist**: These functions are often used in contexts where the board type is unknown or mixed, and adding generics would make them very verbose.

### Category 3: Direct Board Access (Test Helpers Only) ✅

These are test helpers that directly access `board.board[coordinate]`:

- `createBoardWithUnits()` - Returns `StandardBoard`, direct access is safe
- `createBoardWithSingleUnit()` - Returns `StandardBoard`, direct access is safe
- `createBoardWithEngagedUnits()` - Returns `StandardBoard`, direct access is safe
- `createBoardWithCommander()` - Returns `StandardBoard`, direct access is safe

**Pattern**: These are fine because they work with concrete board types, not the union.

## Type Assertions Found

### In Core Functions

1. **`getBoardSpace.ts:28`**: `board.board[coordinate as keyof typeof board.board]`
   - **Necessary**: TypeScript can't index into union of Records without this
   - **Safe**: Generic constraint ensures `TBoard` and `BoardCoordinate<TBoard>` align

2. **`getForwardSpace.ts:93-95`**: `as BoardCoordinate<Board> | undefined`
   - **Issue**: This loses type information. Should return `TCoordinate` from `getForwardSpaceWithConfig`
   - **Impact**: Callers lose compile-time coordinate validation

3. **`getAdjacentSpaces.ts:21,27`**: Multiple `as Set<BoardCoordinate<Board>>`
   - **Issue**: Loses type information
   - **Impact**: Results can't be used with specific board types without assertions

4. **`filterUndefinedSpaces.ts:15-16`**: `as BoardCoordinate<Board>[]` and `as Set<BoardCoordinate<Board>>`
   - **Issue**: Loses type information
   - **Impact**: Used by many functions, propagates type loss

### In Test Files

- Many `as StandardBoardCoordinate` for invalid coordinates (intentional, testing error cases)
- `board.board[coordinate]` direct access in tests (acceptable for test helpers)

## Inconsistencies

### 1. Mixed Patterns in Call Chains

**Example**: `getLegalUnitMoves` (uses generics) calls:

- `getBoardSpace` ✅ (uses generics, preserves type)
- `getForwardSpace` ⚠️ (no generics, loses type - requires `as BoardCoordinate<BoardType>` on line 137)
- `canMoveInto` ✅ (uses generics, preserves type)
- `canEngageEnemy` ✅ (uses generics, preserves type)

**Issue**: The chain loses type information at `getForwardSpace`, requiring type assertions.

### 2. Validation Functions

- `isLegalMove` and `isLegalCommanderMove` take `Board` (union) but call functions that use generics
- They work correctly but could be more type-safe if they used generics

### 3. Area Calculation Functions

All area calculation functions (`getSpacesAhead`, `getSpacesBehind`, `getFrontSpaces`, etc.) use the non-generic pattern, losing type information throughout the call chain.

## Recommendations

### High Priority

1. **Document the pattern**: Create clear guidelines on when to use generics vs. union types
   - Use generics when: function needs to preserve board type in return value or validate coordinates
   - Use union types when: function is a utility that works with any board type and type loss is acceptable

2. **Fix `getForwardSpace`**: This is a core building block. Consider:
   - Option A: Add generic `<TBoard extends Board>` and return `BoardCoordinate<TBoard> | undefined`
   - Option B: Keep as-is but document that it loses type information (current state)

3. **Review `filterUndefinedSpaces`**: This propagates type loss. Consider making it generic:
   ```typescript
   export function filterUndefinedSpaces<T extends BoardCoordinate<Board>>(
     spaces: Set<T | undefined>,
   ): Set<T>;
   ```

### Medium Priority

4. **Consider generic versions of area functions**: For functions that are commonly used with known board types, consider adding generic overloads:

   ```typescript
   export function getSpacesAhead<TBoard extends Board>(
     board: TBoard,
     coordinate: BoardCoordinate<TBoard>,
     facing: UnitFacing,
   ): Set<BoardCoordinate<TBoard>>;
   ```

5. **Audit `getLinesFromUnit`**: Takes `UnitWithPlacement<Board>` (union) but could take `UnitWithPlacement<TBoard>` with generics

### Low Priority

6. **Validation functions**: `isLegalMove` and `isLegalCommanderMove` could use generics, but current pattern works fine since they're at the boundary

## Current State Assessment

✅ **Safe**: Core accessors and functions that need strict coordinate validation use generics correctly

⚠️ **Acceptable but suboptimal**: Area calculation and utility functions lose type information but work correctly at runtime

❌ **No critical issues found**: All functions work correctly, type assertions are either necessary (core functions) or intentional (tests)

## Conclusion

The codebase has a **consistent pattern** for core functions (using generics) and a **consistent pattern** for utility functions (using union types). The main issue is that utility functions lose type information, which requires type assertions in some call chains.

**Recommendation**: Document the two patterns clearly and decide whether the type loss in utility functions is acceptable or if we should add generic versions for commonly-used functions.


