# Board Typing Patterns Audit

## Summary

This document audits all board-related functions for type safety and consistency. The goal is to ensure compile-time coordinate validation while maintaining code clarity.

## Pattern Categories

### Category 1: Functions Using Generics (Type-Safe) ✅

These functions use `<TBoard extends Board>` to maintain compile-time coordinate validation:

**Core Accessors & Validation:**

- `getBoardSpace<TBoard extends Board>` - Core accessor, used by all others
- `getPlayerUnitWithPosition<TBoard extends Board>` - Returns `UnitWithPlacement<TBoard>`
- `getLegalUnitMoves<TBoard extends Board>` - Returns `Set<UnitPlacement<TBoard>>`
- `isAtPlacement<TBoard extends Board>` - Takes `UnitWithPlacement<TBoard>`
- `canMoveInto<TBoard extends Board>` - Validates coordinate matches board type
- `canMoveThrough<TBoard extends Board>` - Validates coordinate matches board type
- `canEngageEnemy<TBoard extends Board>` - Validates coordinate matches board type

**Movement & Direction Functions:**

- `getForwardSpace<TBoard extends Board>` - Returns `BoardCoordinate<TBoard> | undefined`
- `getRightSpace<TBoard extends Board>` - Returns `BoardCoordinate<TBoard> | undefined`
- `getLeftSpace<TBoard extends Board>` - Returns `BoardCoordinate<TBoard> | undefined`
- `getRearwardSpace<TBoard extends Board>` - Returns `BoardCoordinate<TBoard> | undefined`
- `getForwardSpacesToEdge<TBoard extends Board>` - Returns `Set<BoardCoordinate<TBoard>>`

**Adjacency Functions:**

- `getAdjacentSpaces<TBoard extends Board>` - Returns `Set<BoardCoordinate<TBoard>>`
- `getFrontSpaces<TBoard extends Board>` - Returns `Set<BoardCoordinate<TBoard>>`
- `getBackSpaces<TBoard extends Board>` - Returns `Set<BoardCoordinate<TBoard>>`
- `getFlankingSpaces<TBoard extends Board>` - Returns `Set<BoardCoordinate<TBoard>>`

**Area Calculation Functions:**

- `getInlineSpaces<TBoard extends Board>` - Returns `Set<BoardCoordinate<TBoard>>`
- `getSpacesAhead<TBoard extends Board>` - Returns `Set<BoardCoordinate<TBoard>>`
- `getSpacesBehind<TBoard extends Board>` - Returns `Set<BoardCoordinate<TBoard>>`
- `getSpacesWithinDistance<TBoard extends Board>` - Returns `Set<BoardCoordinate<TBoard>>`
- `getSpacesInArc<TBoard extends Board>` - Returns `Set<BoardCoordinate<TBoard>>`
- `getSpacesInDirection<TBoard extends Board>` - Returns `Set<BoardCoordinate<TBoard>>` (internal)

**Utility Functions:**

- `filterUndefinedSpaces<T extends BoardCoordinate<Board>>` - Generic filter that preserves coordinate type
- `getBoardConfig<TBoard extends Board>` - Helper that encapsulates config type assertion

**Pattern**: These functions preserve the board type through their return values, ensuring compile-time coordinate validation throughout the call chain. Type assertions are encapsulated in helper functions rather than scattered throughout the codebase.

### Category 2: Functions NOT Using Generics (Boundary Functions) ⚠️

These functions take `Board` (union type) and are typically used at system boundaries where the board type is unknown:

- `getLinesFromUnit(board: Board, ...)` → `Set<Line>` (takes `UnitWithPlacement<Board>`)
- `isLegalMove(moveCommand, boardState: Board)` → `boolean`
- `isLegalCommanderMove(moveCommand, boardState: Board)` → `boolean`

**Note**: These functions work at the boundary where board types may be mixed. They internally call generic functions when needed, but their public API accepts the union type for flexibility. This is acceptable since they're validation/query functions that return boolean or domain objects, not coordinates.

### Category 3: Direct Board Access (Test Helpers Only) ✅

These are test helpers that directly access `board.board[coordinate]`:

- `createBoardWithUnits()` - Returns `StandardBoard`, direct access is safe
- `createBoardWithSingleUnit()` - Returns `StandardBoard`, direct access is safe
- `createBoardWithEngagedUnits()` - Returns `StandardBoard`, direct access is safe
- `createBoardWithCommander()` - Returns `StandardBoard`, direct access is safe

**Pattern**: These are fine because they work with concrete board types, not the union.

## Type Assertions Found

### In Core Functions (Encapsulated & Necessary)

1. **`getBoardSpace.ts:28`**: `board.board[coordinate as keyof typeof board.board]`
   - **Necessary**: TypeScript can't index into union of Records without this
   - **Safe**: Generic constraint ensures `TBoard` and `BoardCoordinate<TBoard>` align
   - **Status**: ✅ Necessary and properly encapsulated

2. **`boardConfig.ts:69`**: `boardConfigMap[board.boardType] as BoardConfig<BoardCoordinate<TBoard>>`
   - **Necessary**: TypeScript can't narrow union type from `boardConfigMap[board.boardType]`
   - **Safe**: Generic constraint ensures `TBoard` and `BoardCoordinate<TBoard>` align
   - **Status**: ✅ Properly encapsulated in `getBoardConfig()` helper function
   - **Pattern**: This helper eliminates the need for type assertions in calling code (e.g., `getForwardSpace`)

### Removed Type Assertions ✅

The following type assertions have been **eliminated** by making functions generic and using the `getBoardConfig` helper:

- ~~`getForwardSpace.ts`~~ - Now uses `getBoardConfig()` helper, no type assertions in function body
- ~~`getAdjacentSpaces.ts:21,27`~~ - Now generic, preserves type
- ~~`filterUndefinedSpaces.ts:15-16`~~ - Now generic, preserves type
- ~~`getLegalUnitMoves.ts:137`~~ - Type assertion removed, `getForwardSpace` now preserves type

### Type Assertion Pattern

**Best Practice**: Type assertions are encapsulated in helper functions:

- `getBoardConfig()` - Encapsulates the config type assertion
- `getBoardSpace()` - Encapsulates the board indexing assertion

This keeps calling code clean and type-safe without scattered assertions.

### In Test Files

- Many `as StandardBoardCoordinate` for invalid coordinates (intentional, testing error cases)
- `board.board[coordinate]` direct access in tests (acceptable for test helpers)

## Type Safety Improvements ✅

### 1. Consistent Generic Pattern Throughout Call Chains

**Example**: `getLegalUnitMoves` (uses generics) now calls:

- `getBoardSpace` ✅ (uses generics, preserves type)
- `getForwardSpace` ✅ (now uses generics, preserves type - no type assertion needed!)
- `canMoveInto` ✅ (uses generics, preserves type)
- `canEngageEnemy` ✅ (uses generics, preserves type)

**Result**: Type information is preserved throughout the entire call chain. No type assertions needed!

### 2. Area Calculation Functions

All area calculation functions now use generics:

- `getSpacesAhead<TBoard>` ✅
- `getSpacesBehind<TBoard>` ✅
- `getFrontSpaces<TBoard>` ✅
- `getBackSpaces<TBoard>` ✅
- `getFlankingSpaces<TBoard>` ✅
- `getInlineSpaces<TBoard>` ✅
- `getSpacesWithinDistance<TBoard>` ✅
- `getSpacesInArc<TBoard>` ✅

**Result**: Type information flows through the entire call chain without loss.

### 3. Boundary Functions

- `isLegalMove` and `isLegalCommanderMove` remain non-generic by design
- They work at system boundaries where board types may be mixed
- This is acceptable since they return booleans, not coordinates

## Recommendations

### Completed ✅

1. ✅ **Made all coordinate-returning functions generic**: All functions that return coordinates now use `<TBoard extends Board>` to preserve type information
2. ✅ **Fixed `getForwardSpace`**: Now generic, preserves type throughout call chain
3. ✅ **Fixed `filterUndefinedSpaces`**: Now generic, preserves coordinate type
4. ✅ **Made all area functions generic**: All area calculation functions now preserve type information

### Future Considerations

1. **Consider making boundary functions generic**: `isLegalMove` and `isLegalCommanderMove` could potentially use generics, but current pattern is acceptable since they're at system boundaries
2. **Consider `getLinesFromUnit`**: Takes `UnitWithPlacement<Board>` (union) but could take `UnitWithPlacement<TBoard>` with generics if needed for type safety

## Current State Assessment

✅ **Excellent**: All coordinate-returning functions now use generics to preserve type information throughout call chains

✅ **Type-safe**: Type assertions are properly encapsulated in helper functions (`getBoardSpace`, `getBoardConfig`), keeping calling code clean

✅ **Consistent**: Single pattern applied across all board space functions - use generics to preserve board type

✅ **Clean**: Type information flows naturally through function calls without loss

## Conclusion

The codebase now has a **consistent, type-safe pattern** throughout:

- All coordinate-returning functions use `<TBoard extends Board>` generics
- Type information is preserved through entire call chains
- Type assertions are properly encapsulated in helper functions (`getBoardSpace`, `getBoardConfig`)
- Boundary functions (`isLegalMove`, `isLegalCommanderMove`) remain non-generic by design for flexibility at system boundaries

**Result**: Repetitive type declarations eliminated, compile-time coordinate validation throughout, and clean type-safe code with properly encapsulated type assertions! 🎉

## Helper Functions Pattern

### `getBoardConfig<TBoard extends Board>`

**Purpose**: Encapsulates the type assertion needed to get the correct config for a board type.

**Before** (type assertion in calling code):

```typescript
const config = boardConfigMap[board.boardType] as BoardConfig<
  BoardCoordinate<TBoard>
>;
```

**After** (encapsulated in helper):

```typescript
const config = getBoardConfig(board); // Clean, no assertion needed
```

**Benefit**:

- Single source of truth for config type assertion
- Calling code is cleaner and more readable
- Easier to maintain if the pattern needs to change
