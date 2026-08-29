# Game

Composed domain models for a running game. Import as `@game`.

Same declaration-only role as `@entities` (schemas, interfaces, types), but these depend on entity primitives and assemble the sequencing tree. Follow the schema-first pattern in [`../entities/README.md`](../entities/README.md).

Visibility (`authoritative` | `whiteSeen` | `blackSeen`) lives on `CardState` and is threaded on `Game` / `GameState`. Board size stays on `boardState.boardType`. Mode army composition is validated in `@legality`, not here.

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

## Modules

| Module            | Role                                                                        |
| ----------------- | --------------------------------------------------------------------------- |
| `game/`           | Full game record (mode, players, armies, `gameState`) by visibility         |
| `gameState/`      | Runtime state by visibility, plus ownership helper types                    |
| `cardState/`      | Owned/hidden piles and visibility `CardState` union                         |
| `roundState.ts`   | Current round slice (phase + event stream)                                  |
| `phases/`         | Phase/step state in play order                                              |
| `substeps/`       | Nested resolution states (see [`substeps/README.md`](./substeps/README.md)) |
| `commitment.ts`   | Pending / completed / declined commitments                                  |
| `attackResult.ts` | Attack outcome value                                                        |
| `typeGuards/`     | Narrowing helpers (e.g. authoritative game state)                           |

### `phases/`

`playCards` → `moveCommanders` → `issueCommands` → `resolveMelee` → `cleanup`, plus the `PhaseState` union.

### `substeps/`

Composable pieces (`attackApply`, `retreat`, `rout`, `reverse`, `engagement`) and context-specific ones (`movementResolution`, `rangedAttackResolution`, `meleeResolution`, `rallyResolution`, `commandResolution`).
