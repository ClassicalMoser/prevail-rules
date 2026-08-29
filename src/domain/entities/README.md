# Entities

Domain models for the Prevail rules engine. Import as `@entities`.

## Layout conventions

- **Declarations first**: schemas, interfaces, and types. No business logic in entity modules.
- **Functions**: almost only `typeGuards/` (narrowing). Thin lookups like `getCoordinateLayout` are fine; mode composition and list-building refines live in `@legality`.
- **Schema `superRefine`**: allowed for shape invariants (e.g. army uniqueness, board key sets). Not for game-mode or turn rules.
- **No colocated tests**: specs for `typeGuards` live in [`../testing/entityTypeGuards/`](../testing/entityTypeGuards/).

Sequencing and composed game state live in [`../game/`](../game/README.md) (`@game`).

## Schema-first pattern

Every entity follows this split so runtime validation, IDE types, and `isolatedDeclarations` stay aligned:

```typescript
// 1. Manual interface (public API / IDE)
export interface Entity {
  id: string;
  name: string;
}

// 2. Unannotated schema object (inference for drift checks)
const _entitySchemaObject = z.object({
  id: z.uuid(),
  name: z.string(),
});

// 3. Inferred type (never export)
type EntitySchemaType = z.infer<typeof _entitySchemaObject>;

// 4. Exported schema annotated for isolatedDeclarations
/** The schema for an entity. */
export const entitySchema: z.ZodType<Entity> = _entitySchemaObject;

// 5. AssertExact (never export)
const _assertExact: AssertExact<Entity, EntitySchemaType> = true;
```

**Declaration order:** exported literals → interface/type → `_…SchemaObject` → inferred type → exported `z.ZodType<T>` (+ JSDoc) → `AssertExact`.

**Required:**

- Annotate **exports** with `z.ZodType<T>` (or `z.ZodObject<…>` for members of a `discriminatedUnion`).
- Assert against `_fooSchemaObject`, never `typeof fooSchema`. The export annotation erases the inferred shape.
- Never export `AssertExact` checks or `*SchemaType` aliases.
- Define the interface before the schema when that avoids cycles.
- **Skip AssertExact for `z.enum(literals)` when the type is `(typeof literals)[number]`.** Both sides already share one source; the assert cannot catch drift.

See `card/commandCard.ts` for a full example. Discriminated unions use the same pattern (see `unitPresence/unitPresence.ts`). Simple enum catalogs look like `attackType/attackType.ts`.

### Why the unannotated / annotated split?

`isolatedDeclarations` needs an explicit type on the export. Putting `z.ZodType<T>` only on the export satisfies that, while the internal object stays free for `z.infer` + `AssertExact`, so type/schema drift fails at compile time.

## Discriminated unions

`z.discriminatedUnion` needs plain Zod object schemas (not `z.ZodType<T>` wrappers). Variant files export `z.ZodObject<…>`; the parent exports `z.ZodType<Union>` over an unconstrained `_…SchemaObject`.

### UnitPresence

```typescript
export type UnitPresence =
  | NoneUnitPresence // presenceType: 'none'
  | SingleUnitPresence // 'single'
  | EngagedUnitPresence; // 'engaged'
```

Type guards in `typeGuards/`: `hasNoUnit`, `hasSingleUnit`, `hasEngagedUnits`, plus `areSameSide` for unit ownership.

## Board size vs visibility (when to type-parameterize)

**Board size is state, not a type parameter.** `boardType` indexes a layout map:

```typescript
getCoordinateLayout(board); // → coordinateLayoutMap[board.boardType]
```

`Coordinate` is the union across all sizes (extensionally the large set). Completeness is enforced by `boardSchema.superRefine` and geometry helpers, not by per-size TypeScript types.

**Why `partialRecord` + `superRefine` instead of per-size schemas?**  
`z.object(shape)` infers literal keys. Factories and unions that touch a per-size object schema leak those keys through inference and fight the unified `Board` type. One wide schema plus a refine against `coordinateLayoutMap[boardType]` keeps the TypeScript type wide and still rejects wrong keys at parse time.

**`CoordinateLayout` method syntax is deliberate** (`createCoordinate`, `getRowIndex`, …) so parameter checks stay bivariant and per-size layouts stay assignable to the shared default. Property or function-field syntax breaks the layout map.

**Visibility earns a type parameter; board size did not.**  
Visibility (`authoritative` | `whiteSeen` | `blackSeen`) constrains which card fields are readable or writable, so `GameStateForVisibility<V>` / `CardState` remove casts at call sites. Board size only asserted completeness; threading it as a type argument inflated signatures without cutting casts. Keep a parameter only when it narrows what callers may pass or read.

## What lives here

| Area | Notes |
| --- | --- |
| Board | `Board`, `BoardSpace`, `Coordinate`, layouts |
| Units | `UnitType` / `UnitInstance`, facing, placement, `UnitPresence` |
| Cards | `CommandCard`, `Command`, modifiers / restrictions / support |
| Army | `Army` / `UnitCount` (shape + uniqueness only; mode composition in `@legality`) |
| Players / modes | `Player`, `PlayerSide`, `GameMode` |
| Shared values | `AttackType`, `EngagementType`, `Line`, … |

**Not here:** `Game` / `GameState` / `CardState` / phases (`@game`); `ValidationResult` (`@utils`); army mode limits (`@legality`).
