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

// 2. Define unconstrained schema object (for type inference)
const _entitySchemaObject = z.object({
  id: z.string().uuid(),
  name: z.string(),
  // ... other fields
});

// 3. Infer type from unconstrained schema object
type EntitySchemaType = z.infer<typeof _entitySchemaObject>;

// 4. Export schema with constraint for isolatedDeclarations compatibility
/**
 * The schema for an entity.
 */
export const entitySchema: z.ZodType<Entity> = _entitySchemaObject;

// 5. Assert type match at compile time (bidirectional check)
const _assertExact: AssertExact<Entity, EntitySchemaType> = true;
```

**Declaration Ordering Convention:**

1. **Exported interface/type** - Public API, what consumers see
2. **Unexported schema object** - Implementation detail for type inference
3. **Inferred type** - Implementation detail for AssertExact
4. **Exported schema with JSDoc** - Public API with documentation
5. **AssertExact check** - Internal verification (never exported)

**Key Requirements:**

- Use `z.ZodType<T>` constraint on **exported** schemas for `isolatedDeclarations` compatibility
- Define interface before schema to avoid circular references
- Infer type from **unconstrained** schema object to ensure type drift detection works
- **Never export** `AssertExact` assertions or inferred `SchemaType` types (causes `isolatedDeclarations` errors)
- Place JSDoc comments on the **exported** schema, not the unexported schema object

### Why This Pattern?

1. **Runtime Validation**: Zod schemas validate data at runtime (e.g., from API responses)
2. **Compile-Time Safety**: TypeScript interfaces provide type checking during development
3. **Type-Schema Alignment**: The `AssertExact` assertion ensures bidirectional type equality
4. **Type Drift Detection**: Inferring from unconstrained schema object ensures `AssertExact` catches mismatches
5. **isolatedDeclarations Compatibility**: `z.ZodType<T>` constraint on exports provides explicit type annotations required for fast declaration file generation
6. **Build Performance**: Explicit annotations enable faster builds (tsdown can work directly from declarations)

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

For discriminated unions, follow the same pattern with an unconstrained schema object:

```typescript
// 1. Define the union type
export type UnitPresence =
  | NoneUnitPresence
  | SingleUnitPresence
  | EngagedUnitPresence;

// 2. Define unconstrained discriminated union schema object
const _unitPresenceSchemaObject = z.discriminatedUnion('presenceType', [
  noneUnitPresenceSchema,
  singleUnitPresenceSchema,
  engagedUnitPresenceSchema,
]);

// 3. Infer type from unconstrained schema object
type UnitPresenceSchemaType = z.infer<typeof _unitPresenceSchemaObject>;

// 4. Export schema with constraint
/**
 * The schema for unit presence in a space.
 */
export const unitPresenceSchema: z.ZodType<UnitPresence> =
  _unitPresenceSchemaObject;

// 5. Assert type match
const _assertExactUnitPresence: AssertExact<
  UnitPresence,
  UnitPresenceSchemaType
> = true;
```

**Why this pattern?**

- `z.discriminatedUnion` requires plain Zod object schemas (not `z.ZodType<T>` wrappers)
- The parent union uses `z.ZodType<T>` on export for `isolatedDeclarations` compatibility
- Individual schemas use explicit `z.ZodObject<...>` annotations for type safety
- Inferring from unconstrained schema object ensures type drift detection works

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
2. **Follow the declaration ordering convention** - interface, schema object, inferred type, exported schema, AssertExact
3. **Use `z.ZodType<T>` constraint** on **exported** schemas for `isolatedDeclarations` compatibility
4. **Infer from unconstrained schema object** to ensure type drift detection works correctly
5. **Never export** `AssertExact` assertions or inferred `SchemaType` types
6. **Place JSDoc on exported schema**, not the unexported schema object
7. **Use discriminated unions** for type-safe variants (with `z.ZodObject<...>` for individual schemas)
8. **Define interfaces before schemas** to avoid circular references
9. **Export schemas** for runtime validation
10. **Export types/interfaces** for compile-time checking

### Type Annotation Rules

- ✅ Use `z.ZodType<T>` for schema constraints
- ✅ Use `z.ZodObject<...>` for explicit object schema types
- ✅ Use explicit array types: `readonly Type[]` instead of inferred types
- ❌ Never use `typeof` in type annotations (extract values separately if needed)
- ❌ Never use `any` type assertions
