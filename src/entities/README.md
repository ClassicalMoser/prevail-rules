# Entities

This directory contains the domain models (entities) for the Prevail game rules engine.

## Schema-First Type Safety Pattern

All entities in this directory follow a **schema-first approach** that ensures both runtime validation and compile-time type safety.

### Pattern Structure

```typescript
// 1. Define Zod schema for runtime validation
export const entitySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  // ... other fields
});

// 2. Infer type from schema
type EntitySchemaType = z.infer<typeof entitySchema>;

// 3. Define interface manually (for better IDE support)
export interface Entity {
  id: string;
  name: string;
  // ... other fields
}

// 4. Assert type match at compile time
const _assertExact: AssertExact<Entity, EntitySchemaType> = true;
```

### Why This Pattern?

1. **Runtime Validation**: Zod schemas validate data at runtime (e.g., from API responses)
2. **Compile-Time Safety**: TypeScript interfaces provide type checking during development
3. **Type-Schema Alignment**: The `AssertExact` assertion ensures the interface matches the schema
4. **Single Source of Truth**: The schema is the authoritative definition

### Benefits

- ✅ Catch type mismatches at compile time
- ✅ Validate data at runtime
- ✅ Better IDE autocomplete (interfaces are more descriptive than inferred types)
- ✅ Self-documenting code (schema shows validation rules)

### Example

See `src/entities/card/card.ts` for a complete example of this pattern.

## Discriminated Unions

Many entities use **discriminated unions** for type-safe variants.

### UnitPresence

Represents three possible states of unit presence in a board space:

```typescript
export type UnitPresence =
  | NoneUnitPresence // No unit
  | SingleUnitPresence // One unit
  | EngagedUnitPresence; // Two units engaged
```

Each variant has a `presenceType` field that acts as the discriminator.

**Type guards** are available in `@validation`:

- `hasNoUnit(unitPresence)` - checks for none
- `hasSingleUnit(unitPresence)` - checks for single
- `hasEngagedUnits(unitPresence)` - checks for engaged

### Board Types

Board types use discriminated unions based on `boardType`:

```typescript
export type Board = StandardBoard | SmallBoard | LargeBoard;
```

Each board type has different coordinate systems, enforced by the generic `BoardCoordinate<T>` type.

## Generic Board Types

The board system uses TypeScript generics to ensure coordinate type safety:

```typescript
export type BoardCoordinate<T extends Board> = T extends StandardBoard
  ? StandardBoardCoordinate
  : T extends SmallBoard
    ? SmallBoardCoordinate
    : T extends LargeBoard
      ? LargeBoardCoordinate
      : never;
```

This prevents using the wrong coordinate type with a board:

```typescript
// ✅ Type-safe
const standardBoard: StandardBoard = createEmptyStandardBoard();
const space = getBoardSpace(standardBoard, 'E-5'); // StandardBoardCoordinate

// ❌ Type error
const smallCoord: SmallBoardCoordinate = 'A-1';
const space = getBoardSpace(standardBoard, smallCoord); // Error!
```

## Entity Categories

### Core Game Entities

- `Game` - Complete game configuration
- `GameState` - Current game state (round, phase, board, etc.)
- `Player` - Player information

### Board Entities

- `Board` - Game board (discriminated union of standard/small/large)
- `BoardSpace` - Individual space on the board
- `BoardCoordinate` - Coordinate type (generic based on board type)

### Unit Entities

- `UnitType` - Unit definition (stats, traits, etc.)
- `UnitInstance` - Specific instance of a unit on the board
- `UnitPresence` - Unit presence in a space (discriminated union)
- `UnitFacing` - Direction a unit is facing

### Card Entities

- `Card` - Command card
- `Command` - Command on a card
- `CardState` - State of player cards

### Sequence Entities

- `Phase` - Game phase
- `Round` - Game round

## Best Practices

1. **Always use the schema-first pattern** for new entities
2. **Use discriminated unions** for type-safe variants
3. **Add JSDoc comments** explaining the entity's purpose
4. **Use `AssertExact`** to verify type-schema alignment
5. **Export schemas** for runtime validation
6. **Export types** for compile-time checking
