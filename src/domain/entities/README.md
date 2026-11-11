# Entities

Domain models for the Prevail rules engine. Import as `@entities`.

## Layout conventions

- **Declarations first**: schemas, interfaces, and types. No business logic in entity modules.
- **Shape only**: a schema says what a value looks like. Every rule about which values are allowed, from army uniqueness to a whole board, is a refine in `@legality`. Reads over a value, type guards included, are `@queries`.

Sequencing and composed game state live in [`../game/`](../game/README.md) (`@game`).

## Barrels

Every `index.ts` re-exports by hand (no `export *`).

- **One comment per export**, on the line above it, saying what that name is. Group a `export { a, b }` only when those names are one idea.
- **Order is how you would explain the folder**, not alphabetical. Put the simple or underlying pieces first, then the ones built from them, then a facing-relative or later group if the folder has one. Parent barrels list a folder's names in that same order.

Example: `queries/board/adjacency/` exports orthogonal neighbors, then diagonal, then all eight; then front, flank, and rear.

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
- Use `.strict()` on every `z.object(…)` so unknown keys fail at parse time (default Zod strips them).
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

To narrow a presence, use `hasNoUnit`, `hasSingleUnit` and `hasEngagedUnits` in `@queries`.

## Board size vs visibility (when to type-parameterize)

**Board size is state, not a type parameter.** `boardType` selects a layout, through `getCoordinateLayout` in `@factories`:

```typescript
getCoordinateLayout(board); // → coordinateLayoutMap[board.boardType]
```

`Coordinate` is the union across all sizes (extensionally the large set). Completeness is enforced by `refineBoardLayout` in `@legality` and geometry helpers, not by per-size TypeScript types.

**Why one wide `partialRecord` instead of per-size schemas?**  
`z.object(shape)` infers literal keys. Factories and unions that touch a per-size object schema leak those keys through inference and fight the unified `Board` type. One wide schema keeps the TypeScript type wide; `refineBoardLayout` in `@legality` rejects wrong keys at parse time.

**Layout callables take `string`, not size-branded letter unions.** Board size lives on the layout **value** (`rowLetters` / `columnNumbers`). Layouts join parts into a {@link Coordinate} internally; callers do not re-prove "this is a small-board row." That keeps property-signature typing and avoids treating size as a type parameter again.

**Visibility earns a type parameter; board size did not.**  
Visibility (`authoritative` | `whiteSeen` | `blackSeen` | `spectator`) constrains which card fields are readable or writable, so `GameState` and `CardState` carry a `visibility` tag that a `switch` narrows, removing casts at call sites. A state's tag and its card state are fixed together by each variant, so the two cannot disagree. `spectator` hides both hands. Board size only asserted completeness; threading it as a type argument inflated signatures without cutting casts. Keep a parameter only when it narrows what callers may pass or read.

## What lives here

| Area            | Notes                                                                           |
| --------------- | ------------------------------------------------------------------------------- |
| Board           | `Board`, `BoardSpace`, `Coordinate`, layouts                                    |
| Units           | `UnitType` / `UnitInstance`, facing, placement, `UnitPresence`                  |
| Cards           | `CommandCard`, `Command`, modifiers / restrictions / support                    |
| Army            | `Army` / `UnitCount` (shape + uniqueness only; mode composition in `@legality`) |
| Players / modes | `Player`, `PlayerSide`, `GameMode`                                              |
| Shared values   | `AttackType`, `EngagementType`, `Line`, …                                       |

**Not here:** `Game` / `GameState` / `CardState` / phases (`@game`); `ValidationResult` (`@utils`); army mode limits (`@legality`).
