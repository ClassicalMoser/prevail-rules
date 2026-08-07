# Game

Composed domain models for a running game: configuration, runtime state, phases, and nested resolution substeps.

These are still **declaration-only** modules (schemas, interfaces, types) — same role as `@entities`, but they depend on entity primitives (`Board`, `CommandCard`, `UnitInstance`, …) and assemble the sequencing tree. Import as `@game`.

## Conventions

Follow the schema-first pattern in [`../entities/README.md`](../entities/README.md):

- Unannotated `_…SchemaObject` for inference → exported `z.ZodType<T>` / `z.ZodObject<…>` → `AssertExact` against the internal object
- Discriminated unions for phase/step/visibility variants
- Declarations only — no business logic here (queries, validation, and transforms live elsewhere)

Visibility (`authoritative` | `whiteSeen` | `blackSeen`) is threaded as a type parameter on `Game` / `GameState` because it constrains which card fields are readable. Board size stays on `boardState.boardType` (see entities README).

## Outline

```
Game / GameForVisibility
  └─ GameState / GameStateForVisibility
       ├─ boardState, cardState, reserved/routed units, …
       └─ RoundState
            └─ PhaseState (discriminated on phase)
                 └─ step + nested resolution state
                      └─ Substeps (movement, melee, attack apply, engagement, rally, …)
```

### Top level

| Module            | Role                                                  |
| ----------------- | ----------------------------------------------------- |
| `game.ts`         | Full game record (mode, players, armies, `gameState`) |
| `gameState.ts`    | Runtime state for a visibility regime                 |
| `roundState.ts`   | Current round slice (phase + event stream)            |
| `commitment.ts`   | Pending / completed / declined commitments            |
| `attackResult.ts` | Attack outcome value                                  |

### `phases/`

Per-phase state and step literals: `playCards`, `moveCommanders`, `issueCommands`, `resolveMelee`, `cleanup`, plus the `PhaseState` union in `phases.ts`.

### `substeps/`

Nested resolution states used inside phase steps. See [`substeps/README.md`](./substeps/README.md) for composable vs context-specific substeps and the nesting hierarchy (engagement, retreat, rout, rally, …).
