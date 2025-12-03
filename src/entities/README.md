# Entities

This directory contains the domain models (entities) for the Prevail game rules engine.

## Schema-First Type Safety Pattern

All entities in this directory follow a **schema-first approach** that ensures both runtime validation and compile-time type safety.

### Pattern Structure

```typescript
// 1. Define interface manually (for better IDE support)
export interface Entity {
  id: string;
  name: string;
  // ... other fields
}

// 2. Define Zod schema with z.ZodType<T> constraint for isolatedDeclarations compatibility
export const entitySchema: z.ZodType<Entity> = z.object({
  id: z.string().uuid(),
  name: z.string(),
  // ... other fields
});

// 3. Infer type from schema
type EntitySchemaType = z.infer<typeof entitySchema>;

// 4. Assert type match at compile time (bidirectional check)
const _assertExact: AssertExact<Entity, EntitySchemaType> = true;
```

**Key Requirements:**

- Use `z.ZodType<T>` constraint on schemas for `isolatedDeclarations` compatibility
- Define interface before schema to avoid circular references
- Use explicit type annotations (avoid `typeof` in type annotations)
- Keep `AssertExact` for bidirectional type safety

### Why This Pattern?

1. **Runtime Validation**: Zod schemas validate data at runtime (e.g., from API responses)
2. **Compile-Time Safety**: TypeScript interfaces provide type checking during development
3. **Type-Schema Alignment**: The `AssertExact` assertion ensures bidirectional type equality
4. **isolatedDeclarations Compatibility**: `z.ZodType<T>` constraint provides explicit type annotations required for fast declaration file generation
5. **Build Performance**: Explicit annotations enable faster builds (tsdown can work directly from declarations)

### Benefits

- ✅ Catch type mismatches at compile time
- ✅ Validate data at runtime
- ✅ Better IDE autocomplete (interfaces are more descriptive than inferred types)
- ✅ Self-documenting code (schema shows validation rules)
- ✅ Fast build times with `isolatedDeclarations` enabled
- ✅ Explicit type annotations improve tooling performance

### Example

See `src/entities/card/card.ts` for a complete example of this pattern.

## Discriminated Unions

Many entities use **discriminated unions** for type-safe variants.

### Pattern for Discriminated Unions

For discriminated unions, individual schemas use `z.ZodObject<...>` with explicit type annotations, while the parent union uses `z.ZodType<T>`:

```typescript
// Individual schema (plain Zod object, not z.ZodType<T>)
export const noneUnitPresenceSchema: z.ZodObject<{
  presenceType: z.ZodLiteral<'none'>;
}> = z.object({
  presenceType: z.literal('none' as const),
});

// Parent discriminated union (uses z.ZodType<T>)
export const unitPresenceSchema: z.ZodType<UnitPresence> = z.discriminatedUnion(
  'presenceType',
  [noneUnitPresenceSchema, singleUnitPresenceSchema, engagedUnitPresenceSchema],
);
```

**Why this pattern?**

- `z.discriminatedUnion` requires plain Zod object schemas (not `z.ZodType<T>` wrappers)
- The parent union uses `z.ZodType<T>` for `isolatedDeclarations` compatibility
- Individual schemas use explicit `z.ZodObject<...>` annotations for type safety

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
2. **Use `z.ZodType<T>` constraint** on schemas for `isolatedDeclarations` compatibility
3. **Define interfaces before schemas** to avoid circular references
4. **Use explicit type annotations** - avoid `typeof` in type annotations
5. **Use discriminated unions** for type-safe variants (with `z.ZodObject<...>` for individual schemas)
6. **Add JSDoc comments** explaining the entity's purpose
7. **Use `AssertExact`** to verify bidirectional type-schema alignment
8. **Export schemas** for runtime validation
9. **Export types** for compile-time checking

### Type Annotation Rules

- ✅ Use `z.ZodType<T>` for schema constraints
- ✅ Use `z.ZodObject<...>` for explicit object schema types
- ✅ Use explicit array types: `readonly Type[]` instead of inferred types
- ❌ Never use `typeof` in type annotations (extract values separately if needed)
- ❌ Never use `any` type assertions
